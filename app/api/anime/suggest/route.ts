import { ok } from '@/lib/api';
import { suggestTitles } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const keyword = new URL(req.url).searchParams.get('keyword') ?? '';
  return ok(await suggestTitles(keyword));
}
