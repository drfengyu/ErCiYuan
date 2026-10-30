import AnimeCard from '@/components/site/AnimeCard';
import UserTabs from '@/components/site/UserTabs';
import { requireUser } from '@/lib/auth';
import { listFavorites } from '@/lib/queries';

export default async function CollectPage() {
  const user = await requireUser('/ucenter/collect');
  const items = await listFavorites(user.id);

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container">
        <header className="comm-title">
          <h2 className="fl tac">
            <span className="c-333">我的收藏</span>
          </h2>
        </header>
        <UserTabs active="/ucenter/collect" />
        {items.length === 0 ? (
          <section className="no-data-wrap">
            <img src="/assets/img/noData.png" style={{ width: 150, height: 150, display: 'inline' }} className="img-responsive" alt="无数据" />
            <br />
            <span className="c-666 fsize14 ml10 vam">还没有收藏，去番剧详情页点一下收藏吧</span>
          </section>
        ) : (
          <article className="comm-anime-list">
            <ul className="of">
              {items.map((item) => (
                <li key={item.id}>
                  <AnimeCard item={item} />
                </li>
              ))}
            </ul>
            <div className="clear" />
          </article>
        )}
      </section>
    </div>
  );
}
