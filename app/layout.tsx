import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '二刺螈 ErCiYuan',
  description: 'Next.js + Vercel 重构版二次元弹幕视频站：番剧、制作方、播放、订单与后台管理。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
