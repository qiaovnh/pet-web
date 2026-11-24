import { en, type Dict, type DictKey } from './en';
import { ar } from './ar';
import { ja } from './ja';
import { ko } from './ko';
import { pt } from './pt';
import { es } from './es';
import { zhTW } from './zh-TW';
import type { Locale } from '@/lib/i18n/config';

export const dictionaries: Record<Locale, Dict> = {
  en,
  'zh-TW': zhTW,
  ja,
  ko,
  es,
  pt,
  ar,
};

export function dictFor(locale: Locale): Dict {
  return dictionaries[locale] ?? en;
}

export type { Dict, DictKey };
