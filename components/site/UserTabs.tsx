import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

const TABS = [
  { href: '/ucenter', label: '个人资料' },
  { href: '/ucenter/collect', label: '我的收藏' },
  { href: '/ucenter/order', label: '我的订单' },
];

export default async function UserTabs({ active }: { active: string }) {
  const user = await getCurrentUser();
  return (
    <section className="c-tab-title" style={{ borderBottom: '1px solid #e2e2e2', marginBottom: 20, textAlign: 'left' }}>
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={tab.href === active ? 'current' : ''}
          style={{
            display: 'inline-block',
            padding: '0 16px',
            lineHeight: '34px',
            marginRight: 10,
            fontSize: 16,
            color: tab.href === active ? '#2982d6' : '#666',
            borderBottom: tab.href === active ? '2px solid #2982d6' : '1px solid transparent',
          }}
        >
          {tab.label}
        </Link>
      ))}
      <span className="fr c-999 fsize14" style={{ lineHeight: '34px' }}>
        {user ? `${user.nickname}（${user.mobile}）` : '未登录'}
      </span>
    </section>
  );
}
