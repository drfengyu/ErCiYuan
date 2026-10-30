import { z } from 'zod';
import { fail, ok } from '@/lib/api';
import { registerView } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const schema = z.object({
  animeId: z.string().min(1),
  videoId: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail('参数错误');
  await registerView(parsed.data.animeId, parsed.data.videoId);
  return ok(null);
}
