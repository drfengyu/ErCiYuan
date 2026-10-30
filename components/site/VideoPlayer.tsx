'use client';

import { useEffect, useRef, useState } from 'react';
import { isHls } from '@/lib/format';

export default function VideoPlayer({ src, title }: { src: string; title: string }) {
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
        if (data.fatal) setError('演示视频源暂不可达，可切换到其它剧集试试。');
      });
    }

    attach().catch(() => setError('播放器初始化失败。'));

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src]);

  return (
    <div style={{ background: '#000' }}>
      <video
        ref={ref}
        title={title}
        controls
        playsInline
        preload="metadata"
        style={{ width: '100%', maxHeight: '70vh', background: '#000', display: 'block' }}
        onError={() => setError('视频加载失败，可能是外部演示源临时不可用。')}
      />
      {error && <p style={{ color: '#f6c', padding: '8px 16px', margin: 0 }}>{error}</p>}
    </div>
  );
}
