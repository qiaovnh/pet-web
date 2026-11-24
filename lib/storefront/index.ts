import { mockCommerce } from '@/lib/storefront/mock';
import { shopifyCommerce, shopifyReady } from '@/lib/storefront/shopify';
import type { Commerce } from '@/lib/storefront/types';

export const commerce: Commerce =
  process.env.COMMERCE_PROVIDER === 'shopify' && shopifyReady ? shopifyCommerce : mockCommerce;

export const providerName = commerce.provider;

export * from '@/lib/storefront/types';
export { getSettings, saveSettings, DEFAULT_SETTINGS } from '@/lib/storefront/settings';
export type { Settings } from '@/lib/storefront/settings';
