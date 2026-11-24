import { NextResponse } from 'next/server';
import { commerce } from '@/lib/storefront';
import { getCurrency, getCartId, CART_COOKIE } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [currency, cartId] = await Promise.all([getCurrency(), getCartId()]);
  const { cart, cartId: resolved } = await commerce.getCart(cartId, currency);
  const res = NextResponse.json({ ok: true, cart });
  if (resolved && resolved !== cartId) {
    res.cookies.set(CART_COOKIE, resolved, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}
