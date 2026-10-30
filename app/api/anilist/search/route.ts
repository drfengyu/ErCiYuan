import { fail, ok } from '@/lib/api';
import { anilistById, anilistSearch } from '@/lib/anilist';

export const dynamic = 'force-dynamic';

function shape(media: Awaited<ReturnType<typeof anilistSearch>>[number]) {
  return {
    anilistId: media.id,
    title: media.title.english || media.title.romaji || media.title.native || '',
    titleJp: media.title.native || '',
    romaji: media.title.romaji || '',
    cover: media.coverImage.large || media.coverImage.extraLarge || '',
    banner: media.bannerImage || '',
    year: media.seasonYear ?? 0,
    episodes: media.episodes ?? 0,
    duration: media.duration ?? 0,
    score: media.meanScore ?? null,
    status: media.status ?? '',
    format: media.format ?? '',
    genres: media.genres ?? [],
    studio: media.studios?.nodes?.[0]?.name ?? '',
    trailer: media.trailer?.site === 'youtube' ? (media.trailer.id ?? '') : '',
    anilistUrl: `https://anilist.co/anime/${media.id}`,
  };
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const id = Number(params.get('id') || 0);
  const keyword = params.get('keyword') ?? '';

  if (id) {
    const media = await anilistById(id);
    if (!media) return fail('AniList 未返回该条目', 404);
    return ok({ items: [shape(media)] });
  }
  if (!keyword.trim()) return ok({ items: [] });

  const list = await anilistSearch(keyword.trim(), 1, Math.min(20, Number(params.get('limit') || 12)));
  return ok({ items: list.map(shape) });
}
