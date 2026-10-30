'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PayPanel({
  orderId,
  animeId,
  amount,
  paid,
}: {
  orderId: string;
  animeId: string;
  amount: number;
  paid: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payType: 1 }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || '支付失败');
        return;
      }
      router.push(`/anime/${animeId}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!window.confirm('确定取消该订单？')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || '取消失败');
        return;
      }
      router.push('/ucenter/order');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pay-o-e-wrap" style={{ padding: '20px 0' }}>
      {paid ? (
        <p style={{ color: '#2e9e5b', fontSize: 16 }}>该订单已支付，可直接观看。</p>
      ) : (
        <>
          <div className="of">
            <aside className="fl tac" style={{ width: 200 }}>
              <img src="/assets/img/erweima.png" width="160" height="160" alt="支付二维码" />
              <p className="c-999 fsize12">演示二维码（未接入微信商户号）</p>
            </aside>
            <section className="fl" style={{ paddingLeft: 20, lineHeight: '32px' }}>
              <p className="c-333 fsize16">
                应付金额：<b className="c-blue">{amount}</b> 软妹币
              </p>
              <p className="c-999 fsize12">原项目的微信 Native 支付需要商户号与 APIv3 密钥，Vercel 版本以本地订单状态流转代替。</p>
              <button className="comm-btn c-btn-3" type="button" disabled={busy} onClick={pay}>
                模拟支付成功
              </button>
              <button className="comm-btn c-btn-2" style={{ marginLeft: 10 }} type="button" disabled={busy} onClick={cancel}>
                取消订单
              </button>
            </section>
          </div>
          {error && <p className="c-red fsize14 mt10" style={{ color: '#e05d5d' }}>{error}</p>}
        </>
      )}
    </div>
  );
}
