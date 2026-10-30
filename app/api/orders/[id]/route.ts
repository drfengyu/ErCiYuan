import { and, eq } from 'drizzle-orm';
import { fail, ok, requireApiUser } from '@/lib/api';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录', 401);
  const { id } = await ctx.params;

  const { db } = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return fail('订单不存在', 404);
  if (order.userId !== session.userId && session.role !== 'ADMIN') return fail('无权操作该订单', 403);
  if (order.status === 1) return fail('订单已支付，无法取消', 400);

  await db.delete(orders).where(and(eq(orders.id, id), eq(orders.userId, order.userId)));
  return ok(null, '订单已取消');
}
