'use client';

import { useEffect, useRef, useState } from 'react';
import { isHls } from '@/lib/format';
import { resolveMedia } from '@/lib/media';

type Props = {
  src: string;
  title: string;
  animeId?: string;
  videoId?: string;
  /** 上次看到的秒数，仅对可读取位置的直链源生效 */
  resumeSec?: number;
  /** 已登录才会往 /api/progress 写进度 */
  track?: boolean;
};

export default function VideoPlayer({ src, title, animeId, videoId, resumeSec = 0, track = false }: Props) {
  const media = resolveMedia(src);

  return (
    <div style={{ background: '#000' }}>
      <div className="video-frame" style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {media.kind === 'embed' ? (
            <iframe
              src={media.src}
              title={title}
              loading="lazy"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            />
          ) : media.kind === 'file' ? (
            <NativePlayer src={media.src} title={title} resumeSec={resumeSec} report={track && animeId && videoId ? { animeId, videoId } : null} />
          ) : (
            <Unsupported src={src} />
          )}
        </div>
      </div>
    </div>
  );
}

function Unsupported({ src }: { src: string }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#c8d3e0', fontSize: 13, padding: 16, textAlign: 'center' }}>
      <span>该资源位指向的地址不是可嵌入的官方播放器，也不是 mp4 / HLS 直链。</span>
      <a href={src} target="_blank" rel="noreferrer" style={{ color: '#5ecee6', textDecoration: 'underline' }}>
        在新窗口打开
      </a>
    </div>
  );
}

function NativePlayer({
  src,
  title,
  resumeSec,
  report,
}: {
  src: string;
  title: string;
  resumeSec: number;
  report: { animeId: string; videoId: string } | null;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let cancelled = false;
    let hls: import('hls.js').default | null = null;
    setError('');

    // hls.js 只在 HLS 源时按需加载，避免非 HLS 播放也吃这 100+ kB。
    async function attach() {
      if (!isHls(src)) {
        video!.src = src;
        return;
      }
      const { default: Hls } = await import('hls.js');
      if (cancelled) return;
      if (!Hls.isSupported()) {
        video!.src = src;
        return;
      }
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video!);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setError('视频源暂不可达，可切换到其它资源位试试。');
      });
    }

    attach().catch(() => setError('播放器初始化失败。'));

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src]);

  // 续播 + 每 15 秒上报一次进度；离开页面时补一次。
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let last = 0;

    const send = (positionSec: number) => {
      if (!report || !positionSec) return;
      const durationSec = Number.isFinite(video.duration) ? video.duration : 0;
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ ...report, positionSec, durationSec })], { type: 'application/json' });
        navigator.sendBeacon('/api/progress', blob);
        return;
      }
      void fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...report, positionSec, durationSec }),
        keepalive: true,
      });
    };

    const onTime = () => {
      if (resumeSec > 0 && video.currentTime < 1) video.currentTime = resumeSec;
      const now = Date.now();
      if (report && now - last > 15_000 && video.currentTime > 0) {
        last = now;
        send(Math.trunc(video.currentTime));
      }
    };
    const onLeave = () => video.currentTime > 0 && send(Math.trunc(video.currentTime));

    video.addEventListener('timeupdate', onTime);
    window.addEventListener('pagehide', onLeave);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      window.removeEventListener('pagehide', onLeave);
      onLeave();
    };
  }, [report, resumeSec]);

  return (
    <>
      <video
        ref={ref}
        title={title}
        controls
        playsInline
        preload="metadata"
        style={{ width: '100%', height: '100%', background: '#000', display: 'block' }}
        onError={() => setError('视频加载失败，可能是外部源临时不可用。')}
      />
      {error && <p style={{ color: '#f6c', padding: '8px 16px', margin: 0 }}>{error}</p>}
    </>
  );
}
