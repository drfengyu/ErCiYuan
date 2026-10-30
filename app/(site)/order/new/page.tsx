import CreateOrder from '@/components/site/CreateOrder';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ animeId?: string }> }) {
  const { animeId } = await searchParams;
  await requireUser(`/order/new?animeId=${animeId ?? ''}`);
  const parsed = z.string().min(1).safeParse(animeId ?? '');

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container" style={{ minHeight: 240 }}>
        <header className="comm-title">
          <h2 className="fl tac">
            <span className="c-333">下单</span>
          </h2>
        </header>
        {parsed.success ? <CreateOrder animeId={parsed.data} /> : <p className="c-999" style={{ padding: 30, textAlign: 'center' }}>缺少 animeId 参数</p>}
      </section>
    </div>
  );
}
