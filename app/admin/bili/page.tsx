import BiliImport from '@/components/admin/BiliImport';
import { requireAdmin } from '@/lib/auth';
import { listAnimeOptions } from '@/lib/queries';

export default async function BiliImportPage() {
  await requireAdmin();
  return <BiliImport animeList={await listAnimeOptions()} />;
}
