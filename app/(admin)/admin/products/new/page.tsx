import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div>
      <header className="border-b border-line pb-6">
        <Link href="/admin/products" className="text-[10px] uppercase tracking-[0.2em] text-muted hover:text-ink">
          ← 商品列表
        </Link>
        <h1 className="mt-2 font-display text-[34px] leading-none">新建商品</h1>
      </header>
      <div className="mt-8">
        <ProductForm mode="new" />
      </div>
    </div>
  );
}
