import fs from 'node:fs';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { createD1Client } from './d1';
import { DDL } from './ddl';
import { seedIfEmpty } from './seed';

export type Database = LibSQLDatabase<typeof schema>;

export type DbContext = {
  db: Database;
  client: Client;
  ephemeral: boolean;
};

const globalForDb = globalThis as unknown as { __erciyuanDb?: Promise<DbContext> };

type DataSource =
  | { kind: 'libsql'; url: string; authToken?: string; ephemeral: boolean }
  | { kind: 'd1'; accountId: string; databaseId: string; token: string };

function resolveSource(): DataSource {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  if (url?.startsWith('d1://')) {
    const [accountId, databaseId] = url.slice('d1://'.length).split('/');
    if (!accountId || !databaseId) throw new Error('DATABASE_URL 应为 d1://<account_id>/<database_id>');
    if (!authToken) throw new Error('D1 模式需要 DATABASE_AUTH_TOKEN 存放 Cloudflare API Token');
    return { kind: 'd1', accountId, databaseId, token: authToken };
  }
  if (url) return { kind: 'libsql', url, authToken, ephemeral: false };
  if (process.env.VERCEL) return { kind: 'libsql', url: ':memory:', ephemeral: true };
  return { kind: 'libsql', url: 'file:./data/erciyuan.db', ephemeral: false };
}

async function init(): Promise<DbContext> {
  const source = resolveSource();
  const ephemeral = source.kind === 'libsql' && source.ephemeral;
  let client: Client;
  if (source.kind === 'd1') {
    console.log(`[erciyuan] 使用 Cloudflare D1 数据库 ${source.databaseId}。`);
    client = createD1Client({ accountId: source.accountId, databaseId: source.databaseId, token: source.token });
  } else {
    if (source.url.startsWith('file:')) {
      const filePath = path.resolve(source.url.slice('file:'.length));
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    if (ephemeral) {
      console.warn('[erciyuan] DATABASE_URL 未配置：使用内存数据库，重启后数据会丢失。请绑定 Turso 或 Cloudflare D1 以持久化。');
    }
    client = createClient({ url: source.url, authToken: source.authToken });
  }
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
