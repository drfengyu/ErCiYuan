'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function CreateOrder({ animeId }: { animeId: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animeId }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setError(json.message || '下单失败');
          return;
        }
        router.replace(`/order/${json.data.orderId}`);
      })
      .catch(() => setError('下单失败，请稍后重试'));
  }, [animeId, router]);

  if (error) {
    return (
      <p className="c-999" style={{ padding: 30, textAlign: 'center' }}>
        {error}
      </p>
    );
  }
  return <p className="c-999" style={{ padding: 30, textAlign: 'center' }}>正在生成订单…</p>;
}
