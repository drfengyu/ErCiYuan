import { sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import bcrypt from 'bcryptjs';
import * as schema from './schema';
import { trailerEmbed } from '../media';
import { demoComments, seedAds, seedAnime, seedCategories, seedMakers } from './seed-data';

type Db = LibSQLDatabase<typeof schema>;

function chunks<T>(rows: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

export async function seedIfEmpty(db: Db): Promise<boolean> {
  const row = await db.select({ n: sql<number>`count(*)` }).from(schema.anime);
  if (Number(row[0]?.n ?? 0) > 0) return false;

  const now = new Date().toISOString();
  const hash = (password: string) => bcrypt.hashSync(password, 10);

  await db.insert(schema.users).values([
    {
      id: 'user-admin',
      mobile: '13800000000',
      password: hash('admin123'),
      nickname: '次元管理局',
      avatar: '/assets/img/avatar-boy.gif',
      role: 'ADMIN',
      disabled: false,
      createdAt: now,
    },
    {
      id: 'user-demo',
      mobile: '13900000000',
      password: hash('demo123'),
      nickname: '次元旅人',
      avatar: '/assets/img/avatar-boy.gif',
      role: 'MEMBER',
      disabled: false,
      createdAt: now,
    },
  ]);

  await db.insert(schema.categories).values(seedCategories.map((c) => ({ ...c })));
  await db.insert(schema.makers).values(seedMakers.map((m) => ({ ...m })));

  await db.insert(schema.anime).values(
    seedAnime.map((a) => ({
      id: a.id,
      title: a.title,
      titleJp: a.titleJp,
      enTitle: a.enTitle,
      description: a.description,
      cover: a.cover,
      banner: a.banner,
      year: a.year,
      episodesCount: a.episodesCount,
      duration: a.duration,
      score: a.score,
      genres: JSON.stringify(a.genres),
      makerId: a.makerId,
      categoryId: a.categoryId,
      trailer: a.trailer,
      externalLinks: JSON.stringify(a.externalLinks),
      anilistId: a.anilistId,
      bangumiId: a.bangumiId,
      anilistUrl: a.anilistUrl,
      bangumiUrl: a.bangumiUrl,
      price: a.price,
      viewCount: a.viewCount,
      featured: a.featured,
      published: true,
      createdAt: now,
      updatedAt: now,
    })),
  );

  await db.insert(schema.chapters).values(
    seedAnime.map((a) => ({
      id: `${a.id}-c1`,
      animeId: a.id,
      title: a.chapterTitle,
      sort: 0,
    })),
  );

  // 每部番只放它自己的官方预告（AniList trailer），不再塞无关的公开测试流；
  // 付费番的预告位同样需要购买，保留购买链路的演示。
  const videoRows = seedAnime
    .filter((a) => a.trailer)
    .map((a) => ({
      id: `${a.id}-v1`,
      animeId: a.id,
      chapterId: `${a.id}-c1`,
      title: '官方预告 / PV',
      sourceUrl: trailerEmbed('youtube', a.trailer),
      duration: 0,
      isFree: a.price <= 0,
      sort: 0,
      playCount: Math.floor(a.viewCount / 8),
    }));
  for (const part of chunks(videoRows, 40)) {
    await db.insert(schema.videos).values(part);
  }

  await db.insert(schema.comments).values(
    demoComments.map((c) => ({
      ...c,
      userId: 'user-demo',
      parentId: '',
    })),
  );

  await db.insert(schema.favorites).values([
    { id: 'fav-1', userId: 'user-demo', animeId: '154587', createdAt: '2026-10-20T13:30:00.000Z' },
    { id: 'fav-2', userId: 'user-demo', animeId: '130003', createdAt: '2026-10-22T09:10:00.000Z' },
  ]);

  await db.insert(schema.orders).values([
    {
      id: 'order-demo-1',
      orderNo: 'ECY202610290001',
      userId: 'user-demo',
      animeId: '21519',
      amount: 6,
      status: 1,
      payType: 1,
      paidAt: '2026-10-25T12:00:00.000Z',
      createdAt: '2026-10-25T11:58:00.000Z',
    },
  ]);

  await db.insert(schema.ads).values(seedAds.map((a) => ({ ...a, createdAt: now })));

  return true;
}
