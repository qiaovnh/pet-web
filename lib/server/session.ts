import { cookies } from 'next/headers';
import { DEFAULT_CURRENCY, isCurrency, type CurrencyCode } from '@/lib/currency';
import { commerce } from '@/lib/storefront';
import type { CartView } from '@/lib/storefront/types';

export const CART_COOKIE = 'inaue_cart';
export const CURRENCY_COOKIE = 'inaue_currency';

export async function getCurrency(): Promise<CurrencyCode> {
  const store = await cookies();
  const value = store.get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : DEFAULT_CURRENCY;
}

export async function getCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/** Read-only cart for server components; never creates a cart. */
export async function currentCart(): Promise<{ cart: CartView | null; cartId: string | null }> {
  const [cartId, currency] = await Promise.all([getCartId(), getCurrency()]);
  if (!cartId) return { cart: null, cartId: null };
  try {
    const result = await commerce.getCart(cartId, currency);
    return { cart: result.cart, cartId: result.cartId };
  } catch {
    return { cart: null, cartId };
  }
}
