import { NextResponse, type NextRequest } from 'next/server';
import { commerce } from '@/lib/storefront';
import { getCurrency, getCartId } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { qty?: number } | null;
  const cartId = await getCartId();
  if (!cartId) return NextResponse.json({ ok: false, error: 'NO_CART' }, { status: 400 });

  const currency = await getCurrency();
  const qty = Math.min(99, Math.max(0, Number(body?.qty) || 0));

  try {
    const cart = await commerce.updateLine(cartId, id, qty, currency);
    return NextResponse.json({ ok: true, cart });
  } catch {
    return NextResponse.json({ ok: false, error: 'UPDATE_FAILED' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const cartId = await getCartId();
  if (!cartId) return NextResponse.json({ ok: false, error: 'NO_CART' }, { status: 400 });

  const currency = await getCurrency();
  try {
    const cart = await commerce.removeLine(cartId, id, currency);
    return NextResponse.json({ ok: true, cart });
  } catch {
    return NextResponse.json({ ok: false, error: 'REMOVE_FAILED' }, { status: 400 });
  }
}
