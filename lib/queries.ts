import { and, asc, count, desc, eq, inArray, like, or, sql } from 'drizzle-orm';
import { getDb } from './db';
import * as t from './db/schema';
import { parseJson } from './format';
import type { Anime, Category, Comment, Maker, User, Video } from './db/schema';

export type AnimeView = Anime & {
  genresList: string[];
  links: { site: string; url: string; type: string }[];
  makerName: string;
  categoryName: string;
};

export type ChapterNode = t.Chapter & { videos: Video[] };

function decorate(row: Anime, maker?: Maker, category?: Category): AnimeView {
  return {
    ...row,
    genresList: parseJson<string[]>(row.genres, []),
    links: parseJson<{ site: string; url: string; type: string }[]>(row.externalLinks, []),
    makerName: maker?.name ?? '',
    categoryName: category?.name ?? '',
  };
}

async function withRelations(rows: Anime[]) {
  if (rows.length === 0) return [];
  const { db } = await getDb();
  const makerIds = [...new Set(rows.map((r) => r.makerId).filter(Boolean))];
  const categoryIds = [...new Set(rows.map((r) => r.categoryId).filter(Boolean))];
  const [makerRows, categoryRows] = await Promise.all([
    makerIds.length
      ? db.select().from(t.makers).where(inArray(t.makers.id, makerIds))
      : Promise.resolve([] as Maker[]),
    categoryIds.length
      ? db.select().from(t.categories).where(inArray(t.categories.id, categoryIds))
      : Promise.resolve([] as Category[]),
  ]);
  const makerMap = new Map(makerRows.map((m) => [m.id, m]));
  const categoryMap = new Map(categoryRows.map((c) => [c.id, c]));
  return rows.map((r) => decorate(r, makerMap.get(r.makerId), categoryMap.get(r.categoryId)));
}

export async function getAds(typeId = '1') {
  const { db } = await getDb();
  return db.select().from(t.ads).where(eq(t.ads.typeId, typeId)).orderBy(asc(t.ads.sort)).all();
}

export async function getFeaturedAnime(limit = 12) {
  const { db } = await getDb();
  const rows = await db
    .select()
    .from(t.anime)
    .where(and(eq(t.anime.published, true), eq(t.anime.featured, true)))
    .orderBy(desc(t.anime.viewCount))
    .limit(limit);
  return withRelations(rows);
}

export async function getPopularAnime(limit = 12) {
  const { db } = await getDb();
  const rows = await db
    .select()
    .from(t.anime)
    .where(eq(t.anime.published, true))
    .orderBy(desc(t.anime.viewCount))
    .limit(limit);
  return withRelations(rows);
}

export async function getLatestAnime(limit = 12) {
  const { db } = await getDb();
  const rows = await db
    .select()
    .from(t.anime)
    .where(eq(t.anime.published, true))
    .orderBy(desc(t.anime.updatedAt))
    .limit(limit);
  return withRelations(rows);
}

export async function getHotMakers(limit = 8) {
  const { db } = await getDb();
  return db.select().from(t.makers).orderBy(asc(t.makers.sort)).limit(limit);
}

export type ListQuery = {
  title?: string;
  parentId?: string;
  categoryId?: string;
  genre?: string;
  year?: number;
  sort?: 'views' | 'updated' | 'episodes' | 'score';
  desc?: boolean;
  page?: number;
  size?: number;
};

export async function searchAnime(q: ListQuery) {
  const { db } = await getDb();
  const page = Math.max(1, Number(q.page || 1));
  const size = Math.min(48, Math.max(1, Number(q.size || 12)));

  const filters = [eq(t.anime.published, true)];
  if (q.title) {
    const keyword = `%${q.title}%`;
    filters.push(or(like(t.anime.title, keyword), like(t.anime.enTitle, keyword), like(t.anime.titleJp, keyword))!);
  }
  if (q.categoryId) filters.push(eq(t.anime.categoryId, q.categoryId));
  else if (q.parentId) {
    const children = await db.select().from(t.categories).where(eq(t.categories.parentId, q.parentId));
    const ids = [q.parentId, ...children.map((c) => c.id)];
    filters.push(inArray(t.anime.categoryId, ids));
  }
  // 类型存在 JSON 文本列里，只能按 "Genre" 片段匹配；先剥掉 LIKE 通配符，避免筛选词被当模式用。
  if (q.genre) filters.push(like(t.anime.genres, `%"${q.genre.replace(/[%_]/g, '')}"%`));
  if (q.year) filters.push(eq(t.anime.year, q.year));

  const order =
    q.sort === 'updated'
      ? desc(t.anime.updatedAt)
      : q.sort === 'episodes'
        ? desc(t.anime.episodesCount)
        : q.sort === 'score'
          ? desc(t.anime.score)
          : desc(t.anime.viewCount);

  const [rows, totalRow] = await Promise.all([
    db.select().from(t.anime).where(and(...filters)).orderBy(order).limit(size).offset((page - 1) * size),
    db.select({ n: count() }).from(t.anime).where(and(...filters)),
  ]);
  return { items: await withRelations(rows), total: Number(totalRow[0]?.n ?? 0), page, size };
}

/** 列表页筛选条的数据源：只列出库里真实存在、且数量够多的类型与年份。 */
export async function getAnimeFacets(minGenreCount = 3) {
  const { db } = await getDb();
  const rows = await db
    .select({ genres: t.anime.genres, year: t.anime.year })
    .from(t.anime)
    .where(eq(t.anime.published, true));

  const genreCount = new Map<string, number>();
  const yearCount = new Map<number, number>();
  for (const row of rows) {
    for (const genre of parseJson<string[]>(row.genres, [])) {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
    }
    if (row.year > 0) yearCount.set(row.year, (yearCount.get(row.year) ?? 0) + 1);
  }

  const genres = [...genreCount.entries()]
    .filter(([, n]) => n >= minGenreCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 18)
    .map(([name, n]) => ({ name, n }));
  const years = [...yearCount.entries()]
    .sort((a, b) => b[0] - a[0])
    .slice(0, 12)
    .map(([year]) => year);

  return { genres, years };
}

export async function suggestTitles(keyword: string, limit = 8) {
  if (!keyword.trim()) return [];
  const { db } = await getDb();
  const rows = await db
    .select({ id: t.anime.id, title: t.anime.title })
    .from(t.anime)
    .where(or(like(t.anime.title, `%${keyword}%`), like(t.anime.enTitle, `%${keyword}%`)))
    .limit(limit);
  return rows;
}

export async function getNestedCategories() {
  const { db } = await getDb();
  const all = await db.select().from(t.categories).orderBy(asc(t.categories.sort));
  return all
    .filter((c) => !c.parentId)
    .map((root) => ({ ...root, children: all.filter((c) => c.parentId === root.id) }));
}

export async function findAnime(id: string): Promise<Anime | undefined> {
  const { db } = await getDb();
  const [row] = await db.select().from(t.anime).where(eq(t.anime.id, id)).limit(1);
  return row;
}

export async function getAnimeDetail(id: string) {
  const row = await findAnime(id);
  if (!row) return null;
  const { db } = await getDb();
  const [maker, category, chapterRows, commentRows] = await Promise.all([
    row.makerId ? db.select().from(t.makers).where(eq(t.makers.id, row.makerId)).limit(1).then((r) => r[0]) : undefined,
    db.select().from(t.categories).where(eq(t.categories.id, row.categoryId)).limit(1).then((r) => r[0]),
    db.select().from(t.chapters).where(eq(t.chapters.animeId, id)).orderBy(asc(t.chapters.sort)),
    db
      .select({ c: t.comments, u: t.users.nickname, avatar: t.users.avatar })
      .from(t.comments)
      .leftJoin(t.users, eq(t.comments.userId, t.users.id))
      .where(eq(t.comments.animeId, id))
      .orderBy(desc(t.comments.createdAt)),
  ]);
  const chapterNodes: ChapterNode[] = [];
  for (const chapter of chapterRows) {
    const videos = await db.select().from(t.videos).where(eq(t.videos.chapterId, chapter.id)).orderBy(asc(t.videos.sort));
    chapterNodes.push({ ...chapter, videos });
  }
  const comments = commentRows.map((r) => ({
    id: r.c.id,
    parentId: r.c.parentId,
    content: r.c.content,
    createdAt: r.c.createdAt,
    nickname: r.u ?? '匿名用户',
    avatar: r.avatar || '/assets/img/avatar-boy.gif',
  }));
  return { anime: decorate(row, maker, category), maker, chapters: chapterNodes, comments };
}

export async function listMakers() {
  const { db } = await getDb();
  return db.select().from(t.makers).orderBy(asc(t.makers.sort));
}

export async function getMakerDetail(id: string) {
  const { db } = await getDb();
  const [maker] = await db.select().from(t.makers).where(eq(t.makers.id, id)).limit(1);
  if (!maker) return null;
  const rows = await db.select().from(t.anime).where(and(eq(t.anime.makerId, id), eq(t.anime.published, true))).orderBy(desc(t.anime.viewCount));
  return { maker, anime: await withRelations(rows) };
}

export async function getPlayback(videoId: string) {
  const { db } = await getDb();
  const [video] = await db.select().from(t.videos).where(eq(t.videos.id, videoId)).limit(1);
  if (!video) return null;
  const row = await findAnime(video.animeId);
  if (!row) return null;
  const chapterRows = await db.select().from(t.chapters).where(eq(t.chapters.animeId, video.animeId)).orderBy(asc(t.chapters.sort));
  const chapters: ChapterNode[] = [];
  for (const chapter of chapterRows) {
    const list = await db.select().from(t.videos).where(eq(t.videos.chapterId, chapter.id)).orderBy(asc(t.videos.sort));
    chapters.push({ ...chapter, videos: list });
  }
  const [maker] = row.makerId
    ? await db.select().from(t.makers).where(eq(t.makers.id, row.makerId)).limit(1)
    : [];
  return { video, anime: decorate(row, maker), chapters };
}

export async function hasBought(userId: string, animeId: string) {
  const { db } = await getDb();
  const rows = await db
    .select({ id: t.orders.id })
    .from(t.orders)
    .where(and(eq(t.orders.userId, userId), eq(t.orders.animeId, animeId), eq(t.orders.status, 1)))
    .limit(1);
  return rows.length > 0;
}

export async function isFavorite(userId: string, animeId: string) {
  const { db } = await getDb();
  const rows = await db
    .select({ id: t.favorites.id })
    .from(t.favorites)
    .where(and(eq(t.favorites.userId, userId), eq(t.favorites.animeId, animeId)))
    .limit(1);
  return rows.length > 0;
}

export async function listFavorites(userId: string) {
  const { db } = await getDb();
  const rows = await db.select().from(t.favorites).where(eq(t.favorites.userId, userId)).orderBy(desc(t.favorites.createdAt));
  const animeRows = await db.select().from(t.anime).where(inArray(t.anime.id, rows.map((r) => r.animeId)));
  return withRelations(animeRows);
}

export async function listUserOrders(userId: string) {
  const { db } = await getDb();
  const rows = await db.select().from(t.orders).where(eq(t.orders.userId, userId)).orderBy(desc(t.orders.createdAt));
  const animeRows = await db.select().from(t.anime).where(inArray(t.anime.id, [...new Set(rows.map((r) => r.animeId))]));
  const map = new Map(animeRows.map((a) => [a.id, a]));
  return rows.map((o) => ({ ...o, animeTitle: map.get(o.animeId)?.title ?? o.animeId }));
}

export async function findOrder(orderId: string) {
  const { db } = await getDb();
  const [order] = await db.select().from(t.orders).where(eq(t.orders.id, orderId)).limit(1);
  if (!order) return null;
  const row = await findAnime(order.animeId);
  return { order, anime: row };
}

export async function getLocalAnilistMap() {
  const { db } = await getDb();
  const rows = await db.select({ anilistId: t.anime.anilistId, id: t.anime.id }).from(t.anime);
  const map = new Map<number, string>();
  for (const row of rows) {
    if (row.anilistId) map.set(row.anilistId, row.id);
  }
  return map;
}

export async function registerView(animeId: string, videoId?: string) {
  const { db } = await getDb();
  await db
    .update(t.anime)
    .set({ viewCount: sql`${t.anime.viewCount} + 1` })
    .where(eq(t.anime.id, animeId));
  if (videoId) {
    await db
      .update(t.videos)
      .set({ playCount: sql`${t.videos.playCount} + 1` })
      .where(eq(t.videos.id, videoId));
  }
}

export async function listComments(animeId: string) {
  const { db } = await getDb();
  const rows = await db
    .select({ c: t.comments, nickname: t.users.nickname, avatar: t.users.avatar })
    .from(t.comments)
    .leftJoin(t.users, eq(t.comments.userId, t.users.id))
    .where(eq(t.comments.animeId, animeId))
    .orderBy(desc(t.comments.createdAt));
  return rows.map((r) => ({
    id: r.c.id,
    parentId: r.c.parentId,
    content: r.c.content,
    createdAt: r.c.createdAt,
    nickname: r.nickname ?? '匿名用户',
    avatar: r.avatar || '/assets/img/avatar-boy.gif',
  }));
}

export type CommentNode = Comment & { nickname: string; avatar: string };

export async function findUserByMobile(mobile: string): Promise<User | undefined> {
  const { db } = await getDb();
  const [row] = await db.select().from(t.users).where(eq(t.users.mobile, mobile)).limit(1);
  return row;
}

/** sitemap.xml 的数据源，只收公开条目，并限制总量避免生成超大文件。 */
export async function getSitemapEntries(limit = 1000) {
  const { db } = await getDb();
  const [animeRows, makerRows] = await Promise.all([
    db
      .select({ id: t.anime.id, updatedAt: t.anime.updatedAt })
      .from(t.anime)
      .where(eq(t.anime.published, true))
      .orderBy(desc(t.anime.updatedAt))
      .limit(limit),
    db.select({ id: t.makers.id }).from(t.makers).limit(limit),
  ]);
  return {
    anime: animeRows.map((row) => ({ id: row.id, updatedAt: row.updatedAt })),
    makers: makerRows.map((row) => row.id),
  };
}
