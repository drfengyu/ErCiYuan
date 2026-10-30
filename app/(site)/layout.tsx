import SiteCss from '@/components/site/SiteCss';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, { ephemeral }] = await Promise.all([getCurrentUser(), getDb()]);
  return (
    <div className="in-wrap">
      <SiteCss />
      <SiteHeader
        user={
          user
            ? { id: user.id, nickname: user.nickname, avatar: user.avatar, role: user.role }
            : null
        }
      />
      {ephemeral && (
        <div
          className="tac fsize12"
          style={{ background: '#fff8e6', color: '#8a6d3b', padding: '6px 12px', borderBottom: '1px solid #f0e2b8' }}
        >
          演示模式：未绑定数据库，写入只保存在当前服务实例，可能不会在其它页面或下次访问时出现。绑定 Turso 后即可持久化。
        </div>
      )}
      {children}
      <SiteFooter />
    </div>
  );
}
