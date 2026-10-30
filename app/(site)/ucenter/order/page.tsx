import Link from 'next/link';
import OrderActions from '@/components/site/OrderActions';
import UserTabs from '@/components/site/UserTabs';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { listUserOrders } from '@/lib/queries';

export default async function OrderListPage() {
  const user = await requireUser('/ucenter/order');
  const items = await listUserOrders(user.id);

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container">
        <header className="comm-title">
          <h2 className="fl tac">
            <span className="c-333">我的订单</span>
          </h2>
        </header>
        <UserTabs active="/ucenter/order" />
        {items.length === 0 ? (
          <p className="c-999 fsize14">暂无订单。</p>
        ) : (
          <div className="u-order-wrap">
            <dl>
              <dt>
                <span className="fl" style={{ width: '22%' }}>动漫</span>
                <span className="fl" style={{ width: '24%' }}>订单号</span>
                <span className="fl" style={{ width: '12%' }}>金额</span>
                <span className="fl" style={{ width: '22%' }}>下单时间</span>
                <span className="fr" style={{ width: '20%', textAlign: 'right' }}>操作</span>
              </dt>
              {items.map((order) => (
                <dd key={order.id} className="of" style={{ borderBottom: '1px dotted #ddd', padding: '10px 0', lineHeight: '28px' }}>
                  <span className="fl" style={{ width: '22%' }}>
                    <Link href={`/anime/${order.animeId}`} className="c-333">
                      {order.animeTitle}
                    </Link>
                  </span>
                  <span className="fl c-999 fsize12" style={{ width: '24%' }}>
                    {order.orderNo}
                  </span>
                  <span className="fl c-blue fsize14" style={{ width: '12%' }}>
                    {order.amount} 软妹币
                  </span>
                  <span className="fl c-999 fsize12" style={{ width: '22%' }}>
                    {formatDate(order.createdAt)}
                  </span>
                  <span className="fr" style={{ width: '20%', textAlign: 'right' }}>
                    <OrderActions orderId={order.id} paid={order.status === 1} />
                  </span>
                </dd>
              ))}
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}
