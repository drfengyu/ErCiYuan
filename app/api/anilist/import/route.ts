import { randomUUID } from 'node:crypto';
import { eq, like } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok, requireApiAdmin } from '@/lib/api';
import { anilistById, anilistDescriptionToText } from '@/lib/anilist';
import { matchBangumi } from '@/lib/bangumi';
import { getDb } from '@/lib/db';
import { trailerEmbed } from '@/lib/media';
import { anime, chapters, makers, videos } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

const schema = z.object({
  anilistId: z.coerce.number().min(1, '缺少 AniList ID'),
  categoryId: z.string().min(1).default('cat-tv'),
  episodeCount: z.coerce.number().min(0).max(48).default(3),
  price: z.coerce.number().min(0).default(0),
  featured: z.boolean().default(false),
});

async function resolveMaker(db: Awaited<ReturnType<typeof getDb>>['db'], studioName: string) {
  if (!studioName) return '';
  const [hit] = await db.select().from(makers).where(like(makers.name, `%${studioName}%`)).limit(1);
  if (hit) return hit.id;
  const id = `maker-${randomUUID().slice(0, 8)}`;
  await db.insert(makers).values({
    id,
    name: studioName,
    avatar: '',
    career: '',
    intro: `由 AniList 导入时自动创建的制作方条目：${studioName}`,
    sort: 99,
  });
  return id;
}

export async function POST(req: Request) {
  if (!(await requireApiAdmin())) return fail('需要管理员权限', 403);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? '参数错误');

  const { anilistId, categoryId, episodeCount, price, featured } = parsed.data;
  const media = await anilistById(anilistId);
  if (!media) return fail('AniList 未返回该条目：ID 不存在或接口暂时不可达', 502);

  const bgm = await matchBangumi(media.title);
  const studio = media.studios?.nodes?.find((n) => n.isAnimationStudio)?.name ?? media.studios?.nodes?.[0]?.name ?? '';
  const id = String(media.id);
  const now = new Date().toISOString();
  const values = {
    title: (bgm?.name_cn || media.title.english || media.title.romaji || media.title.native || '未命名').trim(),
    titleJp: media.title.native ?? '',
    enTitle: media.title.romaji ?? '',
    description: (bgm?.summary || anilistDescriptionToText(media.description)).trim(),
    cover: media.coverImage.large || media.coverImage.extraLarge || '',
    banner: media.bannerImage ?? '',
    year: media.seasonYear ?? 0,
    episodesCount: media.episodes ?? 0,
    duration: media.duration ?? 24,
    score: media.meanScore ?? null,
    categoryId,
    trailer: media.trailer?.site === 'youtube' ? (media.trailer.id ?? '') : '',
    externalLinks: JSON.stringify(
      (media.externalLinks ?? [])
        .filter((link) => link.type === 'STREAMING' || link.type === 'INFO')
        .slice(0, 8)
        .map((link) => ({ site: link.site, url: link.url, type: link.type })),
    ),
    anilistId: media.id,
    bangumiId: bgm?.id ?? null,
    anilistUrl: `https://anilist.co/anime/${media.id}`,
    bangumiUrl: bgm?.id ? `https://bgm.tv/subject/${bgm.id}` : '',
    genres: JSON.stringify(media.genres ?? []),
    price,
    featured,
    published: true,
    updatedAt: now,
  };

  const { db } = await getDb();
  const makerId = await resolveMaker(db, studio);
  const [existing] = await db.select().from(anime).where(eq(anime.id, id)).limit(1);

  if (existing) {
    // Bangumi 不可达时不要用英文元数据覆盖已有的中文标题/简介。
    const keepTitle = !bgm && existing.title && existing.title !== values.title;
    const keepDescription = !bgm && existing.description && existing.description !== values.description;
    await db
      .update(anime)
      .set({
        ...values,
        title: keepTitle ? existing.title : values.title,
        description: keepDescription ? existing.description : values.description,
        makerId: makerId || undefined,
      })
      .where(eq(anime.id, id));
  } else {
    await db.insert(anime).values({ ...values, id, makerId, viewCount: 0, createdAt: now });
  }

  let createdVideos = 0;
  if (episodeCount > 0) {
    let [chapter] = await db.select().from(chapters).where(eq(chapters.animeId, id)).limit(1);
    if (!chapter) {
      const chapterId = `${id}-c1`;
      await db.insert(chapters).values({ id: chapterId, animeId: id, title: media.format === 'MOVIE' ? '正片' : '第 1 季', sort: 0 });
      [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId)).limit(1);
    }
    // 只挂该作品自己的官方预告；未授权的全集片源不自动生成，管理员可在后台按集补已授权源。
    if (chapter && values.trailer) {
      const existing = await db.select({ id: videos.id }).from(videos).where(eq(videos.animeId, id));
      if (existing.length === 0) {
        await db.insert(videos).values({
          id: `${id}-v1`,
          animeId: id,
          chapterId: chapter.id,
          title: '官方预告 / PV',
          sourceUrl: trailerEmbed('youtube', values.trailer),
          duration: 0,
          isFree: price <= 0,
          sort: 0,
          playCount: 0,
        });
        createdVideos = 1;
      }
    }
  }

  return ok(
    {
      animeId: id,
      studio,
      bangumi: bgm ? { id: bgm.id, nameCn: bgm.name_cn ?? '' } : null,
      createdVideos,
      mode: existing ? 'updated' : 'created',
    },
    `${existing ? '更新' : '导入'}成功：${values.title}`,
  );
}
