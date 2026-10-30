import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AUTH_COOKIE, authCookieOptions, createSessionToken, type Role } from '@/lib/auth';
import { fail, ok } from '@/lib/api';
import { findUserByMobile } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const schema = z.object({
  mobile: z.string().min(6, '请输入手机号'),
  password: z.string().min(1, '请输入密码'),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? '参数错误');

  const user = await findUserByMobile(parsed.data.mobile);
  if (!user || !bcrypt.compareSync(parsed.data.password, user.password)) return fail('手机号或密码错误', 401);
  if (user.disabled) return fail('账号已被禁用，请联系管理员', 403);

  const token = await createSessionToken(user.id, user.role as Role);
  const res = ok(
    {
      userInfo: { id: user.id, nickname: user.nickname, avatar: user.avatar, role: user.role },
      redirect: user.role === 'ADMIN' ? '/admin' : '/',
    },
    '登录成功',
  );
  res.cookies.set(AUTH_COOKIE, token, authCookieOptions);
  return res;
}
