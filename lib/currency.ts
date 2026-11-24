export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1, label: 'USD' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP' },
};

export const CURRENCY_LIST = Object.keys(CURRENCIES) as CurrencyCode[];
export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCY_LIST as string[]).includes(value);
}

/** All catalogue prices are stored in USD; conversion happens once, at the edge. */
export function convert(usd: number, to: CurrencyCode): number {
  return Math.round(usd * CURRENCIES[to].rate * 100) / 100;
}

export function formatMoney(usd: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  const value = convert(usd, code);
  return `${CURRENCIES[code].symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
