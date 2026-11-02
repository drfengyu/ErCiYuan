import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BuyButton from '@/components/site/BuyButton';
import CommentSection from '@/components/site/CommentSection';
import FavoriteButton from '@/components/site/FavoriteButton';
import MakerPic from '@/components/site/MakerPic';
import TrailerEmbed from '@/components/site/TrailerEmbed';
import { getCurrentUser } from '@/lib/auth';
import { formatCount, formatDuration, formatMoney } from '@/lib/format';
import { genreLabel } from '@/lib/genres';
import { findAnime, getAnimeDetail, getNestedCategories, getProgress, hasBought, isFavorite } from '@/lib/queries';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const row = await findAnime(id);
  if (!row) return { title: '动漫不存在' };
  return {
    title: row.title,
    description: row.description.slice(0, 120) || `${row.title}（${row.year || '-'}）番剧详情`,
    openGraph: {
      title: row.title,
      description: row.description.slice(0, 120),
      images: row.cover ? [{ url: row.cover }] : [],
    },
  };
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAnimeDetail(id);
  if (!detail) notFound();

  const { anime, maker, chapters, comments } = detail;
  const user = await getCurrentUser();
  const [bought, collected, nested, progress] = await Promise.all([
    user ? hasBought(user.id, anime.id) : Promise.resolve(false),
    user ? isFavorite(user.id, anime.id) : Promise.resolve(false),
    getNestedCategories(),
    user ? getProgress(user.id, anime.id) : Promise.resolve(null),
  ]);

  const isBuy = anime.price === 0 || bought;
  const parent = nested.find((item) => item.id === anime.categoryId || item.children.some((c) => c.id === anime.categoryId));
  const allVideos = chapters.flatMap((chapter) => chapter.videos);
  const firstPlayable = allVideos.find((video) => isBuy || video.isFree);
  const resumeVideo = progress ? allVideos.find((video) => video.id === progress.videoId) : undefined;

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container">
        <section className="path-wrap txtOf hLh30">
          <Link href="/" className="c-999 fsize14">
            首页
          </Link>{' '}
          \{' '}
          <Link href="/anime" className="c-999 fsize14">
            动漫列表
          </Link>{' '}
          \{' '}
          {parent && (
            <>
              <Link href={`/anime?subjectParentId=${parent.id}`} className="c-333 fsize14">
                {parent.name}
              </Link>{' '}
              \{' '}
            </>
          )}
          <Link href={`/anime?subjectId=${anime.categoryId}`} className="c-333 fsize14">
            {anime.categoryName}
          </Link>
        </section>

        <div>
          <article className="c-v-pic-wrap" style={{ height: 357 }}>
            <section id="videoPlay" className="p-h-video-box">
              {anime.banner ? (
                <img src={anime.banner} alt={anime.title} width="640" height="360" className="dis c-v-pic" />
              ) : (
                <img src={anime.cover} alt={anime.title} width="640" height="360" className="dis c-v-pic" />
              )}
            </section>
          </article>
          <aside className="c-attr-wrap">
            <section className="ml20 mr15">
              <h2 className="hLh30 txtOf mt15">
                <span className="c-fff fsize24">{anime.title}</span>
              </h2>
              <p className="c-fff fsize12">
                {anime.titleJp} {anime.enTitle ? `· ${anime.enTitle}` : ''}
              </p>
              <section className="c-attr-jg">
                {anime.price === 0 ? (
                  <b className="c-blue2" style={{ fontSize: 24 }}>
                    免费观看
                  </b>
                ) : (
                  <b className="c-blue2" style={{ fontSize: 24 }}>
                    💰{formatMoney(anime.price)} 软妹币
                  </b>
                )}
              </section>
              <section className="c-attr-mt c-attr-undis">
                <span className="c-fff fsize14">
                  制作方：
                  {anime.makerName || '-'}&nbsp;&nbsp;&nbsp;
                  {anime.year ? `${anime.year} 年` : ''}&nbsp;&nbsp;&nbsp; 评分：{anime.score ?? '--'}
                </span>
              </section>
              <section className="c-attr-mt of">
                <FavoriteButton animeId={anime.id} initial={collected} />
              </section>
              <section className="c-attr-mt">
                {isBuy ? (
                  firstPlayable ? (
                    <Link href={`/player/${firstPlayable.id}`} title="立即观看" className="comm-btn c-btn-3">
                      立即观看
                    </Link>
                  ) : (
                    <span className="c-fff fsize14">暂无可播放剧集</span>
                  )
                ) : (
                  <BuyButton animeId={anime.id} />
                )}
              </section>
              {progress && resumeVideo && (
                <section className="c-attr-mt">
                  <Link href={`/player/${resumeVideo.id}`} title="继续观看" className="comm-btn c-btn-1">
                    继续观看 {resumeVideo.title} · {formatDuration(progress.positionSec)}
                  </Link>
                </section>
              )}
            </section>
          </aside>
          <aside className="thr-attr-box">
            <ol className="thr-attr-ol">
              <li>
                <p>&nbsp;</p>
                <aside>
                  <span style={{ color: '#4169E1' }} className="c-fff f-fM">
                    集数
                  </span>
                  <br />
                  <h6 style={{ color: '#4169E1' }} className="c-fff f-fM mt10">
                    {anime.episodesCount || allVideos.length}
                  </h6>
                </aside>
              </li>
              <li>
                <p>&nbsp;</p>
                <aside>
                  <img width="80" height="80" src="/assets/img/logo5.png" alt="" />
                </aside>
              </li>
              <li>
                <p>&nbsp;</p>
                <aside>
                  <span style={{ color: '#4169E1' }} className="c-fff f-fM">
                    播放量
                  </span>
                  <br />
                  <h6 style={{ color: '#4169E1' }} className="c-fff f-fM mt10">
                    {formatCount(anime.viewCount)}
                  </h6>
                </aside>
              </li>
            </ol>
          </aside>
          <div className="clear" />
        </div>

        <div className="mt20 c-infor-box">
          <article className="fl col-7">
            <section className="mr30">
              <div className="i-box">
                <div>
                  <section className="c-infor-tabTitle c-tab-title">
                    <a className="current" title="动漫介绍">
                      动漫介绍
                    </a>
                  </section>
                </div>
                <article className="ml10 mr10 pt20">
                  <div>
                    <h6 className="c-i-content c-infor-title">
                      <span>剧情简介</span>
                    </h6>
                    <div className="anime-txt-body-wrap">
                      <section className="anime-txt-body">{anime.description || '暂无简介'}</section>
                    </div>
                    {anime.genresList.length > 0 && (
                      <p className="mt10">
                        {anime.genresList.map((genre) => (
                          <Link
                            key={genre}
                            href={`/anime?genre=${encodeURIComponent(genre)}`}
                            className="list-tag"
                            style={{ marginRight: 6 }}
                          >
                            {genreLabel(genre)}
                          </Link>
                        ))}
                      </p>
                    )}
                  </div>

                  <div className="mt50">
                    <h6 className="c-g-content c-infor-title">
                      <span>动漫目录</span>
                    </h6>
                    <section className="mt20">
                      <div className="lh-menu-wrap">
                        <menu className="lh-menu mt10 mr10">
                          <ul>
                            {chapters.map((chapter) => (
                              <li key={chapter.id} className="lh-menu-stair">
                                <a title={chapter.title} href="javascript:void(0)" className="current-1">
                                  <em className="lh-menu-i-1 icon18 mr10" />
                                  {chapter.title}
                                </a>
                                <ol className="lh-menu-ol" style={{ display: 'block' }}>
                                  {chapter.videos.map((video) => {
                                    const playable = isBuy || video.isFree;
                                    return (
                                      <li key={video.id} className="lh-menu-second ml30">
                                        {playable ? (
                                          <Link href={`/player/${video.id}`} title={video.title}>
                                            <span className="fr">
                                              <i className="free-icon vam mr10">让我康康</i>
                                            </span>
                                            <em className="lh-menu-i-2 icon16 mr5">&nbsp;</em>
                                            {video.title}
                                          </Link>
                                        ) : (
                                          <a href={`/order/new?animeId=${anime.id}`} title={video.title}>
                                            <span className="fr">
                                              <i className="free-icon vam mr10">请先购买</i>
                                            </span>
                                            <em className="lh-menu-i-2 icon16 mr5">&nbsp;</em>
                                            {video.title}
                                          </a>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ol>
                              </li>
                            ))}
                          </ul>
                        </menu>
                      </div>
                    </section>
                  </div>

                  {anime.trailer && (
                    <div className="mt50">
                      <h6 className="c-g-content c-infor-title">
                        <span>预告片</span>
                      </h6>
                      <div style={{ paddingTop: 16 }}>
                        <TrailerEmbed videoId={anime.trailer} poster={anime.banner || anime.cover} title={anime.title} />
                      </div>
                    </div>
                  )}

                  <div className="mt50">
                    <h6 className="c-g-content c-infor-title">
                      <span>评论区（{comments.length}）</span>
                    </h6>
                    <div className="mt20">
                      <CommentSection animeId={anime.id} initial={comments} loggedIn={Boolean(user)} />
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </article>

          <aside className="fl col-3">
            <div className="i-box">
              <div>
                <section className="c-infor-tabTitle c-tab-title">
                  <a title={maker?.name ?? '制作方'} href={maker ? `/maker/${maker.id}` : 'javascript:void(0)'}>
                    {maker?.name ?? '制作方'}
                  </a>
                </section>
                <section className="stud-act-list">
                  <ul style={{ height: 'auto' }}>
                    <li style={{ paddingLeft: 0, height: 'auto' }}>
                      <div className="u-face">
                        <a href={maker ? `/maker/${maker.id}` : '#'}>
                          <MakerPic name={maker?.name ?? anime.makerName ?? '制作方'} src={maker?.avatar} width={100} height={26} />
                        </a>
                      </div>
                      <section style={{ paddingTop: 30 }}>
                        <span className="c-999">{maker?.intro || anime.makerName}</span>
                      </section>
                    </li>
                  </ul>
                </section>
              </div>

              <div className="mt20">
                <section className="c-infor-tabTitle c-tab-title">
                  <a title="官方资源" href="javascript:void(0)">
                    官方资源
                  </a>
                </section>
                <ul className="c-999 fsize14" style={{ lineHeight: '28px', paddingLeft: 10 }}>
                  {anime.anilistUrl && (
                    <li>
                      <a href={anime.anilistUrl} target="_blank" rel="noreferrer">
                        AniList 条目
                      </a>
                    </li>
                  )}
                  {anime.bangumiUrl && (
                    <li>
                      <a href={anime.bangumiUrl} target="_blank" rel="noreferrer">
                        Bangumi 条目
                      </a>
                    </li>
                  )}
                  {anime.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.site}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
          <div className="clear" />
        </div>
      </section>
    </div>
  );
}
