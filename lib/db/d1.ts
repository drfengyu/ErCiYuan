import type { Client, ResultSet } from '@libsql/client';

const DEFAULT_BASE_URL = 'https://api.cloudflare.com/client/v4';

/** D1 平台限制：单条查询最多绑定 100 个参数（batch 里每条语句各自计算） */
export const D1_MAX_BOUND_PARAMS = 100;

export type D1Options = {
  accountId: string;
  databaseId: string;
  token: string;
  baseUrl?: string;
};

type D1Statement = { sql: string; args?: unknown[] };

type D1Row = Record<string, unknown>;

type D1Result = {
  success?: boolean;
  error?: string;
  meta?: { changes?: number; last_row_id?: number | string };
  results?: D1Row[];
};

type D1Envelope = {
  success?: boolean;
  errors?: { code?: number; message?: string }[];
  result?: D1Result[];
};

function normalizeStatement(input: unknown): D1Statement {
  if (typeof input === 'string') return { sql: input };
  const stmt = input as { sql?: string; args?: unknown[]; params?: unknown[] };
  return { sql: String(stmt?.sql ?? ''), args: stmt?.args ?? stmt?.params };
}

/** D1 的 params 只收 string / number / null / Uint8Array，boolean 会被直接拒掉 */
function toParam(value: unknown): string | number | null | Uint8Array {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Uint8Array || typeof value === 'string' || typeof value === 'number') return value;
  return String(value);
}

/**
 * drizzle 会把表查询的列按位置映射（`Array.prototype.slice.call(row)`），
 * libsql 的行对象除了具名键还带下标和 length，而 D1 返回的是纯 JSON 对象，
 * 所以这里必须把下标补齐，否则每一列都会映射成 undefined。
 */
function toRow(source: D1Row, columns: string[]): D1Row {
  const row: D1Row = {};
  for (const column of columns) row[column] = source[column] ?? null;
  columns.forEach((column, index) => {
    Object.defineProperty(row, index, { value: row[column], enumerable: false, writable: true, configurable: true });
  });
  Object.defineProperty(row, 'length', {
    value: columns.length,
    enumerable: false,
    writable: true,
    configurable: true,
  });
  return row;
}

function columnOrder(rows: D1Row[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) seen.add(key);
    }
  }
  return [...seen];
}

function toResultSet(result: D1Result): ResultSet {
  const source = result.results ?? [];
  const columns = columnOrder(source);
  return {
    columns,
    rows: source.map((row) => toRow(row, columns)),
    rowsAffected: result.meta?.changes ?? 0,
    lastInsertRowid: Number(result.meta?.last_row_id ?? 0),
  } as unknown as ResultSet;
}

/** D1 允许整体 success:true 而单条语句失败，失败信息在每条 result 里 */
function unwrap(result: D1Result | undefined): D1Result {
  if (result?.success === false) throw new Error(`D1 执行失败：${result.error ?? '未知错误'}`);
  return result ?? {};
}

/** D1 的 HTTP 接口一次只吃一条语句（或用 batch 数组），所以多语句 DDL 要先切开 */
function splitSqlStatements(script: string): string[] {
  const statements: string[] = [];
  let current = '';
  let quote: string | null = null;
  for (const ch of script) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
      current += ch;
    } else if (ch === ';') {
      if (current.trim()) statements.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

async function postQuery(endpoint: string, token: string, body: unknown): Promise<D1Result[]> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const json = (await res.json().catch(() => null)) as D1Envelope | null;
  if (!res.ok || json?.success !== true) {
    const detail = json?.errors?.[0]?.message ?? '无法解析 D1 响应';
    throw new Error(res.ok ? `D1 请求失败：${detail}` : `D1 请求失败（HTTP ${res.status}）：${detail}`);
  }
  return json.result ?? [];
}

export function createD1Client(options: D1Options): Client {
  const baseUrl = (options.baseUrl || process.env.D1_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const endpoint = `${baseUrl}/accounts/${encodeURIComponent(options.accountId)}/d1/database/${encodeURIComponent(
    options.databaseId,
  )}/query`;

  return {
    async execute(input: unknown): Promise<ResultSet> {
      const stmt = normalizeStatement(input);
      const [result] = await postQuery(endpoint, options.token, {
        sql: stmt.sql,
        params: (stmt.args ?? []).map(toParam),
      });
      return toResultSet(unwrap(result));
    },

    async batch(input: unknown): Promise<ResultSet[]> {
      const list = (Array.isArray(input) ? input : (input as { queries?: unknown[] })?.queries ?? []).map(
        normalizeStatement,
      );
      if (!list.length) return [];
      const results = await postQuery(endpoint, options.token, {
        batch: list.map((stmt) => ({ sql: stmt.sql, params: (stmt.args ?? []).map(toParam) })),
      });
      return results.map((result) => toResultSet(unwrap(result)));
    },

    async executeMultiple(script: string): Promise<void> {
      const list = splitSqlStatements(script).map((sql) => ({ sql }));
      if (!list.length) return;
      await postQuery(endpoint, options.token, { batch: list });
    },

    async transaction(): Promise<never> {
      throw new Error('D1 的 HTTP 接口不支持事务，请把写入合并到一次 batch 调用里。');
    },

    close(): void {},
    get closed(): boolean {
      return false;
    },
  } as unknown as Client;
}
