import Link from 'next/link';
import MakerPic from '@/components/site/MakerPic';
import { listMakers } from '@/lib/queries';

export default async function MakerListPage() {
  const items = await listMakers();

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container">
        <header className="comm-title">
          <h2 className="fl tac">
            <span className="c-333">制作方</span>
          </h2>
        </header>
        <section className="c-sort-box unBr">
          <div>
            {items.length === 0 ? (
              <section className="no-data-wrap">
                <img src="/assets/img/noData.png" style={{ width: 150, height: 150, display: 'inline' }} className="img-responsive" alt="无数据" />
                <br />
                <span className="c-666 fsize14 ml10 vam">没有相关制作方</span>
              </section>
            ) : (
              <article className="i-admin-list">
                <ul className="of">
                  {items.map((item) => (
                    <li key={item.id}>
                      <section className="i-admin-wrap">
                        <div className="i-admin-pic">
                          <Link title={item.name} href={`/maker/${item.id}`}>
                            <MakerPic name={item.name} src={item.avatar} height={31} />
                          </Link>
                        </div>
                        <div className="mt10 hLh30 txtOf tac">
                          <Link title={item.name} href={`/maker/${item.id}`} className="fsize18 c-666">
                            {item.name}
                          </Link>
                        </div>
                        <div className="hLh30 txtOf tac">
                          <span className="fsize14 c-999">{item.career}</span>
                        </div>
                        <div className="mt15 i-q-txt">
                          <p className="c-999 f-fA">{item.intro}</p>
                        </div>
                      </section>
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
