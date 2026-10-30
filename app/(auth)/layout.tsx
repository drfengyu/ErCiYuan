import SiteCss from '@/components/site/SiteCss';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteCss extra={['sign', 'iconfont']} />
      <div className="sign">
        <div className="logo">
          <a href="/">
            <img width="300" height="200" src="/assets/img/logo1.png" alt="logo" />
          </a>
        </div>
        {children}
      </div>
    </>
  );
}
