import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { deleteProduct, findProduct, upsertProduct } from '@/lib/storefront/product-store';
import type { Product } from '@/lib/products';
import { normaliseProduct } from '@/lib/admin/normalise';
import { allProducts } from '@/lib/storefront/product-store';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ handle: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  const { handle } = await params;
  const product = await findProduct(handle);
  if (!product) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true, product });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  const { handle } = await params;
  const existing = await findProduct(handle);
  if (!existing) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Partial<Product> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });

  const { product, errors } = normaliseProduct({ ...existing, ...body });
  if (!product) return NextResponse.json({ ok: false, error: errors.join(',') }, { status: 400 });

  const catalogue = await allProducts();
  const clash = catalogue.some((p) => p.handle === product.handle && p.handle !== handle);
  if (clash) return NextResponse.json({ ok: false, error: 'HANDLE_TAKEN' }, { status: 409 });

  if (product.handle !== handle) {
    await deleteProduct(handle);
  }
  await upsertProduct(product);
  return NextResponse.json({ ok: true, product });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  const { handle } = await params;
  const removed = await deleteProduct(handle);
  if (!removed) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
