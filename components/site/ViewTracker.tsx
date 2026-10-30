'use client';

import { useEffect } from 'react';

export default function ViewTracker({ animeId, videoId }: { animeId: string; videoId: string }) {
  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animeId, videoId }),
    }).catch(() => undefined);
  }, [animeId, videoId]);

  return null;
}
