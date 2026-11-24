import type { Metadata } from 'next';
import '@/app/globals.css';
import { isAdmin } from '@/lib/admin/auth';
import { AdminNav } from '@/components/admin/admin-nav';

export const metadata: Metadata = { title: 'INAUE — Store admin' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();

  return (
    <html lang="en">
      <body className="bg-[#f5f4f0] text-ink">
        {authed ? (
          <div className="md:flex">
            <AdminNav />
            <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
