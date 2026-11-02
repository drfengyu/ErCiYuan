const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const API = 'https://api.bilibili.com/pgc/view/web/season';

export type BiliRef = { epId?: number; seasonId?: number; mediaId?: number };

export type BiliEpisode = {
  epId: number;
  /** 集序用序号：B 站的 title 只是裸集号（"1"），真实集名在 long_title 里 */
  epNo: number;
  name: string;
  shareUrl: string;
  bvid: string;
  cid: number;
  durationSec: number;
  cover: string;
  pubTime: number;
  badge: string;
};

export type BiliSeason = {
  seasonId: number;
  mediaId: number;
  title: string;
  seasonTitle: string;
  cover: string;
  description: string;
  total: number;
  areas: string[];
  styles: string[];
  episodes: BiliEpisode[];
};

/** 支持 /bangumi/play/epNNN、/bangumi/play/ssNNN、/bangumi/media/mdNNN，以及对应的查询参数形式。 */
export function parseBiliRef(input: string): BiliRef | null {
  const value = input.trim();
  if (/^\d+$/.test(value)) return { seasonId: Number(value) };
  const ep = value.match(/(?:^|[/?&=])(?:ep|ep_id[=])(\d+)/i) || value.match(/[?&]ep_id=(\d+)/);
  const ss = value.match(/(?:^|[/?&=])(?:ss|season_id[=])(\d+)/i) || value.match(/[?&]season_id=(\d+)/);
  const md = value.match(/(?:^|[/?&=])(?:md|md_id[=])(\d+)/i) || value.match(/[?&]md_id=(\d+)/);
  const ref: BiliRef = {};
  if (ep) ref.epId = Number(ep[1]);
  else if (ss) ref.seasonId = Number(ss[1]);
  else if (md) ref.mediaId = Number(md[1]);
  return Object.keys(ref).length ? ref : null;
}

export function biliRefToQuery(ref: BiliRef) {
  if (ref.epId) return `ep_id=${ref.epId}`;
  if (ref.seasonId) return `season_id=${ref.seasonId}`;
  if (ref.mediaId) return `md_id=${ref.mediaId}`;
  return '';
}

type RawEpisode = {
  id?: number;
  ep_id?: number;
  title?: string;
  long_title?: string;
  share_url?: string;
  bvid?: string;
  cid?: number;
  duration?: number;
  cover?: string;
  pub_time?: number;
  badge?: { text?: string };
};

type RawSeason = {
  season_id?: number;
  season_title?: string;
  media_id?: number;
  title?: string;
  cover?: string;
  evaluate?: string;
  total?: number;
  areas?: { name?: string }[];
  styles?: string[];
  episodes?: RawEpisode[];
};

/** 该接口实测无需登录与 cookie；返回的 duration 是毫秒。 */
export async function fetchBiliSeason(
  input: string,
): Promise<{ ok: true; season: BiliSeason } | { ok: false; error: string }> {
  const ref = parseBiliRef(input);
  if (!ref) return { ok: false, error: '无法识别的 B 站地址，请粘贴 /bangumi/play/ep… 或 ss… 形式的番剧链接' };

  const query = biliRefToQuery(ref);
  let json: { code?: number; message?: string; result?: RawSeason } | null = null;
  try {
    const res = await fetch(`${API}?${query}`, {
      headers: { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' },
      signal: AbortSignal.timeout(12_000),
    });
    json = await res.json();
  } catch {
    return { ok: false, error: 'B 站接口请求失败或超时' };
  }

  if (!json || json.code !== 0 || !json.result) {
    return { ok: false, error: `B 站返回异常：${json?.message ?? '无数据'}（code ${json?.code ?? '-'}）` };
  }

  const raw = json.result;
  const episodes: BiliEpisode[] = (raw.episodes ?? []).map((e, index) => ({
    epId: e.ep_id ?? e.id ?? 0,
    epNo: index + 1,
    name: (e.long_title || `第 ${index + 1} 话`).trim(),
    shareUrl: e.share_url ?? (e.ep_id ?? e.id ? `https://www.bilibili.com/bangumi/play/ep${e.ep_id ?? e.id}` : ''),
    bvid: e.bvid ?? '',
    cid: e.cid ?? 0,
    durationSec: Math.round((e.duration ?? 0) / 1000),
    cover: e.cover ?? '',
    pubTime: e.pub_time ?? 0,
    badge: e.badge?.text ?? '',
  }));

  return {
    ok: true,
    season: {
      seasonId: raw.season_id ?? 0,
      mediaId: raw.media_id ?? 0,
      title: (raw.title ?? '').trim(),
      seasonTitle: (raw.season_title ?? raw.title ?? '').trim(),
      cover: raw.cover ?? '',
      description: (raw.evaluate ?? '').trim(),
      total: raw.total ?? episodes.length,
      areas: (raw.areas ?? []).map((a) => a.name ?? '').filter(Boolean),
      styles: (raw.styles ?? []).filter(Boolean),
      episodes: episodes.filter((e) => e.epId > 0),
    },
  };
}
