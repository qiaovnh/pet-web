import { NextResponse, type NextRequest } from 'next/server';
import { currentCart } from '@/lib/server/session';
import { createOrder } from '@/lib/orders';
import type { CheckoutInput } from '@/lib/storefront/types';
import { CART_COOKIE } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Partial<CheckoutInput> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });

  const input: CheckoutInput = {
    email: (body.email ?? '').trim(),
    name: (body.name ?? '').trim(),
    address: (body.address ?? '').trim(),
    city: (body.city ?? '').trim(),
    postalCode: (body.postalCode ?? '').trim(),
    country: (body.country ?? '').trim(),
    shippingMethod: body.shippingMethod === 'express' ? 'express' : 'standard',
  };

  if (!EMAIL.test(input.email)) {
    return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 400 });
  }
  for (const field of ['name', 'address', 'city', 'postalCode', 'country'] as const) {
    if (!input[field]) {
      return NextResponse.json({ ok: false, error: `MISSING_${field.toUpperCase()}` }, { status: 400 });
    }
  }

  const { cart } = await currentCart();
  if (!cart || cart.lines.length === 0) {
    return NextResponse.json({ ok: false, error: 'EMPTY_CART' }, { status: 400 });
  }

  const order = await createOrder(cart, input);

  const res = NextResponse.json({ ok: true, orderId: order.id });
  res.cookies.set(CART_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
