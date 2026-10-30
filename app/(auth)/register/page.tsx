import AuthForm from '@/components/auth/AuthForm';

export const metadata = { title: '注册' };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm mode="register" next={next} />;
}
