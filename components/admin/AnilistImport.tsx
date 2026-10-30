'use client';

import { useState } from 'react';

type SearchResult = {
  anilistId: number;
  title: string;
  titleJp: string;
  cover: string;
  year: number;
  episodes: number;
  score: number | null;
  studio: string;
  format: string;
  status: string;
  anilistUrl: string;
};

const DEFAULT_CATEGORY = 'cat-tv';

export default function AnilistImport({ categories }: { categories: { id: string; name: string }[] }) {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<SearchResult[]>([]);
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY);
  const [episodeCount, setEpisodeCount] = useState(3);
  const [price, setPrice] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search() {
    if (!keyword.trim()) return;
    setBusy(true);
    setSearched(true);
    setItems([]);
    try {
      const res = await fetch(`/api/anilist/search?keyword=${encodeURIComponent(keyword.trim())}`);
      const json = await res.json();
      setItems(json.data?.items ?? []);
      if (!res.ok) setLog((prev) => [json.message ?? '搜索失败', ...prev]);
    } finally {
      setBusy(false);
    }
  }

  async function importOne(anilistId: number) {
    setBusy(true);
    try {
      const res = await fetch('/api/anilist/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anilistId, categoryId, episodeCount, price, featured }),
      });
      const json = await res.json();
      setLog((prev) => [`${json.message ?? (res.ok ? '完成' : '失败')}${json.data?.bangumi ? ` · Bangumi #${json.data.bangumi.id}` : ''}`, ...prev].slice(0, 8));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">AniList 导入</h1>
        <p className="mt-1 text-sm text-slate-500">
          从 AniList GraphQL 拉取元数据（封面、横幅、集数、评分、官方观看链接、预告片），再用 Bangumi 检索中文名与简介，最后落库到本站。
        </p>
      </div>

      <div className="admin-card flex flex-wrap items-end gap-3 p-4">
        <label className="block">
          <span className="admin-label">关键词（支持英文 / 罗马音）</span>
          <input
            className="admin-input w-64"
            value={keyword}
            placeholder="Frieren"
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                search();
              }
            }}
          />
        </label>
        <label className="block">
          <span className="admin-label">放入分类</span>
          <select className="admin-input w-40" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="admin-label">生成官方预告资源位（0 为不生成）</span>
          <input className="admin-input w-24" type="number" min={0} max={48} value={episodeCount} onChange={(e) => setEpisodeCount(Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="admin-label">售价（0 为免费）</span>
          <input className="admin-input w-24" type="number" min={0} step={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" className="h-4 w-4" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          首页推荐
        </label>
        <button className="admin-btn-primary" type="button" onClick={search} disabled={busy || !keyword.trim()}>
          搜索
        </button>
      </div>

      {log.length > 0 && (
        <ul className="admin-card space-y-1 p-3 text-sm text-slate-600">
          {log.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}

      {searched && items.length === 0 && !busy && <p className="text-sm text-slate-400">没有匹配条目，换个关键词试试。</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.anilistId} className="admin-card flex gap-3 p-3">
            <img src={item.cover} alt={item.title} className="h-28 w-20 rounded object-cover" />
            <div className="flex-1 text-sm">
              <div className="font-medium text-slate-800">{item.title}</div>
              <div className="mt-0.5 truncate text-xs text-slate-400">{item.titleJp}</div>
              <div className="mt-1 text-xs text-slate-500">
                {item.year || '-'} · {item.episodes || '?'} 集 · 评分 {item.score ?? '-'}
              </div>
              <div className="truncate text-xs text-slate-500">{item.studio || '制作方未知'}</div>
              <div className="mt-2 flex items-center gap-2">
                <button className="admin-btn-primary h-7 px-3 text-xs" type="button" disabled={busy} onClick={() => importOne(item.anilistId)}>
                  导入
                </button>
                <a className="text-xs text-slate-400 underline" href={item.anilistUrl} target="_blank" rel="noreferrer">
                  AniList
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
