import { readJson, writeJson } from '@/lib/storefront/db';

export type Settings = {
  storeName: string;
  announcement: string;
  supportEmail: string;
  supportHours: string;
  freeShippingThreshold: number;
  taxRate: number;
};

const FILE = 'settings.json';

export const DEFAULT_SETTINGS: Settings = {
  storeName: 'INAUE',
  announcement: 'Free shipping over $60 · 30-day money-back guarantee · Cancel anytime',
  supportEmail: 'hello@inaue.com',
  supportHours: 'Mon–Fri, 8AM–6PM CET',
  freeShippingThreshold: 75,
  taxRate: 0.0825,
};

export async function getSettings(): Promise<Settings> {
  const stored = await readJson<Partial<Settings> | null>(FILE, null);
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = {
    ...current,
    ...patch,
    freeShippingThreshold: Math.max(0, Number(patch.freeShippingThreshold ?? current.freeShippingThreshold)),
    taxRate: Math.min(0.4, Math.max(0, Number(patch.taxRate ?? current.taxRate))),
  };
  await writeJson(FILE, next);
  return next;
}
