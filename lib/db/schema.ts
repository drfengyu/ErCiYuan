import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  mobile: text('mobile').notNull().unique(),
  password: text('password').notNull(),
  nickname: text('nickname').notNull(),
  avatar: text('avatar').notNull().default(''),
  role: text('role').notNull().default('MEMBER'),
  disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('createdAt').notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  parentId: text('parentId').notNull().default(''),
  sort: integer('sort').notNull().default(0),
});

export const makers = sqliteTable('makers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar').notNull().default(''),
  intro: text('intro').notNull().default(''),
  career: text('career').notNull().default(''),
  sort: integer('sort').notNull().default(0),
});

export const anime = sqliteTable('anime', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  titleJp: text('titleJp').notNull().default(''),
  enTitle: text('enTitle').notNull().default(''),
  description: text('description').notNull().default(''),
  cover: text('cover').notNull(),
  banner: text('banner').notNull().default(''),
  year: integer('year').notNull().default(0),
  episodesCount: integer('episodesCount').notNull().default(0),
  duration: integer('duration').notNull().default(24),
  score: real('score'),
  genres: text('genres').notNull().default('[]'),
  makerId: text('makerId').notNull().default(''),
  categoryId: text('categoryId').notNull(),
  trailer: text('trailer').notNull().default(''),
  externalLinks: text('externalLinks').notNull().default('[]'),
  anilistId: integer('anilistId'),
  bangumiId: integer('bangumiId'),
  anilistUrl: text('anilistUrl').notNull().default(''),
  bangumiUrl: text('bangumiUrl').notNull().default(''),
  price: real('price').notNull().default(0),
  viewCount: integer('viewCount').notNull().default(0),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

export const chapters = sqliteTable('chapters', {
  id: text('id').primaryKey(),
  animeId: text('animeId').notNull(),
  title: text('title').notNull(),
  sort: integer('sort').notNull().default(0),
});

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  animeId: text('animeId').notNull(),
  chapterId: text('chapterId').notNull(),
  title: text('title').notNull(),
  sourceUrl: text('sourceUrl').notNull(),
  duration: integer('duration').notNull().default(0),
  isFree: integer('isFree', { mode: 'boolean' }).notNull().default(true),
  sort: integer('sort').notNull().default(0),
  playCount: integer('playCount').notNull().default(0),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  animeId: text('animeId').notNull(),
  userId: text('userId').notNull(),
  parentId: text('parentId').notNull().default(''),
  content: text('content').notNull(),
  createdAt: text('createdAt').notNull(),
});

export const favorites = sqliteTable(
  'favorites',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    animeId: text('animeId').notNull(),
    createdAt: text('createdAt').notNull(),
  },
  (t) => [uniqueIndex('favorites_user_anime_idx').on(t.userId, t.animeId)],
);

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNo: text('orderNo').notNull().unique(),
  userId: text('userId').notNull(),
  animeId: text('animeId').notNull(),
  amount: real('amount').notNull(),
  status: integer('status').notNull().default(0),
  payType: integer('payType').notNull().default(1),
  paidAt: text('paidAt'),
  createdAt: text('createdAt').notNull(),
});

export const ads = sqliteTable('ads', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  imageUrl: text('imageUrl').notNull(),
  linkUrl: text('linkUrl').notNull().default(''),
  color: text('color').notNull().default('#0f172a'),
  sort: integer('sort').notNull().default(0),
  typeId: text('typeId').notNull().default('1'),
  createdAt: text('createdAt').notNull(),
});

export const smsCodes = sqliteTable('smsCodes', {
  id: text('id').primaryKey(),
  mobile: text('mobile').notNull(),
  code: text('code').notNull(),
  expiresAt: text('expiresAt').notNull(),
  createdAt: text('createdAt').notNull(),
  used: integer('used', { mode: 'boolean' }).notNull().default(false),
});

export type User = typeof users.$inferSelect;
export type Anime = typeof anime.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Maker = typeof makers.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Ad = typeof ads.$inferSelect;
export type Comment = typeof comments.$inferSelect;

export const countAll = sql<number>`count(*)`;
