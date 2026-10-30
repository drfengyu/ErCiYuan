import AuthForm from '@/components/auth/AuthForm';

export const metadata = { title: '登录' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm mode="login" next={next} />;
}
