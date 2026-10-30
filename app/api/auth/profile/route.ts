import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok, requireApiUser } from '@/lib/api';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

const schema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(24),
  avatar: z.string().max(500).default(''),
});

export async function POST(req: Request) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录', 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? '参数错误');

  const { db } = await getDb();
  await db.update(users).set({ nickname: parsed.data.nickname, avatar: parsed.data.avatar }).where(eq(users.id, session.userId));
  return ok(null, '资料已更新');
}
