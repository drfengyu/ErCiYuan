import { notFound } from 'next/navigation';
import ResourceManager from '@/components/admin/ResourceManager';
import { requireAdmin } from '@/lib/auth';
import { buildWhere, findResource, totalSql, type ResourceDef } from '@/lib/admin-resources';
import { getDb } from '@/lib/db';

const SIZE = 20;

function serializeFields(resource: ResourceDef) {
  return resource.fields.map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    options: field.options,
    list: Boolean(field.list),
  }));
}

export default async function AdminResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const { resource: key } = await params;
  const resource = findResource(key);
  if (!resource) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1));
  const keyword = sp.keyword ?? '';
  const extra: Record<string, string> = {};
  for (const field of resource.fields) {
    const value = sp[field.key];
    if (value) extra[field.key] = value;
  }

  const where = buildWhere(resource, keyword, extra);
  const { db } = await getDb();
  const [rows, totalRow] = await Promise.all([
    db.select().from(resource.table).where(where).orderBy(...resource.orderBy).limit(SIZE).offset((page - 1) * SIZE),
    db.select({ n: totalSql }).from(resource.table).where(where),
  ]);

  return (
    <ResourceManager
      resourceKey={resource.key}
      title={resource.title}
      fields={serializeFields(resource)}
      canCreate={resource.canCreate}
      canDelete={resource.canDelete}
      size={SIZE}
      initialRows={rows as Record<string, unknown>[]}
      initialTotal={Number(totalRow[0]?.n ?? 0)}
      initialPage={page}
      initialKeyword={keyword}
      initialFilters={extra}
    />
  );
}
