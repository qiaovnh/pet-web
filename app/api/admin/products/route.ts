import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { allProducts, upsertProduct } from '@/lib/storefront/product-store';
import { normaliseProduct } from '@/lib/admin/normalise';
import type { Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  return NextResponse.json({ ok: true, products: await allProducts() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Partial<Product> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });

  const { product, errors } = normaliseProduct(body);
  if (!product) return NextResponse.json({ ok: false, error: errors.join(',') }, { status: 400 });

  const existing = await allProducts();
  if (existing.some((p) => p.handle === product.handle)) {
    return NextResponse.json({ ok: false, error: 'HANDLE_TAKEN' }, { status: 409 });
  }

  await upsertProduct(product);
  return NextResponse.json({ ok: true, product });
}
