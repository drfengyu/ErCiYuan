'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatDuration } from '@/lib/format';

type Props = {
  animeId: string;
  videoId: string;
  initialSec: number;
  /** file 源由播放器自动上报，嵌入源读不到 iframe 内的位置，只能手记 */
  auto: boolean;
  loggedIn: boolean;
};

export default function ProgressControl({ animeId, videoId, initialSec, auto, loggedIn }: Props) {
  const router = useRouter();
  const [sec, setSec] = useState(initialSec);
  const [text, setText] = useState(initialSec ? formatDuration(initialSec) : '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (!loggedIn) return null;

  async function save(nextSec: number) {
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animeId, videoId, positionSec: nextSec, durationSec: 0 }),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setMessage(json?.message || '保存失败');
      return;
    }
    setSec(nextSec);
    setText(nextSec ? formatDuration(nextSec) : '');
    router.refresh();
  }

  function parse(value: string) {
    const parts = value.split(':').map((p) => Number(p.trim()));
    if (parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
    return parts.length === 2 ? parts[0] * 60 + parts[1] : parts.length === 1 ? parts[0] : null;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <span style={{ fontSize: 12, color: '#999' }}>
        {sec > 0 ? `上次看到 ${formatDuration(sec)}` : '还没有观看进度'}
      </span>
      {auto ? (
        <span style={{ fontSize: 12, color: '#6a9955' }}>直链源会自动记录并续播</span>
      ) : (
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="mm:ss"
            style={{ width: 74, padding: '3px 6px', border: '1px solid #dcdcdc', borderRadius: 3, fontSize: 12 }}
          />
          <button
            type="button"
            className="comm-btn c-btn-2"
            style={{ padding: '3px 10px', fontSize: 12 }}
            disabled={busy}
            onClick={() => {
              const n = parse(text || '0');
              if (n === null) setMessage('格式应为 mm:ss');
              else void save(n);
            }}
          >
            记进度
          </button>
        </span>
      )}
      {message && <span style={{ fontSize: 12, color: '#d9534f' }}>{message}</span>}
    </div>
  );
}
