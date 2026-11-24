import { NextResponse, type NextRequest } from 'next/server';
import { isCurrency } from '@/lib/currency';
import { CURRENCY_COOKIE } from '@/lib/server/session';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { currency?: string } | null;
  if (!isCurrency(body?.currency)) {
    return NextResponse.json({ ok: false, error: 'INVALID_CURRENCY' }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, currency: body.currency });
  res.cookies.set(CURRENCY_COOKIE, body.currency, {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
