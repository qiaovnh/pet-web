import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from '@/lib/i18n/config';
import { dictFor } from '@/lib/i18n/dictionaries';
import { makeT, type T } from '@/lib/i18n/format';
import type { Dict } from '@/lib/i18n/dictionaries/en';

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDict(): Promise<Dict> {
  return dictFor(await getLocale());
}

export async function getT(): Promise<T> {
  return makeT(await getDict());
}
