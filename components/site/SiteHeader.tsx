'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export type HeaderUser = { id: string; nickname: string; avatar: string; role: string };

const NAV = [
  { href: '/', label: '首页' },
  { href: '/anime', label: '动漫' },
  { href: '/maker', label: '制作方' },
];

function SearchBox() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<{ id: string; title: string }[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function onChange(value: string) {
    setTitle(value);
    setItems([]);
    setOpen(Boolean(value.trim()));
    if (timer.current) window.clearTimeout(timer.current);
    if (!value.trim()) return;
    timer.current = window.setTimeout(async () => {
      const res = await fetch(`/api/anime/suggest?keyword=${encodeURIComponent(value)}`);
      const json = await res.json();
      setItems(json.data ?? []);
    }, 250);
  }

  function submit() {
    setOpen(false);
    router.push(`/anime?title=${encodeURIComponent(title)}`);
  }

  return (
    <form
      className="h-r-s-box"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        value={title}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(Boolean(title.trim()))}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        placeholder="搜索动漫"
        className="s-input"
        style={{
          height: 30,
          width: 150,
          border: '1px solid #dcdcdc',
          borderRadius: 3,
          padding: '0 28px 0 10px',
          outline: 'none',
          fontSize: 13,
          verticalAlign: 'middle',
        }}
      />
      <button type="submit" className="s-btn" title="搜索" style={{ position: 'absolute', right: 6, top: 6, background: 'none', border: 0, cursor: 'pointer' }}>
        <em className="icon18">&nbsp;</em>
      </button>
      {open && items.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            right: 0,
            top: 38,
            width: 220,
            background: '#fff',
            border: '1px solid #e5e5e5',
            boxShadow: '0 3px 8px rgba(0,0,0,.12)',
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            zIndex: 99,
            textAlign: 'left',
          }}
        >
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/anime/${item.id}`}
                onClick={() => {
                  setOpen(false);
                  setItems([]);
                }}
                style={{ display: 'block', padding: '6px 12px', fontSize: 13, color: '#333' }}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

export default function SiteHeader({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header id="header">
      <section className="container">
        <h1 id="logo">
          <Link href="/" title="二刺螈">
            <img src="/assets/img/logo4.png" width="100%" alt="二刺螈" />
          </Link>
        </h1>
        <div className="h-r-nsl">
          <ul className="nav">
            {NAV.map((item) => (
              <li key={item.href} className={isActive(item.href) ? 'current' : ''}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <ul className="h-r-login">
            {!user && (
              <li id="no-login">
                <Link href="/login" title="登录">
                  <i>🧙</i>
                  <span style={{ color: 'rgb(94, 206, 235)' }} className="vam ml5">
                    登录
                  </span>
                </Link>
                |
                <Link href="/register" title="注册">
                  <i>📝</i>
                  <span style={{ color: 'rgb(94, 206, 235)' }} className="vam ml5">
                    注册
                  </span>
                </Link>
              </li>
            )}
            {user && (
              <li id="is-login-two" className="h-r-user">
                <Link href="/ucenter" title="">
                  <img src={user.avatar || '/assets/img/avatar-boy.gif'} width="100" height="100" className="vam picImg" alt="" />
                  <span id="userName" className="vam disIb">
                    {user.nickname}
                  </span>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" title="后台" className="ml5">
                    后台
                  </Link>
                )}
                <LogoutLink />
              </li>
            )}
          </ul>
          <aside className="h-r-search">
            <SearchBox />
          </aside>
        </div>
        <div className="clear" />
      </section>
    </header>
  );
}

function LogoutLink() {
  const router = useRouter();
  return (
    <a
      href="/api/auth/logout"
      title="退出"
      className="ml5"
      onClick={async (e) => {
        e.preventDefault();
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
      }}
    >
      退出
    </a>
  );
}
