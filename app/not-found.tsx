import Link from 'next/link';
import SiteCss from '@/components/site/SiteCss';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import { getCurrentUser } from '@/lib/auth';

export default async function NotFound() {
  const user = await getCurrentUser();
  return (
    <div className="in-wrap">
      <SiteCss />
      <SiteHeader
        user={user ? { id: user.id, nickname: user.nickname, avatar: user.avatar, role: user.role } : null}
      />
      <div id="aCoursesList" className="bg-fa of">
        <section className="container tac" style={{ padding: '50px 0 70px' }}>
          <img src="/assets/img/404.jpg" alt="404" style={{ maxWidth: '100%', margin: '0 auto' }} />
          <h2 className="c-333 fsize24 mt20">页面走丢了 (404)</h2>
          <p className="c-999 fsize14 mt10">可能是番剧被下架，或者链接输错了。</p>
          <div className="mt20">
            <Link href="/" className="comm-btn c-btn-2" title="回到首页">
              回到首页
            </Link>
            <Link href="/anime" className="comm-btn c-btn-1 ml10" title="去番剧列表">
              去番剧列表
            </Link>
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
