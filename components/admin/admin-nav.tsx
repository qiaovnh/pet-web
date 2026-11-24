'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: '仪表盘', exact: true },
  { href: '/admin/products', label: '商品' },
  { href: '/admin/orders', label: '订单' },
  { href: '/admin/pages', label: '页面管理' },
  { href: '/admin/geo', label: 'GEO 优化' },
  { href: '/admin/settings', label: '设置' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <aside className="flex w-full shrink-0 flex-col border-line bg-white p-5 md:min-h-screen md:w-60 md:border-r">
      <Link href="/admin" className="font-display text-[22px] tracking-[0.2em]">
        INAUE
      </Link>
      <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-muted">站点管理</p>

      <nav className="mt-8 space-y-1">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2 text-[12.5px] transition-colors ${
                active ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-cream'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link href="/" target="_blank" className="block px-3 py-2 text-[12px] text-muted hover:text-ink">
          查看店铺 ↗
        </Link>
        <button onClick={logout} className="block w-full px-3 py-2 text-left text-[12px] text-muted hover:text-ink">
          退出登录
        </button>
      </div>
    </aside>
  );
}
