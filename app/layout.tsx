import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '二刺螈 ErCiYuan',
    template: '%s · 二刺螈',
  },
  description: 'Next.js + Vercel 重构版二次元视频站：番剧、制作方、播放、订单与后台管理，元数据对接 AniList / Bangumi。',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: '二刺螈 ErCiYuan',
    images: [{ url: '/assets/img/logo4.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
