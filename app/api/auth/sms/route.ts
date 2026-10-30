import { randomUUID } from 'node:crypto';
import { and, desc, eq, gt } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok } from '@/lib/api';
import { getDb } from '@/lib/db';
import { smsCodes } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

const MOBILE = /^1[3-9]\d{9}$/;
const COOLDOWN_MS = 60_000;

export async function POST(req: Request) {
  const parsed = z.object({ mobile: z.string().regex(MOBILE, '手机号格式不正确') }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('手机号格式不正确');
  const { mobile } = parsed.data;

  const { db } = await getDb();
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const recent = await db
    .select()
    .from(smsCodes)
    .where(and(eq(smsCodes.mobile, mobile), gt(smsCodes.createdAt, since)))
    .limit(1);
  if (recent.length > 0) return fail('验证码发送过于频繁，请 60 秒后重试', 429);

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const now = new Date();
  await db.insert(smsCodes).values({
    id: randomUUID().slice(0, 12),
    mobile,
    code,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 5 * 60_000).toISOString(),
    used: false,
  });

  const exposeCode = process.env.NODE_ENV !== 'production' || process.env.DEMO_SMS === '1';
  if (!exposeCode) return ok(null, '验证码已发送');

  // 未接入真实短信通道：演示环境直接把验证码返回，便于本地/预览体验。
  return ok({ code }, `演示验证码已“发送”到 ${mobile}`);
}
