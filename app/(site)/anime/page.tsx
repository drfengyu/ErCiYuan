import Link from 'next/link';
import AnimeCard from '@/components/site/AnimeCard';
import { getAnimeFacets, getNestedCategories, searchAnime } from '@/lib/queries';
import { genreLabel } from '@/lib/genres';

type Sp = Record<string, string | undefined>;

const SORTS = [
  { key: 'views', label: '观看量' },
  { key: 'updated', label: '最近更新' },
  { key: 'episodes', label: '总集数' },
  { key: 'score', label: '评分' },
] as const;

const SIZE = 12;

function qs(sp: Sp, overrides: Record<string, string | number | undefined>) {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) if (v) merged[k] = v;
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined || v === '') delete merged[k];
    else merged[k] = String(v);
  }
  if (!('page' in overrides)) delete merged.page;
  const search = new URLSearchParams(merged).toString();
  return search ? `/anime?${search}` : '/anime';
}

export const metadata = { title: '动漫列表' };

export default async function AnimeListPage({ searchParams }: { searchParams: Promise<Sp> }) {
  const sp = await searchParams;
  const sort = (sp.sort as 'views' | 'updated' | 'episodes' | 'score') || 'views';
  const desc = sp.order !== 'asc';
  const page = Math.max(1, Number(sp.page || 1));
  const year = Number(sp.year || 0) || undefined;

  const [nested, facets, result] = await Promise.all([
    getNestedCategories(),
    getAnimeFacets(),
    searchAnime({
      title: sp.title,
      parentId: sp.subjectParentId,
      categoryId: sp.subjectId,
      genre: sp.genre,
      year,
      sort,
      desc,
      page,
      size: SIZE,
    }),
  ]);

  const activeParent = nested.find((item) => item.id === sp.subjectParentId);
  const totalPages = Math.max(1, Math.ceil(result.total / SIZE));
  const hasFilter = Boolean(sp.subjectParentId || sp.subjectId || sp.genre || sp.year || sp.title);

  return (
    <div id="aCoursesList" className="bg-fa of">
      <section className="container">
        <header className="comm-title">
          <h2 className="fl tac">
            <span className="c-333">全部动漫</span>
          </h2>
          {hasFilter && (
            <p className="fr c-999 fsize14" style={{ lineHeight: '28px' }}>
              筛选出 {result.total} 部 ·{' '}
              <Link href="/anime" className="c-blue">
                清除全部筛选
              </Link>
            </p>
          )}
          <div className="clear" />
        </header>
        <section className="c-sort-box">
          <section className="c-s-dl">
            <dl>
              <dt>
                <span className="c-999 fsize14">动漫分类</span>
              </dt>
              <dd className="c-s-dl-li">
                <ul className="clearfix">
                  <li className={!sp.subjectParentId ? 'current' : ''}>
                    <Link href={qs(sp, { subjectParentId: undefined, subjectId: undefined, page: 1 })}>全部</Link>
                  </li>
                  {nested.map((item) => (
                    <li key={item.id} className={sp.subjectParentId === item.id ? 'current' : ''}>
                      <Link href={qs(sp, { subjectParentId: item.id, subjectId: undefined, page: 1 })}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
            {activeParent && (
              <dl>
                <dt>
                  <span className="c-999 fsize14" />
                </dt>
                <dd className="c-s-dl-li">
                  <ul className="clearfix">
                    <li className={!sp.subjectId ? 'current' : ''}>
                      <Link href={qs(sp, { subjectId: undefined, page: 1 })}>全部</Link>
                    </li>
                    {activeParent.children.map((item) => (
                      <li key={item.id} className={sp.subjectId === item.id ? 'current' : ''}>
                        <Link href={qs(sp, { subjectId: item.id, page: 1 })}>{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
            )}
            {facets.genres.length > 0 && (
              <dl>
                <dt>
                  <span className="c-999 fsize14">动漫类型</span>
                </dt>
                <dd className="c-s-dl-li">
                  <ul className="clearfix">
                    <li className={!sp.genre ? 'current' : ''}>
                      <Link href={qs(sp, { genre: undefined, page: 1 })}>不限</Link>
                    </li>
                    {facets.genres.map((item) => (
                      <li key={item.name} className={sp.genre === item.name ? 'current' : ''}>
                        <Link href={qs(sp, { genre: item.name, page: 1 })}>{genreLabel(item.name)}</Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
            )}
            {facets.years.length > 0 && (
              <dl>
                <dt>
                  <span className="c-999 fsize14">开播年份</span>
                </dt>
                <dd className="c-s-dl-li">
                  <ul className="clearfix">
                    <li className={!sp.year ? 'current' : ''}>
                      <Link href={qs(sp, { year: undefined, page: 1 })}>不限</Link>
                    </li>
                    {facets.years.map((item) => (
                      <li key={item} className={year === item ? 'current' : ''}>
                        <Link href={qs(sp, { year: item, page: 1 })}>{item}</Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
            )}
            <div className="clear" />
          </section>

          <div className="js-wrap">
            <section className="fr">
              <span className="c-ccc">
                <i className="c-master f-fM">{page}</i>/
                <i className="c-666 f-fM">{totalPages}</i>
                <i className="c-666 f-fM ml10">共 {result.total} 部</i>
              </span>
            </section>
            <section className="fl">
              <ol className="js-tap clearfix">
                {SORTS.map((item) => {
                  const isActive = sort === item.key;
                  const nextOrder = isActive && desc ? 'asc' : 'desc';
                  return (
                    <li key={item.key} className={isActive ? 'current bg-blue' : ''}>
                      <Link href={qs(sp, { sort: item.key, order: nextOrder, page: 1 })}>
                        {item.label} <i>{isActive ? (desc ? '☝' : '👇') : '👇'}</i>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          {sp.title && (
            <p className="mt20 c-666 fsize14">
              搜索 “{sp.title}” 的结果 ·{' '}
              <Link href={qs(sp, { title: undefined, page: 1 })} className="c-blue">
                清除关键词
              </Link>
            </p>
          )}

          <div className="mt40">
            {result.items.length === 0 ? (
              <section className="no-data-wrap">
                <img src="/assets/img/noData.png" style={{ width: 150, height: 150, display: 'inline' }} className="img-responsive" alt="无数据" />
                <br />
                <span className="c-666 fsize14 ml10 vam">没有相关动漫</span>
              </section>
            ) : (
              <article className="comm-anime-list">
                <ul id="bna" className="of">
                  {result.items.map((item) => (
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

      {totalPages > 1 && (
        <div className="tac" style={{ padding: '30px 0' }}>
          {pageWindow(page, totalPages).map((n, i) =>
            n === 0 ? (
              <span key={`gap-${i}`} className="c-999" style={{ margin: '0 6px' }}>
                …
              </span>
            ) : (
              <Link
                key={n}
                href={qs(sp, { page: n })}
                className={`comm-btn c-btn-2 ${n === page ? 'c-btn-3' : ''}`}
                style={{ margin: '0 4px', padding: '6px 14px' }}
              >
                {n}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// 页码窗口：首尾恒显，当前页左右各两页，中间用省略号，避免片库变大后铺开上百个按钮。
function pageWindow(page: number, totalPages: number) {
  const pages: number[] = [];
  const push = (n: number) => {
    if (n === pages[pages.length - 1]) return;
    if (pages.length && n - (pages[pages.length - 1] as number) > 1) pages.push(0);
    pages.push(n);
  };
  push(1);
  for (let n = Math.max(2, page - 2); n <= Math.min(totalPages - 1, page + 2); n++) push(n);
  if (totalPages > 1) push(totalPages);
  return pages;
}
