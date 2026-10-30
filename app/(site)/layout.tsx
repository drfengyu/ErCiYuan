import SiteCss from '@/components/site/SiteCss';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import { getCurrentUser } from '@/lib/auth';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
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
      {children}
      <SiteFooter />
    </div>
  );
}
