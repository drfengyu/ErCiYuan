import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok, requireApiUser } from '@/lib/api';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { findAnime, hasBought, listUserOrders } from '@/lib/queries';

export const dynamic = 'force-dynamic';

function orderNo() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  return `ECY${day}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
}

export async function GET() {
  const session = await requireApiUser();
  if (!session) return fail('请先登录', 401);
  return ok({ items: await listUserOrders(session.userId) });
}

export async function POST(req: Request) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录后再下单', 401);

  const parsed = z.object({ animeId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('缺少 animeId');

  const anime = await findAnime(parsed.data.animeId);
  if (!anime) return fail('动漫不存在', 404);
  if (anime.price <= 0) return fail('该动漫免费，无需购买', 400);
  if (await hasBought(session.userId, anime.id)) return fail('你已购买过该动漫', 409);

  const { db } = await getDb();
  const pending = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.userId, session.userId), eq(orders.animeId, anime.id), eq(orders.status, 0)))
    .limit(1);
  if (pending.length > 0) return ok({ orderId: pending[0].id }, '已有待支付订单');

  const id = randomUUID().slice(0, 12);
  await db.insert(orders).values({
    id,
    orderNo: orderNo(),
    userId: session.userId,
    animeId: anime.id,
    amount: anime.price,
    status: 0,
    payType: 1,
    createdAt: new Date().toISOString(),
  });

  return ok({ orderId: id }, '订单已创建');
}
