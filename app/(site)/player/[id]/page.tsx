import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import CommentSection from '@/components/site/CommentSection';
import VideoPlayer from '@/components/site/VideoPlayer';
import ViewTracker from '@/components/site/ViewTracker';
import { getCurrentUser } from '@/lib/auth';
import { formatDuration } from '@/lib/format';
import { streamingLinks } from '@/lib/media';
import { getPlayback, hasBought, listComments } from '@/lib/queries';

export const metadata = { title: '在线播放' };

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playback = await getPlayback(id);
  if (!playback) notFound();

  const { video, anime, chapters } = playback;
  const official = streamingLinks(anime.links);
  const user = await getCurrentUser();
  const bought = user ? await hasBought(user.id, anime.id) : false;
  const canPlay = anime.price === 0 || video.isFree || bought;
  if (!canPlay) redirect(`/anime/${anime.id}`);

  const comments = await listComments(anime.id);

  return (
    <div style={{ backgroundColor: '#0b0f14', paddingBottom: 30 }}>
      <section className="p-h-header">
        <div className="p-h-head">
          <a className="p-h-goback" href={`/anime/${anime.id}`}>
            <span style={{ color: '#fff' }}>← 返回详情</span>
          </a>
          <h2 className="p-h-title" style={{ color: '#fff' }}>
            {anime.title} · {video.title}
          </h2>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 20 }}>
        <ViewTracker animeId={anime.id} videoId={video.id} />
        <div className="c-infor-box">
          <article className="fl col-7">
            <section className="mr30">
              <VideoPlayer src={video.sourceUrl} title={`${anime.title} ${video.title}`} />
              <div style={{ padding: '12px 0' }}>
                <p className="c-999" style={{ fontSize: 12, lineHeight: 1.8 }}>
                  当前资源位：{video.title}。本站只挂载该作品自己公开的官方预告 / 正版嵌入源，不提供未授权的全集片源；
                  完整版请走下方官方渠道。管理员可在后台「剧集」里为每一集填入已授权的正版源地址。
                </p>
                {official.length > 0 && (
                  <p style={{ marginTop: 8 }}>
                    <span className="c-999" style={{ fontSize: 12, marginRight: 8 }}>
                      官方观看：
                    </span>
                    {official.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="comm-btn c-btn-1"
                        style={{ marginRight: 6, padding: '4px 12px', fontSize: 12 }}
                      >
                        {link.site}
                      </a>
                    ))}
                  </p>
                )}
              </div>
              <div className="mt50" style={{ background: '#fff', padding: 16, borderRadius: 6 }}>
                <h6 className="c-g-content c-infor-title">
                  <span>弹幕评论（{comments.length}）</span>
                </h6>
                <CommentSection animeId={anime.id} initial={comments} loggedIn={Boolean(user)} />
              </div>
            </section>
          </article>

          <aside className="fl col-3">
            <div className="i-box" style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
              <section className="c-infor-tabTitle c-tab-title">
                <Link href={`/anime/${anime.id}`} title={anime.title}>
                  {anime.title}
                </Link>
              </section>
              {chapters.map((chapter) => (
                <div key={chapter.id}>
                  <h6 className="c-333 fsize14 mt10">{chapter.title}</h6>
                  <ul className="lh-menu" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {chapter.videos.map((item) => (
                      <li key={item.id} className="lh-menu-second ml30" style={{ marginLeft: 0 }}>
                        <Link
                          href={`/player/${item.id}`}
                          className={item.id === video.id ? 'current-1' : ''}
                          style={{ display: 'block', padding: '6px 4px', borderBottom: '1px dotted #eee' }}
                        >
                          <em className="lh-menu-i-2 icon16 mr5">&nbsp;</em>
                          {item.title}
                          <span className="fr c-999 fsize12">{formatDuration(item.duration)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
          <div className="clear" />
        </div>
      </div>
    </div>
  );
}
