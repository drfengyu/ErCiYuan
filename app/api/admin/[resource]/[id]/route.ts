import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, ok, requireApiAdmin } from '@/lib/api';
import { findResource, firstIssue, normalizeValues, pkOf, type ResourceDef } from '@/lib/admin-resources';
import { getDb } from '@/lib/db';
import * as t from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

type ParseResult = { ok: true; data: Record<string, unknown> } | { ok: false; error: string };

function parsePartial(resource: ResourceDef, body: Record<string, unknown>): ParseResult {
  const shape = (resource.schema as unknown as z.ZodObject<z.ZodRawShape>).shape;
  const scoped = z.object(Object.fromEntries(Object.entries(shape).filter(([key]) => key in body)));
  const parsed = scoped.safeParse(body);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  return { ok: true, data: parsed.data as Record<string, unknown> };
}

export async function PUT(req: Request, ctx: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await requireApiAdmin())) return fail('需要管理员权限', 403);
  const { resource: key, id } = await ctx.params;
  const resource = findResource(key);
  if (!resource) return fail('未知资源', 404);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail('请求体格式错误');

  const result = parsePartial(resource, body);
  if (!result.ok) return fail(result.error);

  const pk = pkOf(resource);
  const { db } = await getDb();
  const [current] = await db.select().from(resource.table).where(eq(pk, id)).limit(1);
  if (!current) return fail('记录不存在', 404);

  const values = normalizeValues(resource, result.data, 'update');
  await db.update(resource.table).set(values).where(eq(pk, id));

  const [updated] = await db.select().from(resource.table).where(eq(pk, id)).limit(1);
  return ok({ item: updated }, '保存成功');
}

export async function DELETE(req: Request, ctx: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await requireApiAdmin())) return fail('需要管理员权限', 403);
  const { resource: key, id } = await ctx.params;
  const resource = findResource(key);
  if (!resource) return fail('未知资源', 404);
  if (!resource.canDelete) return fail(`「${resource.title}」不支持删除`, 405);

  const { db } = await getDb();
  if (resource.key === 'anime') {
    await db.delete(t.chapters).where(eq(t.chapters.animeId, id));
    await db.delete(t.videos).where(eq(t.videos.animeId, id));
    await db.delete(t.comments).where(eq(t.comments.animeId, id));
    await db.delete(t.favorites).where(eq(t.favorites.animeId, id));
    await db.delete(t.orders).where(eq(t.orders.animeId, id));
  }
  if (resource.key === 'chapters') {
    await db.delete(t.videos).where(eq(t.videos.chapterId, id));
  }

  await db.delete(resource.table).where(eq(pkOf(resource), id));
  return ok(null, '删除成功');
}
