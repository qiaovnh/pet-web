import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { findProduct } from '@/lib/storefront/product-store';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ handle: string }> }) {
  await requireAdmin();
  const { handle } = await params;
  const product = await findProduct(handle);
  if (!product) notFound();

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link href="/admin/products" className="text-[10px] uppercase tracking-[0.2em] text-muted hover:text-ink">
            ← 商品列表
          </Link>
          <h1 className="mt-2 font-display text-[34px] leading-none">{product.title}</h1>
          <p className="mt-2 font-mono text-[11px] text-muted">{product.handle}</p>
        </div>
        <Link href={`/products/${product.handle}`} target="_blank" className="text-[11px] underline underline-offset-4 text-muted hover:text-ink">
          在前台查看 ↗
        </Link>
      </header>
      <div className="mt-8">
        <ProductForm mode="edit" product={product} />
      </div>
    </div>
  );
}
