import Image from 'next/image';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { allProducts } from '@/lib/storefront/product-store';
import { formatMoney } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await allProducts();

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">商品目录</p>
          <h1 className="mt-2 font-display text-[34px] leading-none">商品</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{products.length} 件</p>
          <Link href="/admin/products/new" className="btn btn-solid h-10 px-5 text-white">
            <span className="text-[10px]">新建商品</span>
          </Link>
        </div>
      </header>

      <div className="mt-8 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-[12.5px]">
          <thead className="text-[10px] uppercase tracking-[0.1em] text-muted">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-normal">商品</th>
              <th className="px-3 py-3 font-normal">标识</th>
              <th className="px-3 py-3 font-normal">集合</th>
              <th className="px-3 py-3 font-normal">价格</th>
              <th className="px-3 py-3 font-normal">标签</th>
              <th className="px-5 py-3 font-normal text-right">编辑</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.handle} className="border-b border-line/70 last:border-0 hover:bg-cream/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-card">
                      <Image src={p.image} alt={p.title} fill sizes="40px" className="object-cover mix-blend-multiply" />
                    </div>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-[11px] text-muted">{p.subtitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 font-mono text-[11.5px] text-muted">{p.handle}</td>
                <td className="px-3 py-3 text-[11.5px] text-ink-soft">
                  {p.categories.join(', ') || '—'}
                </td>
                <td className="px-3 py-3">{formatMoney(p.price, 'USD')}</td>
                <td className="px-3 py-3 text-[11.5px] text-muted">{p.badge ?? '—'}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/products/${p.handle}`}
                    className="text-[11px] underline underline-offset-4 hover:text-tan"
                  >编辑</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
