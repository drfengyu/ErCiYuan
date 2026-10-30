import { fail, ok, requireApiAdmin } from '@/lib/api';
import { buildWhere, findResource, firstIssue, newId, normalizeValues, pkOf, sanitizeRow, totalSql } from '@/lib/admin-resources';
import { getDb } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function intParam(raw: string | null, min: number, max: number, fallback: number) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export async function GET(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  if (!(await requireApiAdmin())) return fail('需要管理员权限', 403);
  const { resource: key } = await ctx.params;
  const resource = findResource(key);
  if (!resource) return fail('未知资源', 404);

  const url = new URL(req.url);
  const page = intParam(url.searchParams.get('page'), 1, 100000, 1);
  const size = intParam(url.searchParams.get('size'), 1, 200, 20);
  const keyword = url.searchParams.get('keyword') ?? '';

  const extra: Record<string, string> = {};
  for (const field of resource.fields) {
    const value = url.searchParams.get(field.key);
    if (value) extra[field.key] = value;
  }

  const where = buildWhere(resource, keyword, extra);
  const { db } = await getDb();
  const [rows, totalRow] = await Promise.all([
    db.select().from(resource.table).where(where).orderBy(...resource.orderBy).limit(size).offset((page - 1) * size),
    db.select({ n: totalSql }).from(resource.table).where(where),
  ]);

  return ok({ items: rows.map(sanitizeRow), total: Number(totalRow[0]?.n ?? 0), page, size });
}

export async function POST(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  if (!(await requireApiAdmin())) return fail('需要管理员权限', 403);
  const { resource: key } = await ctx.params;
  const resource = findResource(key);
  if (!resource) return fail('未知资源', 404);
  if (!resource.canCreate) return fail(`「${resource.title}」不支持新建`, 405);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail('请求体格式错误');

  const parsed = resource.schema.safeParse(body);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : newId();
  const pk = pkOf(resource);
  const { db } = await getDb();
  const existing = await db.select().from(resource.table).where(eq(pk, id)).limit(1);
  if (existing.length > 0) return fail(`${id} 已存在，请直接编辑`, 409);

  const values = normalizeValues(resource, parsed.data as Record<string, unknown>, 'create');
  await db.insert(resource.table).values({ ...values, id });

  const [created] = await db.select().from(resource.table).where(eq(pk, id)).limit(1);
  return ok({ item: sanitizeRow(created as Record<string, unknown>) }, '创建成功');
}
