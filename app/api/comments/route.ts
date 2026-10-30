import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok, requireApiUser } from '@/lib/api';
import { getDb } from '@/lib/db';
import { comments, users } from '@/lib/db/schema';
import { findAnime, listComments } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const schema = z.object({
  animeId: z.string().min(1),
  content: z.string().min(1, '评论内容不能为空').max(500),
  parentId: z.string().max(64).default(''),
});

export async function GET(req: Request) {
  const animeId = new URL(req.url).searchParams.get('animeId');
  if (!animeId) return fail('缺少 animeId');
  return ok({ items: await listComments(animeId) });
}

export async function POST(req: Request) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录后再评论', 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? '参数错误');
  const { animeId, content, parentId } = parsed.data;

  if (!(await findAnime(animeId))) return fail('动漫不存在', 404);

  const { db } = await getDb();
  if (parentId) {
    const parent = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, parentId)).limit(1);
    if (parent.length === 0) return fail('父评论不存在', 404);
  }

  const [author] = await db.select({ nickname: users.nickname, avatar: users.avatar }).from(users).where(eq(users.id, session.userId)).limit(1);
  const id = randomUUID().slice(0, 12);
  const createdAt = new Date().toISOString();
  await db.insert(comments).values({ id, animeId, userId: session.userId, parentId, content, createdAt });

  return ok(
    {
      id,
      parentId,
      content,
      createdAt,
      nickname: author?.nickname ?? '匿名用户',
      avatar: author?.avatar || '/assets/img/avatar-boy.gif',
    },
    '评论成功',
  );
}
