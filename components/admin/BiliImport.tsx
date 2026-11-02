'use client';

import { useState } from 'react';

type AnimeOption = { id: string; title: string };
type Episode = { epId: number; epNo: number; name: string; durationSec: number; shareUrl: string };
type Season = { seasonId: number; mediaId: number; title: string; seasonTitle: string; total: number; episodes: Episode[] };

function mmss(sec: number) {
  if (!sec) return '-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function BiliImport({ animeList }: { animeList: AnimeOption[] }) {
  const [animeId, setAnimeId] = useState(animeList[0]?.id ?? '');
  const [url, setUrl] = useState('');
  const [season, setSeason] = useState<Season | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function preview() {
    if (!url.trim()) return;
    setBusy(true);
    setSeason(null);
    setMessage('');
    try {
      const res = await fetch(`/api/bili/import?url=${encodeURIComponent(url.trim())}`);
      const json = await res.json();
      if (!res.ok) setMessage(json.message || '预览失败');
      else setSeason(json.data);
    } finally {
      setBusy(false);
    }
  }

  async function importNow() {
    if (!season || !animeId) return;
    setBusy(true);
    try {
      const res = await fetch('/api/bili/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, url }),
      });
      const json = await res.json();
      setMessage(json.message || (res.ok ? '导入完成' : '导入失败'));
      if (res.ok) setSeason(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">B 站分集导入</h1>
        <p className="mt-1 text-sm text-slate-500">
          粘贴 B 站番剧链接（<code>https://www.bilibili.com/bangumi/play/ep…</code> 或 <code>ss…</code>），
          从官方公开接口取回真实分集标题、集序与时长，逐集写入本站剧集表。每集存的是 B 站官方页地址：
          站内用官方外链播放器预览（番剧通常只放试看片段），整集点「在官方站看完整版」在你自己的账号里观看。
          本站不抓取、也不存储 B 站的视频流地址。
        </p>
      </div>

      <div className="admin-card space-y-3 p-4">
        <label className="block">
          <span className="admin-label">导入到本站动漫</span>
          <select className="admin-input w-full max-w-md" value={animeId} onChange={(e) => setAnimeId(e.target.value)}>
            {animeList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}（{item.id}）
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="admin-label">B 站番剧链接</span>
          <input
            className="admin-input w-full max-w-2xl"
            value={url}
            placeholder="https://www.bilibili.com/bangumi/play/ep600498"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !busy && preview()}
          />
        </label>
        <div className="flex gap-2">
          <button className="admin-btn" type="button" onClick={preview} disabled={busy || !url.trim()}>
            预览分集
          </button>
          <button className="admin-btn-primary" type="button" onClick={importNow} disabled={busy || !season}>
            {busy ? '处理中…' : '导入分集'}
          </button>
        </div>
      </div>

      {message && <div className="admin-card p-3 text-sm text-slate-700">{message}</div>}

      {season && (
        <div className="admin-card p-4">
          <div className="text-sm text-slate-700">
            <span className="font-medium">{season.title}</span>
            {season.seasonTitle && season.seasonTitle !== season.title ? (
              <span className="ml-2 text-slate-500">{season.seasonTitle}</span>
            ) : null}
            <span className="ml-2 text-slate-400">
              season_id {season.seasonId} · 共 {season.total} 集 · 本次可导入 {season.episodes.length} 集
            </span>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="w-20 py-1">ep_id</th>
                <th className="w-16">集号</th>
                <th>标题</th>
                <th className="w-20">时长</th>
              </tr>
            </thead>
            <tbody>
              {season.episodes.slice(0, 12).map((episode) => (
                <tr key={episode.epId} className="border-t border-slate-100">
                  <td className="py-1">{episode.epId}</td>
                  <td>{episode.epNo}</td>
                  <td>{episode.name}</td>
                  <td>{mmss(episode.durationSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {season.episodes.length > 12 && (
            <p className="mt-2 text-xs text-slate-400">仅预览前 12 集，导入会写入全部 {season.episodes.length} 集。</p>
          )}
        </div>
      )}
    </div>
  );
}
