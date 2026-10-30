import ProfileForm from '@/components/site/ProfileForm';
import UserTabs from '@/components/site/UserTabs';
import { requireUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { favorites, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatDate } from '@/lib/format';

export default async function UCenterPage() {
  const user = await requireUser('/ucenter');
  const { db } = await getDb();
  const [collectRows, orderRows] = await Promise.all([
    db.select({ id: favorites.id }).from(favorites).where(eq(favorites.userId, user.id)),
    db.select({ id: orders.id, status: orders.status, amount: orders.amount }).from(orders).where(eq(orders.userId, user.id)),
  ]);
  const paid = orderRows.filter((o) => o.status === 1);
  const spent = paid.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container">
        <header className="comm-title">
          <h2 className="fl tac">
            <span className="c-333">用户中心</span>
          </h2>
        </header>
        <section className="c-infor-box">
          <article className="fl col-7">
            <section className="mr30">
              <UserTabs active="/ucenter" />
              <div className="u-account-box" style={{ padding: '20px 0 0 0' }}>
                <ProfileForm nickname={user.nickname} avatar={user.avatar} />
              </div>
            </section>
          </article>
          <aside className="fl col-3">
            <section className="c-infor-tabTitle c-tab-title">
              <a href="javascript:void(0)">账号概览</a>
            </section>
            <ul className="c-999 fsize14" style={{ lineHeight: '30px', paddingLeft: 10 }}>
              <li>注册时间:{formatDate(user.createdAt)}</li>
              <li>身份:{user.role === 'ADMIN' ? '管理员' : '普通用户'}</li>
              <li>收藏动漫:{collectRows.length} 部</li>
              <li>已购动漫:{paid.length} 部</li>
              <li>累计消费:{spent} 软妹币</li>
            </ul>
          </aside>
          <div className="clear" />
        </section>
      </section>
    </div>
  );
}
