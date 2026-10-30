import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { and, asc, count, desc, eq, like, or, sql } from 'drizzle-orm';
import { getTableColumns, type Column, type SQL } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import * as t from './db/schema';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'tags' | 'password';

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  list?: boolean;
};

export type ResourceDef = {
  key: ResourceKey;
  title: string;
  table: SQLiteTable;
  orderBy: SQL[];
  search: Column[];
  schema: z.ZodTypeAny;
  fields: FieldDef[];
  jsonFields: string[];
  boolFields: string[];
  numFields: string[];
  canCreate: boolean;
  canDelete: boolean;
};

export type ResourceKey = 'anime' | 'chapters' | 'videos' | 'categories' | 'makers' | 'ads' | 'comments' | 'orders' | 'users';

/** 永远不出现在列表/详情响应里，也不接受作为过滤条件的列。 */
const SECRET_COLUMNS = new Set(['password']);

const idField = z.string().min(1).max(64);
const idOrEmpty = z.string().max(64).default('');

const CATEGORY_OPTIONS = [
  { value: 'cat-tv', label: '番剧' },
  { value: 'cat-hot', label: '热血' },
  { value: 'cat-romance', label: '恋爱' },
  { value: 'cat-fantasy', label: '奇幻' },
  { value: 'cat-mystery', label: '悬疑' },
  { value: 'cat-daily', label: '日常' },
  { value: 'cat-movie', label: '剧场版' },
  { value: 'cat-film', label: '动画电影' },
  { value: 'cat-mad', label: 'MAD' },
  { value: 'cat-music', label: '音乐' },
];

const animeSchema = z.object({
  id: idField.optional(),
  title: z.string().min(1, '标题不能为空'),
  titleJp: z.string().default(''),
  enTitle: z.string().default(''),
  description: z.string().default(''),
  cover: z.string().min(1, '封面地址不能为空'),
  banner: z.string().default(''),
  year: z.coerce.number().default(0),
  episodesCount: z.coerce.number().default(0),
  duration: z.coerce.number().default(24),
  score: z.coerce.number().nullable().default(null),
  genres: z.array(z.string()).default([]),
  makerId: idOrEmpty,
  categoryId: z.string().min(1, '请选择分类'),
  trailer: z.string().default(''),
  externalLinks: z.array(z.object({ site: z.string(), url: z.string(), type: z.string().default('INFO') })).default([]),
  anilistId: z.coerce.number().nullable().default(null),
  bangumiId: z.coerce.number().nullable().default(null),
  anilistUrl: z.string().default(''),
  bangumiUrl: z.string().default(''),
  price: z.coerce.number().default(0),
  viewCount: z.coerce.number().default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

const chapterSchema = z.object({
  id: idField.optional(),
  animeId: z.string().min(1, '请选择动漫'),
  title: z.string().min(1, '标题不能为空'),
  sort: z.coerce.number().default(0),
});

const videoSchema = z.object({
  id: idField.optional(),
  animeId: z.string().min(1, '请选择动漫'),
  chapterId: z.string().min(1, '请选择章节'),
  title: z.string().min(1, '标题不能为空'),
  sourceUrl: z.string().min(1, '播放地址不能为空'),
  duration: z.coerce.number().default(0),
  isFree: z.boolean().default(true),
  sort: z.coerce.number().default(0),
  playCount: z.coerce.number().default(0),
});

const categorySchema = z.object({
  id: idField.optional(),
  name: z.string().min(1, '名称不能为空'),
  parentId: idOrEmpty,
  sort: z.coerce.number().default(0),
});

const makerSchema = z.object({
  id: idField.optional(),
  name: z.string().min(1, '名称不能为空'),
  avatar: z.string().default(''),
  intro: z.string().default(''),
  career: z.string().default(''),
  sort: z.coerce.number().default(0),
});

const adSchema = z.object({
  id: idField.optional(),
  title: z.string().min(1, '标题不能为空'),
  imageUrl: z.string().min(1, '图片地址不能为空'),
  linkUrl: z.string().default(''),
  color: z.string().default('#0f172a'),
  sort: z.coerce.number().default(0),
  typeId: z.string().default('1'),
});

const commentSchema = z.object({
  id: idField.optional(),
  animeId: z.string().min(1),
  userId: z.string().min(1),
  parentId: idOrEmpty,
  content: z.string().min(1, '内容不能为空'),
});

const orderSchema = z.object({
  status: z.coerce.number().default(0),
  payType: z.coerce.number().default(1),
});

const userSchema = z.object({
  id: idField.optional(),
  mobile: z.string().min(6, '手机号格式不正确'),
  nickname: z.string().min(1, '昵称不能为空'),
  avatar: z.string().default(''),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  disabled: z.boolean().default(false),
  password: z.string().min(6, '密码至少 6 位').optional(),
});

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue?.message ?? '参数校验失败';
}

export { firstIssue };

export const RESOURCES: Record<ResourceKey, ResourceDef> = {
  anime: {
    key: 'anime',
    title: '动漫',
    table: t.anime,
    orderBy: [desc(t.anime.updatedAt)],
    search: [t.anime.title, t.anime.enTitle, t.anime.titleJp],
    schema: animeSchema,
    jsonFields: ['genres', 'externalLinks'],
    boolFields: ['featured', 'published'],
    numFields: ['year', 'episodesCount', 'duration', 'score', 'price', 'viewCount', 'anilistId', 'bangumiId'],
    canCreate: true,
    canDelete: true,
    fields: [
      { key: 'title', label: '标题', type: 'text', list: true },
      { key: 'titleJp', label: '日文名', type: 'text' },
      { key: 'enTitle', label: '英文名', type: 'text' },
      { key: 'categoryId', label: '分类', type: 'select', options: CATEGORY_OPTIONS, list: true },
      { key: 'makerId', label: '制作方 ID', type: 'text', list: true },
      { key: 'cover', label: '封面 URL', type: 'text' },
      { key: 'banner', label: '横幅 URL', type: 'text' },
      { key: 'year', label: '年份', type: 'number', list: true },
      { key: 'episodesCount', label: '总集数', type: 'number', list: true },
      { key: 'duration', label: '单集分钟', type: 'number' },
      { key: 'score', label: '评分', type: 'number', list: true },
      { key: 'price', label: '价格（软妹币）', type: 'number', list: true },
      { key: 'viewCount', label: '播放量', type: 'number', list: true },
      { key: 'genres', label: '标签（逗号分隔）', type: 'tags' },
      { key: 'trailer', label: 'YouTube 预告片 ID', type: 'text' },
      { key: 'anilistId', label: 'AniList ID', type: 'number', list: true },
      { key: 'bangumiId', label: 'Bangumi ID', type: 'number' },
      { key: 'anilistUrl', label: 'AniList 链接', type: 'text' },
      { key: 'bangumiUrl', label: 'Bangumi 链接', type: 'text' },
      { key: 'description', label: '简介', type: 'textarea' },
      { key: 'featured', label: '首页推荐', type: 'switch', list: true },
      { key: 'published', label: '已上架', type: 'switch', list: true },
    ],
  },
  chapters: {
    key: 'chapters',
    title: '章节',
    table: t.chapters,
    orderBy: [asc(t.chapters.sort)],
    search: [t.chapters.title, t.chapters.animeId],
    schema: chapterSchema,
    jsonFields: [],
    boolFields: [],
    numFields: ['sort'],
    canCreate: true,
    canDelete: true,
    fields: [
      { key: 'animeId', label: '动漫 ID', type: 'text', list: true },
      { key: 'title', label: '章节名', type: 'text', list: true },
      { key: 'sort', label: '排序', type: 'number', list: true },
    ],
  },
  videos: {
    key: 'videos',
    title: '剧集',
    table: t.videos,
    orderBy: [asc(t.videos.sort)],
    search: [t.videos.title, t.videos.animeId],
    schema: videoSchema,
    jsonFields: [],
    boolFields: ['isFree'],
    numFields: ['duration', 'sort', 'playCount'],
    canCreate: true,
    canDelete: true,
    fields: [
      { key: 'animeId', label: '动漫 ID', type: 'text', list: true },
      { key: 'chapterId', label: '章节 ID', type: 'text', list: true },
      { key: 'title', label: '剧集名', type: 'text', list: true },
      { key: 'sourceUrl', label: '播放地址（B站/YouTube/Dailymotion 官方页或嵌入地址，或已授权 mp4 / m3u8）', type: 'text' },
      { key: 'duration', label: '时长（秒）', type: 'number', list: true },
      { key: 'isFree', label: '免费可看', type: 'switch', list: true },
      { key: 'sort', label: '排序', type: 'number', list: true },
      { key: 'playCount', label: '播放次数', type: 'number', list: true },
    ],
  },
  categories: {
    key: 'categories',
    title: '分类',
    table: t.categories,
    orderBy: [asc(t.categories.sort)],
    search: [t.categories.name],
    schema: categorySchema,
    jsonFields: [],
    boolFields: [],
    numFields: ['sort'],
    canCreate: true,
    canDelete: true,
    fields: [
      { key: 'name', label: '名称', type: 'text', list: true },
      { key: 'parentId', label: '上级分类 ID（留空为一级）', type: 'text', list: true },
      { key: 'sort', label: '排序', type: 'number', list: true },
    ],
  },
  makers: {
    key: 'makers',
    title: '制作方',
    table: t.makers,
    orderBy: [asc(t.makers.sort)],
    search: [t.makers.name],
    schema: makerSchema,
    jsonFields: [],
    boolFields: [],
    numFields: ['sort'],
    canCreate: true,
    canDelete: true,
    fields: [
      { key: 'name', label: '名称', type: 'text', list: true },
      { key: 'avatar', label: 'Logo URL', type: 'text' },
      { key: 'career', label: '代表作', type: 'text', list: true },
      { key: 'intro', label: '简介', type: 'textarea' },
      { key: 'sort', label: '排序', type: 'number', list: true },
    ],
  },
  ads: {
    key: 'ads',
    title: '首页轮播',
    table: t.ads,
    orderBy: [asc(t.ads.sort)],
    search: [t.ads.title],
    schema: adSchema,
    jsonFields: [],
    boolFields: [],
    numFields: ['sort'],
    canCreate: true,
    canDelete: true,
    fields: [
      { key: 'title', label: '标题', type: 'text', list: true },
      { key: 'imageUrl', label: '图片 URL', type: 'text', list: true },
      { key: 'linkUrl', label: '跳转链接', type: 'text', list: true },
      { key: 'color', label: '背景色', type: 'text' },
      { key: 'sort', label: '排序', type: 'number', list: true },
      { key: 'typeId', label: '广告位', type: 'text', list: true },
    ],
  },
  comments: {
    key: 'comments',
    title: '评论',
    table: t.comments,
    orderBy: [desc(t.comments.createdAt)],
    search: [t.comments.content, t.comments.animeId],
    schema: commentSchema,
    jsonFields: [],
    boolFields: [],
    numFields: [],
    canCreate: false,
    canDelete: true,
    fields: [
      { key: 'animeId', label: '动漫 ID', type: 'text', list: true },
      { key: 'userId', label: '用户 ID', type: 'text', list: true },
      { key: 'content', label: '内容', type: 'textarea', list: true },
    ],
  },
  orders: {
    key: 'orders',
    title: '订单',
    table: t.orders,
    orderBy: [desc(t.orders.createdAt)],
    search: [t.orders.orderNo, t.orders.userId, t.orders.animeId],
    schema: orderSchema,
    jsonFields: [],
    boolFields: [],
    numFields: ['status', 'payType'],
    canCreate: false,
    canDelete: true,
    fields: [
      { key: 'orderNo', label: '订单号', type: 'text', list: true },
      { key: 'userId', label: '用户', type: 'text', list: true },
      { key: 'animeId', label: '动漫', type: 'text', list: true },
      { key: 'amount', label: '金额', type: 'number', list: true },
      { key: 'status', label: '状态（0 待支付 1 已支付）', type: 'number', list: true },
    ],
  },
  users: {
    key: 'users',
    title: '用户',
    table: t.users,
    orderBy: [desc(t.users.createdAt)],
    search: [t.users.nickname, t.users.mobile],
    schema: userSchema,
    jsonFields: [],
    boolFields: ['disabled'],
    numFields: [],
    canCreate: true,
    canDelete: true,
    fields: [
      { key: 'mobile', label: '手机号', type: 'text', list: true },
      { key: 'nickname', label: '昵称', type: 'text', list: true },
      { key: 'avatar', label: '头像 URL', type: 'text' },
      { key: 'role', label: '角色', type: 'select', options: [{ value: 'MEMBER', label: '普通用户' }, { value: 'ADMIN', label: '管理员' }], list: true },
      { key: 'password', label: '密码（留空不修改）', type: 'password' },
      { key: 'disabled', label: '禁用账号', type: 'switch', list: true },
    ],
  },
};

export function findResource(key: string): ResourceDef | null {
  return (RESOURCES as Record<string, ResourceDef>)[key] ?? null;
}

export function columnsOf(resource: ResourceDef): Record<string, Column> {
  return getTableColumns(resource.table) as Record<string, Column>;
}

export function pkOf(resource: ResourceDef): Column {
  const column = columnsOf(resource).id;
  if (!column) throw new Error(`资源 ${resource.key} 缺少主键`);
  return column;
}

export function buildWhere(resource: ResourceDef, keyword?: string, extra?: Record<string, string>): SQL | undefined {
  const clauses: SQL[] = [];
  if (keyword) {
    const cols = resource.search.map((col) => like(col, `%${keyword}%`));
    clauses.push(or(...cols)!);
  }
  const columns = getTableColumns(resource.table) as Record<string, Column>;
  for (const col of resource.fields) {
    const value = extra?.[col.key];
    if (value === undefined || value === '') continue;
    // 密码哈希既能当过滤条件猜，也会把它的存在性泄漏给调用方。
    if (SECRET_COLUMNS.has(col.key)) continue;
    const column = columns[col.key];
    if (!column) continue;
    if (resource.boolFields.includes(col.key)) {
      clauses.push(eq(column, /^(1|true|on)$/i.test(value) ? 1 : 0));
    } else if (resource.numFields.includes(col.key)) {
      const n = Number(value);
      if (Number.isFinite(n)) clauses.push(eq(column, Math.trunc(n)));
    } else {
      clauses.push(eq(column, value));
    }
  }
  return clauses.length ? and(...clauses) : undefined;
}

/** 列表与详情返回前剔除密钥列；编辑表单靠「留空不修改」语义，不需要读回哈希。 */
export function sanitizeRow<T extends Record<string, unknown>>(row: T): T {
  const copy = { ...row };
  for (const key of SECRET_COLUMNS) delete (copy as Record<string, unknown>)[key];
  return copy;
}

export function normalizeValues(
  resource: ResourceDef,
  input: Record<string, unknown>,
  mode: 'create' | 'update',
): Record<string, unknown> {
  const columns = getTableColumns(resource.table) as Record<string, Column>;
  const now = new Date().toISOString();
  const values: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || key === 'id' || !columns[key]) continue;
    values[key] = value;
  }

  for (const key of resource.jsonFields) {
    if (values[key] !== undefined && typeof values[key] !== 'string') values[key] = JSON.stringify(values[key]);
  }
  for (const key of resource.boolFields) {
    if (values[key] !== undefined) values[key] = values[key] ? 1 : 0;
  }
  if (values.password !== undefined) {
    if (!values.password) delete values.password;
    else values.password = bcrypt.hashSync(String(values.password), 10);
  }

  if (mode === 'create') {
    if (columns.createdAt) values.createdAt = now;
    if (columns.updatedAt) values.updatedAt = now;
  } else if (columns.updatedAt) {
    values.updatedAt = now;
  }

  return values;
}

export function newId(): string {
  return randomUUID().slice(0, 12);
}

export const totalSql = sql<number>`count(*)`;
export const rowCounts = count;
