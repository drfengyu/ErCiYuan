import { fail, ok } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('未登录', 401);
  return ok({
    userInfo: {
      id: user.id,
      mobile: user.mobile,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}
