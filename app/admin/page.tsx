import Link from 'next/link';
import { desc, getTableName, sql } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { anilistSearch } from '@/lib/anilist';
import { searchBangumi } from '@/lib/bangumi';
import { getDb } from '@/lib/db';
import * as t from '@/lib/db/schema';
import { formatDate, formatMoney } from '@/lib/format';

async function countOf(table: SQLiteTable) {
  const { client } = await getDb();
  const result = await client.execute({ sql: `SELECT COUNT(*) AS n FROM "${getTableName(table)}"`, args: [] });
  return Number(result.rows[0]?.n ?? 0);
}

export default async function AdminDashboard() {
  const { db, ephemeral } = await getDb();

  const [animeN, videoN, userN, orderN, commentN, favoriteN] = await Promise.all([
    countOf(t.anime),
    countOf(t.videos),
    countOf(t.users),
    countOf(t.orders),
    countOf(t.comments),
    countOf(t.favorites),
  ]);

  const revenue = await db.select({ total: sql<number>`coalesce(sum("amount"), 0)` }).from(t.orders).where(sql`status = 1`);
  const topAnime = await db.select({ id: t.anime.id, title: t.anime.title, viewCount: t.anime.viewCount }).from(t.anime).orderBy(sql`viewCount desc`).limit(8);
  const latestOrders = await db
    .select({ orderNo: t.orders.orderNo, amount: t.orders.amount, status: t.orders.status, createdAt: t.orders.createdAt })
    .from(t.orders)
    .orderBy(desc(t.orders.createdAt))
    .limit(8);

  const started = Date.now();
  const anilistProbe = await anilistSearch('frieren', 1, 1);
  const anilistMs = Date.now() - started;
  const bangumiStarted = Date.now();
  const bangumiProbe = await searchBangumi('Frieren', 1, { attempts: 1, timeoutMs: 4_000 });
  const bangumiMs = Date.now() - bangumiStarted;

  const cards = [
    { label: '动漫', value: animeN, href: '/admin/anime' },
    { label: '剧集', value: videoN, href: '/admin/videos' },
    { label: '用户', value: userN, href: '/admin/users' },
    { label: '订单', value: orderN, href: '/admin/orders' },
    { label: '评论', value: commentN, href: '/admin/comments' },
    { label: '收藏', value: favoriteN, href: '/admin/users' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">数据概览</h1>

      {ephemeral && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          当前未配置 <code>DATABASE_URL</code>，运行在内存数据库上：部署实例重启后新写入的数据会丢失。生产环境请绑定 Turso / LibSQL 实例。
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="admin-card px-4 py-3 transition hover:border-blue-400">
            <div className="text-xs text-slate-500">{card.label}</div>
            <div className="mt-1 text-2xl font-semibold text-slate-800">{card.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="admin-card p-4">
          <h2 className="mb-2 text-sm font-medium text-slate-500">外部资源接口状态</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>接口</th>
                <th>状态</th>
                <th>耗时</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AniList GraphQL</td>
                <td>{anilistProbe.length > 0 ? <span className="text-green-600">可用</span> : <span className="text-red-500">不可用</span>}</td>
                <td>{anilistMs} ms</td>
              </tr>
              <tr>
                <td>Bangumi 条目检索</td>
                <td>{bangumiProbe.length > 0 ? <span className="text-green-600">可用</span> : <span className="text-red-500">不可用</span>}</td>
                <td>{bangumiMs} ms</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-400">导入番剧时用 AniList 取元数据，再用 Bangumi 补中文名与简介。</p>
        </section>

        <section className="admin-card p-4">
          <h2 className="mb-2 text-sm font-medium text-slate-500">收入统计</h2>
          <div className="text-3xl font-semibold text-blue-600">{formatMoney(Number(revenue[0]?.total ?? 0))} 软妹币</div>
          <p className="mt-1 text-xs text-slate-400">仅统计状态为「已支付」的订单，演示支付不落真实渠道。</p>
          <table className="admin-table mt-3">
            <thead>
              <tr>
                <th>订单号</th>
                <th>金额</th>
                <th>状态</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((order) => (
                <tr key={order.orderNo}>
                  <td>{order.orderNo}</td>
                  <td>{formatMoney(order.amount)}</td>
                  <td>{order.status === 1 ? <span className="text-green-600">已支付</span> : <span className="text-amber-600">待支付</span>}</td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="admin-card p-4">
        <h2 className="mb-2 text-sm font-medium text-slate-500">播放量 Top 8</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>播放量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {topAnime.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.viewCount}</td>
                <td>
                  <a className="text-blue-600" href={`/anime/${item.id}`} target="_blank" rel="noreferrer">
                    查看
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
