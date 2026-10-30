import Link from 'next/link';
import AnimeCard from '@/components/site/AnimeCard';
import HeroCarousel from '@/components/site/HeroCarousel';
import MakerPic from '@/components/site/MakerPic';
import { anilistSeasonal, currentSeason } from '@/lib/anilist';
import { getAds, getFeaturedAnime, getHotMakers, getLocalAnilistMap, getPopularAnime } from '@/lib/queries';

const SEASON_CN = { WINTER: '冬季', SPRING: '春季', SUMMER: '夏季', FALL: '秋季' } as const;

export default async function HomePage() {
  const [ads, featured, popular, makers, localMap] = await Promise.all([
    getAds('1'),
    getFeaturedAnime(12),
    getPopularAnime(12),
    getHotMakers(8),
    getLocalAnilistMap(),
  ]);
  const seasonal = await anilistSeasonal(12);
  const { season, year } = currentSeason();

  // 推荐位按 12 张补齐（12 同时是 3 列与 4 列的整数倍），避免末尾空位。
  const ROW_TARGET = 12;
  const recommended =
    featured.length >= ROW_TARGET
      ? featured.slice(0, ROW_TARGET)
      : [...featured, ...popular.filter((item) => !featured.some((f) => f.id === item.id))].slice(0, ROW_TARGET);

  return (
    <div>
      <HeroCarousel
        items={ads.map((ad) => ({
          id: ad.id,
          title: ad.title,
          imageUrl: ad.imageUrl,
          linkUrl: ad.linkUrl,
          color: ad.color,
        }))}
      />

      <div id="aCoursesList">
        <div>
          <section className="container">
            <header className="comm-title">
              <h2 className="tac">
                <span className="c-333">热门推荐</span>
              </h2>
            </header>
            <article className="comm-anime-list">
              <ul id="bna" className="of">
                {recommended.map((item) => (
                  <li key={item.id}>
                    <AnimeCard item={item} />
                  </li>
                ))}
              </ul>
              <div className="clear" />
            </article>
            <section className="tac pt20">
              <Link href="/anime" title="全部动漫" className="comm-btn c-btn-2">
                全部动漫
              </Link>
            </section>
          </section>
        </div>

        {seasonal.length > 0 && (
        <div style={{ background: '#fff' }}>
          <section className="container">
            <header className="comm-title">
              <h2 className="tac">
                <span className="c-333">
                  {year} {SEASON_CN[season]}新番
                </span>
              </h2>
              <p className="tac c-999 fsize12 mt10">
                实时数据来自 AniList GraphQL 公开接口 · 点击卡片跳转官方条目
              </p>
            </header>
            <article className="comm-anime-list">
              <ul className="of">
                {seasonal.map((media) => {
                    const localId = media.id ? localMap.get(media.id) : undefined;
                    const title = media.title.english || media.title.romaji || media.title.native || '未命名';
                    return (
                      <li key={media.id}>
                        <AnimeCard
                          item={{
                            id: String(media.id),
                            title: title.slice(0, 18),
                            cover: media.coverImage.large || media.coverImage.extraLarge || '/assets/img/default-img.gif',
                            episodesCount: media.episodes ?? 0,
                            viewCount: media.popularity ?? 0,
                            score: media.meanScore,
                            price: 0,
                          }}
                          href={localId ? `/anime/${localId}` : `https://anilist.co/anime/${media.id}`}
                          metricLabel="AniList 人气"
                        />
                      </li>
                    );
                  })}
              </ul>
              <div className="clear" />
            </article>
          </section>
        </div>
        )}

        <div>
          <section className="container">
            <header className="comm-title">
              <h2 className="tac">
                <span className="c-333">播放排行</span>
              </h2>
            </header>
            <article className="comm-anime-list">
              <ul className="of">
                {popular.map((item) => (
                  <li key={item.id}>
                    <AnimeCard item={item} />
                  </li>
                ))}
              </ul>
              <div className="clear" />
            </article>
          </section>
        </div>

        <div style={{ background: '#fff' }}>
          <section className="container">
            <header className="comm-title">
              <h2 className="tac">
                <span className="c-333">热门制作方</span>
              </h2>
            </header>
            <article className="i-admin-list">
              <ul className="of">
                {makers.map((admin) => (
                  <li key={admin.id}>
                    <section className="i-admin-wrap">
                      <div className="i-admin-pic">
                        <Link href={`/maker/${admin.id}`} title={admin.name}>
                          <MakerPic name={admin.name} src={admin.avatar} />
                        </Link>
                      </div>
                      <div className="mt10 hLh30 txtOf tac">
                        <Link href={`/maker/${admin.id}`} title={admin.name} className="fsize18 c-666">
                          {admin.name}
                        </Link>
                      </div>
                      <div className="hLh30 txtOf tac">
                        <span className="fsize14 c-999">{admin.career}</span>
                      </div>
                      <div className="mt15 i-q-txt">
                        <p className="c-999 f-fA">{admin.intro}</p>
                      </div>
                    </section>
                  </li>
                ))}
              </ul>
              <div className="clear" />
            </article>
            <section className="tac pt20">
              <Link href="/maker" title="全部制作方" className="comm-btn c-btn-2">
                全部制作方
              </Link>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
