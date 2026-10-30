export type EmbedProvider = 'youtube' | 'dailymotion' | 'bilibili';

export type ResolvedMedia =
  | { kind: 'embed'; provider: EmbedProvider; src: string }
  | { kind: 'file'; src: string }
  | { kind: 'unknown'; src: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const BV = /(BV[a-zA-Z0-9]+)/;

/** AniList 的 trailer 是 { site, id }，换成可直接嵌入的地址。 */
export function trailerEmbed(site: string, id: string) {
  if (site === 'dailymotion') return `https://www.dailymotion.com/embed/video/${id}`;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/**
 * 把管理员填写的官方地址归一化成可嵌入播放器地址：
 * 支持 YouTube 分享链接、B 站视频页（转官方 player.html 嵌入）、Dailymotion 视频页。
 */
export function resolveMedia(url: string): ResolvedMedia {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt && YT_ID.test(yt[1])) return { kind: 'embed', provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };

  const bili = url.match(/bilibili\.com\/(?:video\/)?(BV[a-zA-Z0-9]+)/) || url.match(/bilibili\.com\/bangumi\/play\/(\d+)/);
  if (bili) {
    const page = url.match(/[?&]p=(\d+)/)?.[1] ?? '1';
    const bv = bili[1].match(BV)?.[1];
    const query = bv ? `bvid=${bv}` : `aid=${bili[1]}`;
    return { kind: 'embed', provider: 'bilibili', src: `https://player.bilibili.com/player.html?${query}&page=${page}&high_quality=1&danmaku=0` };
  }

  const daily = url.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/);
  if (daily) return { kind: 'embed', provider: 'dailymotion', src: `https://www.dailymotion.com/embed/video/${daily[1]}` };

  if (/^https:\/\/(www\.)?(youtube-nocookie\.com\/embed|youtube\.com\/embed)\//.test(url)) return { kind: 'embed', provider: 'youtube', src: url };
  if (/^(https?:)?\/\/player\.bilibili\.com\/player\.html/.test(url)) return { kind: 'embed', provider: 'bilibili', src: url.replace(/^http?:/, 'https:') };
  if (/^https:\/\/www\.dailymotion\.com\/embed\/video\//.test(url)) return { kind: 'embed', provider: 'dailymotion', src: url };

  if (/\.(m3u8|mp4|webm|ogg)(\?|$)/i.test(url)) return { kind: 'file', src: url };
  return { kind: 'unknown', src: url };
}

/** 官方观看渠道（Crunchyroll / Netflix / Bilibili 番剧页等），用于「完整版去官方」入口。 */
export function streamingLinks(links: { site: string; url: string; type: string }[]) {
  return links.filter((l) => l.type === 'STREAMING' && /^https?:\/\//.test(l.url));
}
