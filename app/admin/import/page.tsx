import AnilistImport from '@/components/admin/AnilistImport';
import { requireAdmin } from '@/lib/auth';
import { getNestedCategories } from '@/lib/queries';

export default async function ImportPage() {
  await requireAdmin();
  const nested = await getNestedCategories();
  const categories = nested.flatMap((root) => [{ id: root.id, name: root.name }, ...root.children.map((child) => ({ id: child.id, name: child.name }))]);
  return <AnilistImport categories={categories} />;
}
