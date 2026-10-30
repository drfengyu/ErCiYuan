export type AnilistMedium = {
  id: number;
  idMal?: number | null;
  title: { romaji?: string | null; english?: string | null; native?: string | null };
  coverImage: { extraLarge?: string | null; large?: string | null };
  bannerImage?: string | null;
  description?: string | null;
  genres?: string[] | null;
  episodes?: number | null;
  duration?: number | null;
  meanScore?: number | null;
  format?: string | null;
  status?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  averageScore?: number | null;
  popularity?: number | null;
  studios?: { nodes?: { name?: string | null; isAnimationStudio?: boolean | null }[] } | null;
  externalLinks?: { url: string; site: string; type: string }[] | null;
  trailer?: { id?: string | null; site?: string | null; thumbnail?: string | null } | null;
  nextAiringEpisode?: { episode?: number | null; airingAt?: number | null } | null;
};

const ENDPOINT = 'https://graphql.anilist.co';
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MEDIA_FIELDS = /* GraphQL */ `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large }
  bannerImage
  genres
  episodes
  duration
  meanScore
  averageScore
  popularity
  format
  status
  season
  seasonYear
  studios(isMain: true) { nodes { name isAnimationStudio } }
  externalLinks { url site type }
  trailer { id site thumbnail }
  nextAiringEpisode { episode airingAt }
`;

async function request<T>(query: string, variables: Record<string, unknown>, revalidate = 3600): Promise<T | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(12_000),
        ...(revalidate > 0 ? { next: { revalidate } } : {}),
      });
      if (res.status === 429) {
        await sleep(600 * (attempt + 1));
        continue;
      }
      if (!res.ok) return null;
      const json = (await res.json()) as { data?: T };
      return json.data ?? null;
    } catch {
      await sleep(300 * (attempt + 1));
    }
  }
  return null;
}

export async function anilistSearch(keyword: string, page = 1, perPage = 12): Promise<AnilistMedium[]> {
  const data = await request<{ Page: { media: AnilistMedium[] } }>(
    /* GraphQL */ `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH, isAdult: false) { ${MEDIA_FIELDS} }
        }
      }
    `,
    { search: keyword, page, perPage },
    600,
  );
  return data?.Page?.media ?? [];
}

export async function anilistById(id: number): Promise<AnilistMedium | null> {
  const data = await request<{ Media: AnilistMedium }>(
    /* GraphQL */ `
      query ($id: Int) {
        Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} description(asHtml: false) }
      }
    `,
    { id },
    3600,
  );
  return data?.Media ?? null;
}

export type SeasonHint = { season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'; year: number };

export function currentSeason(now = new Date()): SeasonHint {
  const m = now.getMonth();
  const season = m <= 2 ? 'WINTER' : m <= 5 ? 'SPRING' : m <= 7 ? 'SUMMER' : m <= 10 ? 'FALL' : 'WINTER';
  const year = season === 'WINTER' && m === 11 ? now.getFullYear() + 1 : now.getFullYear();
  return { season, year };
}

export async function anilistSeasonal(limit = 12): Promise<AnilistMedium[]> {
  const { season, year } = currentSeason();
  const data = await request<{ Page: { media: AnilistMedium[] } }>(
    /* GraphQL */ `
      query ($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
        Page(perPage: $perPage) {
          media(season: $season, seasonYear: $seasonYear, type: ANIME, format_in: [TV, TV_SHORT], sort: POPULARITY_DESC, isAdult: false) {
            ${MEDIA_FIELDS}
          }
        }
      }
    `,
    { season, year, perPage: limit },
    3600,
  );
  return data?.Page?.media ?? [];
}

export function anilistDescriptionToText(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
