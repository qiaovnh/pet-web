'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { makeT, type T } from '@/lib/i18n/format';
import type { Dict } from '@/lib/i18n/dictionaries/en';

const Ctx = createContext<{ locale: Locale; t: T } | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dict;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: makeT(dict) }), [locale, dict]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
