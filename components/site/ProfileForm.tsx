'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfileForm({ nickname, avatar }: { nickname: string; avatar: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ nickname, avatar });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setMessage(json.message);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="u-account-li">
      <li>
        <label className="u-a-title">昵称</label>
        <input className="u-a-inpt" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
      </li>
      <li>
        <label className="u-a-title">头像 URL</label>
        <input className="u-a-inpt" value={form.avatar} placeholder="https://..." onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
      </li>
      <li>
        <label className="u-a-title" />
        <button type="submit" className="comm-btn c-btn-3" disabled={busy}>
          保存
        </button>
        {message && <span className="u-a-error">{message}</span>}
      </li>
    </form>
  );
}
