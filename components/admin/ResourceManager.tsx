'use client';

import { useCallback, useMemo, useState } from 'react';

export type AdminField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'tags' | 'password';
  options?: { value: string; label: string }[];
  list?: boolean;
};

export type AdminRow = Record<string, unknown>;

type Props = {
  resourceKey: string;
  title: string;
  fields: AdminField[];
  canCreate: boolean;
  canDelete: boolean;
  size: number;
  initialRows: AdminRow[];
  initialTotal: number;
  initialPage: number;
  initialKeyword: string;
  initialFilters: Record<string, string>;
};

function display(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'object') return JSON.stringify(value);
  const text = String(value);
  return text.length > 44 ? `${text.slice(0, 44)}…` : text;
}

function emptyForm(fields: AdminField[]): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === 'switch') form[field.key] = false;
    else if (field.type === 'number' || field.type === 'select' || field.type === 'tags') form[field.key] = '';
    else form[field.key] = '';
  }
  return form;
}

export default function ResourceManager(props: Props) {
  const { resourceKey, title, fields, canCreate, canDelete, size, initialFilters } = props;
  const [rows, setRows] = useState<AdminRow[]>(props.initialRows);
  const [total, setTotal] = useState(props.initialTotal);
  const [page, setPage] = useState(props.initialPage);
  const [keyword, setKeyword] = useState(props.initialKeyword);
  const [form, setForm] = useState<Record<string, unknown>>(() => emptyForm(fields));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const listFields = useMemo(() => fields.filter((field) => field.list), [fields]);

  const load = useCallback(
    async (nextPage: number, nextKeyword: string) => {
      const params = new URLSearchParams({ page: String(nextPage), size: String(size), keyword: nextKeyword });
      for (const [key, value] of Object.entries(initialFilters)) params.set(key, value);
      const res = await fetch(`/api/admin/${resourceKey}?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.message || '加载失败');
        return;
      }
      setRows(json.data.items);
      setTotal(json.data.total);
      setPage(json.data.page);
    },
    [initialFilters, resourceKey, size],
  );

  function resetForm(row?: AdminRow) {
    const next = emptyForm(fields);
    if (row) {
      for (const field of fields) {
        const raw = row[field.key];
        if (field.type === 'switch') next[field.key] = Boolean(raw);
        else if (field.type === 'tags') {
          try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            next[field.key] = Array.isArray(parsed) ? parsed.join(', ') : '';
          } catch {
            next[field.key] = '';
          }
        } else if (field.type === 'number') next[field.key] = raw === null || raw === undefined ? '' : String(raw);
        else next[field.key] = raw === null || raw === undefined ? '' : String(raw);
      }
    }
    setForm(next);
  }

  function startCreate() {
    resetForm();
    setEditingId(null);
    setPanelOpen(true);
    setMessage('');
  }

  function startEdit(row: AdminRow) {
    resetForm(row);
    setEditingId(String(row.id ?? ''));
    setPanelOpen(true);
    setMessage('');
  }

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = form[field.key];
      if (field.type === 'switch') {
        payload[field.key] = Boolean(raw);
        continue;
      }
      if (field.type === 'tags') {
        payload[field.key] = String(raw ?? '')
          .split(/[,，]/)
          .map((item) => item.trim())
          .filter(Boolean);
        continue;
      }
      const text = String(raw ?? '').trim();
      if (text === '') {
        if (field.key === 'score') payload[field.key] = null;
        continue;
      }
      if (field.type === 'number') {
        const num = Number(text);
        if (!Number.isNaN(num)) payload[field.key] = num;
        continue;
      }
      payload[field.key] = text;
    }
    return payload;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const payload = buildPayload();
      const res = editingId
        ? await fetch(`/api/admin/${resourceKey}/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/${resourceKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.message || '保存失败');
        return;
      }
      setMessage(json.message || '保存成功');
      setPanelOpen(false);
      await load(page, keyword);
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: AdminRow) {
    if (!window.confirm(`确定删除「${display(row.title ?? row.name ?? row.id)}」？相关数据会一并清理。`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/${resourceKey}/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      setMessage(json.message || '删除完成');
      await load(page, keyword);
    } finally {
      setBusy(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{title}</h1>
        <span className="admin-tag">共 {total} 条</span>
        <div className="ml-auto flex items-center gap-2">
          <input
            className="admin-input w-56"
            placeholder={`搜索${title}`}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                load(1, keyword);
              }
            }}
          />
          <button className="admin-btn" type="button" onClick={() => load(1, keyword)}>
            搜索
          </button>
          {canCreate && (
            <button className="admin-btn-primary" type="button" onClick={startCreate}>
              新建
            </button>
          )}
        </div>
      </div>

      {message && <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">{message}</div>}

      {panelOpen && (
        <form onSubmit={submit} className="admin-card grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3 text-sm font-medium text-slate-500">
            {editingId ? `编辑：${editingId}` : `新建${title}`}
          </div>
          {fields.map((field) => {
            const wide = field.type === 'textarea';
            const cls = wide ? 'md:col-span-2 xl:col-span-3' : '';
            return (
              <label key={field.key} className={`block ${cls}`}>
                <span className="admin-label">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea className="admin-input h-28 py-2" value={String(form[field.key] ?? '')} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />
                ) : field.type === 'select' ? (
                  <select className="admin-input" value={String(form[field.key] ?? '')} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}>
                    <option value="">（未设置）</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'switch' ? (
                  <input type="checkbox" className="mt-2 h-4 w-4" checked={Boolean(form[field.key])} onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })} />
                ) : (
                  <input
                    className="admin-input"
                    type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                )}
              </label>
            );
          })}
          <div className="md:col-span-2 xl:col-span-3 flex gap-2">
            <button className="admin-btn-primary" type="submit" disabled={busy}>
              保存
            </button>
            <button className="admin-btn" type="button" onClick={() => setPanelOpen(false)}>
              收起
            </button>
          </div>
        </form>
      )}

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-32">ID</th>
              {listFields.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
              <th className="w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={listFields.length + 2} className="py-6 text-center text-slate-400">
                  暂无数据
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={String(row.id)}>
                <td className="text-xs text-slate-400">{display(row.id)}</td>
                {listFields.map((field) => (
                  <td key={field.key}>{display(row[field.key])}</td>
                ))}
                <td>
                  <button className="text-blue-600" type="button" onClick={() => startEdit(row)}>
                    编辑
                  </button>
                  {canDelete && (
                    <button className="ml-3 text-red-500" type="button" onClick={() => remove(row)}>
                      删除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button className="admin-btn" type="button" disabled={page <= 1 || busy} onClick={() => load(page - 1, keyword)}>
            上一页
          </button>
          <span className="text-slate-500">
            {page} / {totalPages}
          </span>
          <button className="admin-btn" type="button" disabled={page >= totalPages || busy} onClick={() => load(page + 1, keyword)}>
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
