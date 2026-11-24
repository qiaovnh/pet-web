import { NextResponse, type NextRequest } from 'next/server';
import { commerce } from '@/lib/storefront';
import { getCurrency, getCartId, CART_COOKIE } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { handle?: string; variantTitle?: string; qty?: number }
    | null;

  if (!body?.handle) {
    return NextResponse.json({ ok: false, error: 'MISSING_HANDLE' }, { status: 400 });
  }

  const [currency, cartId] = await Promise.all([getCurrency(), getCartId()]);
  const qty = Math.min(99, Math.max(1, Number(body.qty) || 1));

  try {
    const { cart, cartId: resolved } = await commerce.addLine(
      cartId,
      { handle: body.handle, variantTitle: body.variantTitle ?? '', qty },
      currency,
    );
    const res = NextResponse.json({ ok: true, cart });
    res.cookies.set(CART_COOKIE, resolved, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ADD_FAILED';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
