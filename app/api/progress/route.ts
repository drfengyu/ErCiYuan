import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok, requireApiUser } from '@/lib/api';
import { getDb } from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { listInProgress, saveProgress } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const schema = z.object({
  animeId: z.string().min(1).max(64),
  videoId: z.string().min(1).max(64),
  positionSec: z.coerce.number().min(0).max(86_400),
  durationSec: z.coerce.number().min(0).max(86_400).default(0),
});

export async function GET() {
  const session = await requireApiUser();
  if (!session) return fail('请先登录', 401);
  return ok({ items: await listInProgress(session.userId) });
}

export async function POST(req: Request) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录后再记录进度', 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? '参数错误');

  const { animeId, videoId, positionSec, durationSec } = parsed.data;
  const { db } = await getDb();
  const [video] = await db.select({ id: videos.id, animeId: videos.animeId }).from(videos).where(eq(videos.id, videoId)).limit(1);
  if (!video || video.animeId !== animeId) return fail('剧集与该动漫不匹配', 404);

  return ok(await saveProgress(session.userId, { animeId, videoId, positionSec, durationSec }), '进度已记录');
}
