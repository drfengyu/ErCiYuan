import fs from 'node:fs';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DDL } from './ddl';
import { seedIfEmpty } from './seed';

export type Database = LibSQLDatabase<typeof schema>;

export type DbContext = {
  db: Database;
  client: Client;
  ephemeral: boolean;
};

const globalForDb = globalThis as unknown as { __erciyuanDb?: Promise<DbContext> };

function resolveUrl(): { url: string; authToken?: string; ephemeral: boolean } {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  if (url) return { url, authToken, ephemeral: false };
  if (process.env.VERCEL) return { url: ':memory:', ephemeral: true };
  return { url: 'file:./data/erciyuan.db', ephemeral: false };
}

async function init(): Promise<DbContext> {
  const { url, authToken, ephemeral } = resolveUrl();
  if (url.startsWith('file:')) {
    const filePath = path.resolve(url.slice('file:'.length));
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  if (ephemeral) {
    console.warn('[erciyuan] DATABASE_URL 未配置：使用内存数据库，重启后数据会丢失。请在 Vercel 绑定 Turso 以持久化。');
  }
  const client = createClient({ url, authToken });
  await client.executeMultiple(DDL);
  const db = drizzle(client, { schema });
  const seeded = await seedIfEmpty(db);
  if (seeded) console.log('[erciyuan] 数据库初始化完成，已写入真实番剧种子数据。');
  return { db, client, ephemeral };
}

export function getDb(): Promise<DbContext> {
  globalForDb.__erciyuanDb ??= init();
  return globalForDb.__erciyuanDb;
}
