import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, LOCALE_COOKIE } from '@/lib/i18n/config';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { locale?: string } | null;
  if (!isLocale(body?.locale)) {
    return NextResponse.json({ ok: false, error: 'INVALID_LOCALE' }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, locale: body.locale });
  res.cookies.set(LOCALE_COOKIE, body.locale, {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
