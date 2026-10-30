import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { AUTH_COOKIE, authCookieOptions, createSessionToken } from '@/lib/auth';
import { fail, ok } from '@/lib/api';
import { getDb } from '@/lib/db';
import { smsCodes, users } from '@/lib/db/schema';
import { findUserByMobile } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const MOBILE = /^1[3-9]\d{9}$/;

const schema = z
  .object({
    nickname: z.string().min(1, '请填写昵称').max(24),
    mobile: z.string().regex(MOBILE, '手机号格式不正确'),
    code: z.string().min(4, '请填写验证码').max(8),
    password: z.string().min(6, '密码至少 6 位').max(64),
  })
  .refine((v) => v.password !== v.mobile.slice(-6), { message: '密码不能与手机号后 6 位相同' });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? '参数错误');
  const { nickname, mobile, code, password } = parsed.data;

  if (await findUserByMobile(mobile)) return fail('该手机号已注册', 409);

  const { db } = await getDb();
  const [ticket] = await db
    .select()
    .from(smsCodes)
    .where(and(eq(smsCodes.mobile, mobile), eq(smsCodes.used, false)))
    .orderBy(desc(smsCodes.createdAt))
    .limit(1);

  const demoMode = process.env.NODE_ENV !== 'production' || process.env.DEMO_SMS === '1';
  const verified = ticket && ticket.code === code && new Date(ticket.expiresAt).getTime() > Date.now();
  if (!verified) {
    if (demoMode && code === '123456') {
      // 演示模式允许万能验证码
    } else {
      return fail('验证码错误或已过期', 400);
    }
  }
  if (ticket && verified) {
    await db.update(smsCodes).set({ used: true }).where(eq(smsCodes.id, ticket.id));
  }

  const id = randomUUID().slice(0, 12);
  await db.insert(users).values({
    id,
    mobile,
    nickname,
    avatar: '/assets/img/avatar-boy.gif',
    password: bcrypt.hashSync(password, 10),
    role: 'MEMBER',
    disabled: false,
    createdAt: new Date().toISOString(),
  });

  const token = await createSessionToken(id, 'MEMBER');
  const res = ok({ userInfo: { id, nickname, role: 'MEMBER' }, redirect: '/' }, '注册成功');
  res.cookies.set(AUTH_COOKIE, token, authCookieOptions);
  return res;
}
