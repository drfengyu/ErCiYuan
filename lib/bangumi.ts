export type BangumiSubject = {
  id: number;
  name: string;
  name_cn?: string;
  type?: number;
  date?: string;
  rating?: { total?: number; count?: { high?: number } } | number;
  images?: { large?: string; common?: string };
  summary?: string;
  short_summary?: string;
};

export type BangumiDetail = BangumiSubject & {
  tags?: { name: string; count: number }[];
};

const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'erciyuan-next/2.0 (demo build)',
};

// 大陆网络直连 api.bgm.tv 可能受阻：可用 BANGUMI_API_BASE 指向自建镜像/网关。
const BASE = (process.env.BANGUMI_API_BASE || 'https://api.bgm.tv').replace(/\/$/, '');

async function fetchJson<T>(
  input: RequestInit & { url: string },
  options: { attempts?: number; timeoutMs?: number } = {},
): Promise<T | null> {
  const attempts = options.attempts ?? 2;
  const timeout = options.timeoutMs ?? 8_000;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await fetch(input.url, {
        ...input,
        signal: AbortSignal.timeout(timeout),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  return null;
}

export async function searchBangumi(
  keyword: string,
  limit = 8,
  options?: { attempts?: number; timeoutMs?: number },
): Promise<BangumiSubject[]> {
  if (!keyword.trim()) return [];
  const json = await fetchJson<{ data?: BangumiSubject[] }>(
    {
      url: `${BASE}/v0/search/subjects`,
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ keyword, subject_type: 2, limit, offset: 0 }),
    },
    options,
  );
  return json?.data ?? [];
}

export async function bangumiSubject(id: number): Promise<BangumiDetail | null> {
  return fetchJson<BangumiDetail>({ url: `${BASE}/v0/subjects/${id}`, headers: HEADERS });
}

function normalize(value?: string | null) {
  return (value ?? '').toLowerCase().replace(/[\s~〜・·\[\]【()（）'’!！?？:：,，.。]/g, '');
}

export async function matchBangumi(titles: { romaji?: string | null; native?: string | null; english?: string | null }) {
  const queries = [titles.romaji, titles.native, titles.english].filter((v): v is string => Boolean(v));
  for (const query of queries) {
    const candidates = await searchBangumi(query, 8);
    if (candidates.length === 0) continue;
    const native = normalize(titles.native);
    const romaji = normalize(titles.romaji);
    const best =
      candidates.find((c) => normalize(c.name) === native && native) ??
      candidates.find((c) => normalize(c.name) === romaji && romaji) ??
      candidates[0];
    const detail = await bangumiSubject(best.id);
    return detail ?? best;
  }
  return null;
}
