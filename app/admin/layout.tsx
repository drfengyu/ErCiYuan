import AdminNav from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const { ephemeral } = await getDb();

  return (
    <div className="admin-shell flex min-h-screen bg-slate-100 text-slate-800">
      <aside className="w-52 shrink-0 bg-slate-900 text-slate-300">
        <div className="px-5 py-4 text-lg font-semibold text-white">二刺螈 · 后台</div>
        <AdminNav />
        <div className="px-5 pt-6 text-xs text-slate-400">
          当前账号：{user.nickname}
          <div className="mt-1">{ephemeral ? '内存数据库（重启丢数据）' : '持久化数据库'}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto px-6 py-5">{children}</main>
    </div>
  );
}
