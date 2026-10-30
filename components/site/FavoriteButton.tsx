'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FavoriteButton({ animeId, initial }: { animeId: string; initial: boolean }) {
  const router = useRouter();
  const [isCollect, setCollect] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/favorites/${animeId}`, { method: isCollect ? 'DELETE' : 'POST' });
      if (res.status === 401) {
        router.push(`/login?next=/anime/${animeId}`);
        return;
      }
      const json = await res.json();
      setCollect(Boolean(json.data?.isCollect));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="ml10 vam">
      {isCollect ? '🤡' : '👺'}{' '}
      <button style={{ cursor: 'pointer' }} type="button" className={isCollect ? 'comm-btn c-btn-4' : 'comm-btn c-btn-3'} disabled={busy} onClick={toggle}>
        {isCollect ? '取消收藏' : '收藏'}
      </button>
    </span>
  );
}
