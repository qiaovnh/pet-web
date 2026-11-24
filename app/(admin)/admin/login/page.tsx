import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin/auth';
import { LoginForm } from '@/components/admin/login-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: '登录 — INAUE 站点管理' };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin');

  return (
    <section className="grid min-h-screen place-items-center bg-cream px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-[26px] tracking-[0.2em]">
          INAUE
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted">站点管理</p>
        <h1 className="mt-8 font-display text-[34px] leading-none">登录</h1>
        <p className="mb-6 mt-2 text-[13px] text-muted">管理商品、订单、页面与 GEO 设置。</p>
        <LoginForm />
      </div>
    </section>
  );
}
