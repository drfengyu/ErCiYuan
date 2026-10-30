'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: '数据概览' },
  { href: '/admin/import', label: 'AniList 导入' },
  { href: '/admin/anime', label: '动漫' },
  { href: '/admin/chapters', label: '章节' },
  { href: '/admin/videos', label: '剧集' },
  { href: '/admin/categories', label: '分类' },
  { href: '/admin/makers', label: '制作方' },
  { href: '/admin/ads', label: '首页轮播' },
  { href: '/admin/comments', label: '评论' },
  { href: '/admin/orders', label: '订单' },
  { href: '/admin/users', label: '用户' },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-2">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-5 py-2 text-sm transition hover:bg-slate-800 hover:text-white ${
              active ? 'border-l-4 border-blue-400 bg-slate-800 text-white' : 'border-l-4 border-transparent'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link href="/" className="mt-4 block px-5 py-2 text-sm text-slate-400 hover:text-white">
        ← 返回站点
      </Link>
    </nav>
  );
}
