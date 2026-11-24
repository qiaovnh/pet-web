import { randomUUID } from 'node:crypto';
import { formatMoney, type CurrencyCode } from '@/lib/currency';
import { readStore, writeStore } from '@/lib/storefront/db';
import { getSettings } from '@/lib/storefront/settings';
import type { CartView, CheckoutInput, Order } from '@/lib/storefront/types';

const ORDER_FILE = 'orders.json';
const SHIPPING_FLAT = 8;
const TAX_RATE = 0.0825;

export const EXPRESS_FLAT = 18;

export const shippingFor = (
  subtotal: number,
  method: string = 'standard',
  freeThreshold: number = 75,
) => {
  if (method === 'express') return EXPRESS_FLAT;
  return subtotal >= freeThreshold ? 0 : SHIPPING_FLAT;
};
export const taxFor = (subtotal: number, rate: number = TAX_RATE) =>
  Math.round(subtotal * rate * 100) / 100;

function orderNumber(): string {
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  const salt = randomUUID().replace(/-/g, '').slice(0, 3).toUpperCase();
  return `INA-${stamp}${salt}`;
}

export async function createOrder(
  cart: CartView,
  input: CheckoutInput,
): Promise<Order> {
  const settings = await getSettings();
  const subtotal = cart.subtotal;
  const shipping = shippingFor(subtotal, input.shippingMethod, settings.freeShippingThreshold);
  const tax = taxFor(subtotal, settings.taxRate);
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  const order: Order = {
    id: orderNumber(),
    createdAt: Date.now(),
    ...input,
    currency: cart.currency as CurrencyCode,
    lines: cart.lines,
    subtotal,
    shipping,
    tax,
    total,
    totalText: formatMoney(total, cart.currency as CurrencyCode),
  };

  const store = await readStore<Order>(ORDER_FILE);
  store[order.id] = order;
  await writeStore(ORDER_FILE, store);
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const store = await readStore<Order>(ORDER_FILE);
  return store[id] ?? null;
}

export const formatOrderMoney = formatMoney;
