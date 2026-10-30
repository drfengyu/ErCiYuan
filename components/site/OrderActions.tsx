'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OrderActions({ orderId, paid }: { orderId: string; paid: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(path: string, method: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    try {
      const res = await fetch(path, { method });
      const json = await res.json();
      if (!res.ok) window.alert(json.message || '操作失败');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (paid) {
    return (
      <span className="c-999 fsize12" style={{ color: '#2e9e5b' }}>
        已支付
      </span>
    );
  }

  return (
    <>
      <button className="comm-btn c-btn-3" style={{ padding: '2px 10px' }} type="button" disabled={busy} onClick={() => run(`/api/orders/${orderId}/pay`, 'POST')}>
        去支付
      </button>
      <button
        className="comm-btn c-btn-2"
        style={{ padding: '2px 10px', marginLeft: 8 }}
        type="button"
        disabled={busy}
        onClick={() => run(`/api/orders/${orderId}`, 'DELETE', '确定取消该订单？')}
      >
        取消
      </button>
    </>
  );
}
