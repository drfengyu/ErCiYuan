'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BuyButton({ animeId }: { animeId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function createOrder() {
    setBusy(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId }),
      });
      if (res.status === 401) {
        router.push(`/login?next=/anime/${animeId}`);
        return;
      }
      const json = await res.json();
      if (json.data?.orderId) router.push(`/order/${json.data.orderId}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <a href="#buy" title="立即购买" className="comm-btn c-btn-3" onClick={(e) => { e.preventDefault(); if (!busy) createOrder(); }}>
      立即购买
    </a>
  );
}
