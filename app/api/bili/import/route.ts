import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok, requireApiAdmin } from '@/lib/api';
import { fetchBiliSeason } from '@/lib/bili';
import { getDb } from '@/lib/db';
import { anime, chapters, videos } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

const schema = z.object({
  animeId: z.string().min(1).max(64),
  url: z.string().min(1).max(500),
});

/** GET ?url= 只预览，供后台确认分集后再导入。 */
export async function GET(req: Request) {
  if (!(await requireApiAdmin())) return fail('需要管理员权限', 403);
  const url = new URL(req.url).searchParams.get('url') ?? '';
  const result = await fetchBiliSeason(url);
  if (!result.ok) return fail(result.error, 502);
  return ok(result.season);
}

export async function POST(req: Request) {
  if (!(await requireApiAdmin())) return fail('需要管理员权限', 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? '参数错误');
  const { animeId, url } = parsed.data;

  const { db } = await getDb();
  const [row] = await db.select().from(anime).where(eq(anime.id, animeId)).limit(1);
  if (!row) return fail('动漫不存在', 404);

  const fetched = await fetchBiliSeason(url);
  if (!fetched.ok) return fail(fetched.error, 502);
  const season = fetched.season;
  if (season.episodes.length === 0) return fail('该番剧没有可用分集', 502);

  const chapterId = `${animeId}-bili-ss${season.seasonId}`;
  const [existingChapter] = await db.select({ id: chapters.id }).from(chapters).where(eq(chapters.id, chapterId)).limit(1);
  if (!existingChapter) {
    await db.insert(chapters).values({
      id: chapterId,
      animeId,
      title: season.seasonTitle || season.title || 'B 站番剧',
      sort: 0,
    });
  }

  const existingVideos = await db.select({ id: videos.id }).from(videos).where(eq(videos.animeId, animeId));
  const known = new Set(existingVideos.map((v) => v.id));

  let created = 0;
  for (const [index, episode] of season.episodes.entries()) {
    const id = `ep${episode.epId}`;
    if (known.has(id)) continue;
    await db.insert(videos).values({
      id,
      animeId,
      chapterId,
      title: `${episode.epNo}. ${episode.name}`,
      sourceUrl: episode.shareUrl,
      duration: episode.durationSec,
      // 这里只是官方页入口，不该被本站的虚拟货币挡住
      isFree: true,
      sort: index,
      playCount: 0,
    });
    created += 1;
  }

  // 把 B 站官方页补进外链，详情页直接有入口
  const links = JSON.parse(row.externalLinks || '[]') as { site: string; url: string; type: string }[];
  const shareUrl = `https://www.bilibili.com/bangumi/play/ss${season.seasonId}`;
  if (season.seasonId && !links.some((l) => l.url === shareUrl)) {
    const next = [...links, { site: 'Bilibili 番剧', url: shareUrl, type: 'STREAMING' }].slice(0, 10);
    await db.update(anime).set({ externalLinks: JSON.stringify(next), updatedAt: new Date().toISOString() }).where(eq(anime.id, animeId));
  }

  return ok(
    { seasonId: season.seasonId, title: season.title, total: season.total, created, skipped: season.episodes.length - created },
    `导入 ${season.title}：新增 ${created} 集，跳过 ${season.episodes.length - created} 集（已存在）`,
  );
}
