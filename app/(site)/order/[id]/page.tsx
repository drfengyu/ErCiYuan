import Link from 'next/link';
import { notFound } from 'next/navigation';
import PayPanel from '@/components/site/PayPanel';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { findOrder } from '@/lib/queries';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('/ucenter/order');
  const detail = await findOrder(id);
  if (!detail || detail.order.userId !== user.id) notFound();

  const { order, anime } = detail;
  const paid = order.status === 1;

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container">
        <header className="comm-title">
          <h2 className="fl tac">
            <span className="c-333">订单详情</span>
          </h2>
        </header>
        <div className="order-table" style={{ background: '#fff', padding: 20 }}>
          <ul className="c-333 fsize14" style={{ lineHeight: '32px', paddingLeft: 10, listStyle: 'none' }}>
            <li>
              动漫：
              <Link href={`/anime/${order.animeId}`} className="c-blue">
                {anime?.title ?? order.animeId}
              </Link>
            </li>
            <li>订单号：{order.orderNo}</li>
            <li>下单时间：{formatDate(order.createdAt)}</li>
            <li>状态：{paid ? `已支付（${formatDate(order.paidAt)}）` : '待支付'}</li>
          </ul>
          <PayPanel orderId={order.id} animeId={order.animeId} amount={order.amount} paid={paid} />
        </div>
      </section>
    </div>
  );
}
