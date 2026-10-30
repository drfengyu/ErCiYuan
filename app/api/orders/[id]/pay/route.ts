import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok, requireApiUser } from '@/lib/api';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

// 演示支付：原项目走微信 Native 下单（需商户号 + APIv3 密钥），这里只做本地订单状态流转。
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiUser();
  if (!session) return fail('请先登录', 401);
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ payType: z.coerce.number().default(1) }).safeParse(body);
  if (!parsed.success) return fail('参数错误');

  const { db } = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return fail('订单不存在', 404);
  if (order.userId !== session.userId) return fail('无权支付该订单', 403);
  if (order.status === 1) return ok({ paid: true }, '订单已支付');

  await db
    .update(orders)
    .set({ status: 1, payType: parsed.data.payType, paidAt: new Date().toISOString() })
    .where(eq(orders.id, id));

  return ok({ paid: true }, '支付成功（演示）');
}
