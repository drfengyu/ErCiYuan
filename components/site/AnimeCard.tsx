import Link from 'next/link';

export type CardAnime = {
  id: string;
  title: string;
  cover: string;
  episodesCount: number;
  viewCount: number;
  price: number;
  score?: number | null;
  year?: number;
};

export default function AnimeCard({
  item,
  href,
  metricLabel = '播放量',
}: {
  item: CardAnime;
  href?: string;
  metricLabel?: string;
}) {
  const link = href ?? `/anime/${item.id}`;
  const internal = !href;
  const imgStyle = { width: '100%', height: 200, objectFit: 'cover' as const, display: 'block' };
  return (
    <div className="cc-l-wrap">
      <section className="anime-img">
        {internal ? (
          <Link href={link}>
            <img src={item.cover} alt={item.title} className="img-responsive" style={imgStyle} />
            <div className="cc-mask">
              <span className="comm-btn c-btn-1">开始观看</span>
            </div>
          </Link>
        ) : (
          <a href={link} target="_blank" rel="noreferrer">
            <img src={item.cover} alt={item.title} className="img-responsive" style={imgStyle} />
            <div className="cc-mask">
              <span className="comm-btn c-btn-1">查看详情</span>
            </div>
          </a>
        )}
      </section>
      <h3 className="hLh30 txtOf mt10" style={{ textAlign: 'center' }}>
        {internal ? (
          <Link href={link} title={item.title} className="anime-title fsize18 c-333">
            {item.title}
          </Link>
        ) : (
          <a href={link} target="_blank" rel="noreferrer" title={item.title} className="anime-title fsize18 c-333">
            {item.title}
          </a>
        )}
      </h3>
      <section className="mt10 hLh20 of">
        <span className="fr jgTag" style={{ borderRadius: '10%' }}>
          <i className="c-blue fsize12 f-fA">
            {item.score ? `评分 ${Math.round(item.score)}` : `更新至 ${item.episodesCount || '?'} 集`}
          </i>
        </span>
        <span className="fl jgAttr c-ccc f-fA">
          <i className="c-999 f-fA">
            {metricLabel}：{item.viewCount}
          </i>
        </span>
      </section>
    </div>
  );
}
