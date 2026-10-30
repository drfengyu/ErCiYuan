import AnimeCard from '@/components/site/AnimeCard';
import MakerPic from '@/components/site/MakerPic';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMakerDetail } from '@/lib/queries';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getMakerDetail(id);
  if (!detail) return { title: '制作方不存在' };
  return {
    title: `制作方 · ${detail.maker.name}`,
    description: (detail.maker.intro || `${detail.maker.name} 制作动画列表`).slice(0, 120),
  };
}

export default async function MakerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getMakerDetail(id);
  if (!detail) notFound();
  const { maker, anime } = detail;

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container">
        <header className="comm-title">
          <h2 className="fl tac">
            <span className="c-333">制作方</span>
          </h2>
        </header>
        <div className="t-infor-wrap">
          <section className="fl t-infor-box c-desc-content">
            <div className="mt20 ml20">
              <section className="t-infor-pic">
                <MakerPic name={maker.name} src={maker.avatar} width={220} height={90} />
              </section>
              <h3 className="hLh30">
                <span className="fsize24 c-333">{maker.name}</span>
              </h3>
              <section className="mt10">
                <span className="t-tag-bg" style={{ textAlign: 'center', display: 'block' }}>
                  代表作：{maker.career}
                </span>
              </section>
              <section className="t-infor-txt">
                <p className="mt20">{maker.intro}</p>
              </section>
              <div className="clear" />
            </div>
          </section>
          <div className="clear" />
        </div>

        <section className="mt30">
          <div>
            <header className="comm-title all-maker-title c-anime-content">
              <h2 className="fl tac">
                <span className="c-333">制作动画</span>
              </h2>
            </header>
            {anime.length === 0 ? (
              <section className="no-data-wrap">
                <img src="/assets/img/noData.png" style={{ width: 150, height: 150, display: 'inline' }} className="img-responsive" alt="无数据" />
                <br />
                <span className="c-666 fsize14 ml10 vam">没有相关动漫</span>
              </section>
            ) : (
              <article className="comm-anime-list">
                <ul className="of">
                  {anime.map((item) => (
                    <li key={item.id}>
                      <AnimeCard item={item} />
                    </li>
                  ))}
                </ul>
                <div className="clear" />
              </article>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
