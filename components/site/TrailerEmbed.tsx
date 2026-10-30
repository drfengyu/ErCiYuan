'use client';

import { useState } from 'react';

export default function TrailerEmbed({ videoId, poster, title }: { videoId: string; poster: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        width="100%"
        height="360"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={`${title} 预告片`}
        loading="lazy"
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{ border: 0, display: 'block' }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      title="播放预告片"
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: 260,
        padding: 0,
        border: 0,
        cursor: 'pointer',
        background: `#0f172a url(${poster}) center/cover no-repeat`,
        color: '#fff',
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15,23,42,.45)',
          fontSize: 15,
        }}
      >
        ▶ 加载 YouTube 预告片
      </span>
    </button>
  );
}
