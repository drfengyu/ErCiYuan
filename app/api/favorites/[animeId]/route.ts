import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { fail, ok, requireApiUser } from '@/lib/api';
import { getDb } from '@/lib/db';
import { favorites } from '@/lib/db/schema';
import { findAnime } from '@/lib/queries';

export const dynamic = 'force-dynamic';

async function exists(userId: string, animeId: string) {
  const { db } = await getDb();
  const rows = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.animeId, animeId)))
    .limit(1);
  return rows.length > 0;
}

export async function GET(_req: Request, ctx: { params: Promise<{ animeId: string }> }) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录', 401);
  const { animeId } = await ctx.params;
  return ok({ isCollect: await exists(session.userId, animeId) });
}

export async function POST(_req: Request, ctx: { params: Promise<{ animeId: string }> }) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录', 401);
  const { animeId } = await ctx.params;
  if (!(await findAnime(animeId))) return fail('动漫不存在', 404);
  if (!(await exists(session.userId, animeId))) {
    const { db } = await getDb();
    await db.insert(favorites).values({
      id: randomUUID().slice(0, 12),
      userId: session.userId,
      animeId,
      createdAt: new Date().toISOString(),
    });
  }
  return ok({ isCollect: true }, '收藏成功');
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ animeId: string }> }) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录', 401);
  const { animeId } = await ctx.params;
  const { db } = await getDb();
  await db.delete(favorites).where(and(eq(favorites.userId, session.userId), eq(favorites.animeId, animeId)));
  return ok({ isCollect: false }, '已取消收藏');
}
