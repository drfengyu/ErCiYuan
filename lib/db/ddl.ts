export const DDL = `
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "mobile" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "nickname" TEXT NOT NULL,
  "avatar" TEXT NOT NULL DEFAULT '',
  "role" TEXT NOT NULL DEFAULT 'MEMBER',
  "disabled" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "parentId" TEXT NOT NULL DEFAULT '',
  "sort" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "makers" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "avatar" TEXT NOT NULL DEFAULT '',
  "intro" TEXT NOT NULL DEFAULT '',
  "career" TEXT NOT NULL DEFAULT '',
  "sort" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "anime" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "title" TEXT NOT NULL,
  "titleJp" TEXT NOT NULL DEFAULT '',
  "enTitle" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "cover" TEXT NOT NULL,
  "banner" TEXT NOT NULL DEFAULT '',
  "year" INTEGER NOT NULL DEFAULT 0,
  "episodesCount" INTEGER NOT NULL DEFAULT 0,
  "duration" INTEGER NOT NULL DEFAULT 24,
  "score" REAL,
  "genres" TEXT NOT NULL DEFAULT '[]',
  "makerId" TEXT NOT NULL DEFAULT '',
  "categoryId" TEXT NOT NULL,
  "trailer" TEXT NOT NULL DEFAULT '',
  "externalLinks" TEXT NOT NULL DEFAULT '[]',
  "anilistId" INTEGER,
  "bangumiId" INTEGER,
  "anilistUrl" TEXT NOT NULL DEFAULT '',
  "bangumiUrl" TEXT NOT NULL DEFAULT '',
  "price" REAL NOT NULL DEFAULT 0,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "featured" INTEGER NOT NULL DEFAULT 0,
  "published" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "chapters" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "animeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sort" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "videos" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "animeId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "duration" INTEGER NOT NULL DEFAULT 0,
  "isFree" INTEGER NOT NULL DEFAULT 1,
  "sort" INTEGER NOT NULL DEFAULT 0,
  "playCount" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "comments" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "animeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "parentId" TEXT NOT NULL DEFAULT '',
  "content" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "favorites" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL,
  "animeId" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "orders" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "orderNo" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "animeId" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "status" INTEGER NOT NULL DEFAULT 0,
  "payType" INTEGER NOT NULL DEFAULT 1,
  "paidAt" TEXT,
  "createdAt" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "ads" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "title" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "linkUrl" TEXT NOT NULL DEFAULT '',
  "color" TEXT NOT NULL DEFAULT '#0f172a',
  "sort" INTEGER NOT NULL DEFAULT 0,
  "typeId" TEXT NOT NULL DEFAULT '1',
  "createdAt" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "smsCodes" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "mobile" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "used" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS "favorites_user_anime_idx" ON "favorites" ("userId","animeId");
CREATE INDEX IF NOT EXISTS "anime_category_idx" ON "anime" ("categoryId");
CREATE INDEX IF NOT EXISTS "anime_maker_idx" ON "anime" ("makerId");
CREATE INDEX IF NOT EXISTS "chapters_anime_idx" ON "chapters" ("animeId");
CREATE INDEX IF NOT EXISTS "videos_anime_idx" ON "videos" ("animeId");
CREATE INDEX IF NOT EXISTS "comments_anime_idx" ON "comments" ("animeId");
CREATE INDEX IF NOT EXISTS "orders_user_idx" ON "orders" ("userId");
`;
