export const LOCALES = [
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { code: 'zh-TW', label: '繁體中文', short: '繁', dir: 'ltr' },
  { code: 'ja', label: '日本語', short: '日', dir: 'ltr' },
  { code: 'ko', label: '한국어', short: '한', dir: 'ltr' },
  { code: 'es', label: 'Español', short: 'ES', dir: 'ltr' },
  { code: 'pt', label: 'Português', short: 'PT', dir: 'ltr' },
  { code: 'ar', label: 'العربية', short: 'ع', dir: 'rtl' },
] as const;

export type Locale = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'inaue_locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.some((l) => l.code === value);
}

export function dirFor(locale: Locale): 'ltr' | 'rtl' {
  return LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr';
}

export function labelFor(locale: Locale): string {
  return LOCALES.find((l) => l.code === locale)?.label ?? locale;
}
