import { randomUUID } from 'node:crypto';
import { collections as catalogue, getCollection } from '@/lib/products';
import { formatMoney, type CurrencyCode } from '@/lib/currency';
import { readStore, writeStore } from '@/lib/storefront/db';
import { allProducts, findProduct } from '@/lib/storefront/product-store';
import { getSettings } from '@/lib/storefront/settings';
import type {
  CartView,
  CaffeineBucket,
  CollectionInfo,
  Commerce,
  ProductQuery,
  StoredCart,
  StoredLine,
} from '@/lib/storefront/types';
import type { Product } from '@/lib/products';

const CART_FILE = 'carts.json';

const caffeineBucket = (value: string): CaffeineBucket => {
  const v = value.toLowerCase();
  if (v.includes('&')) return 'both';
  if (v.includes('dog')) return 'dog';
  if (v.includes('cat')) return 'cat';
  return 'both';
};

async function toView(cart: StoredCart, currency: CurrencyCode): Promise<CartView> {
  const settings = await getSettings();
  const catalogueNow = await allProducts();
  const byHandle = new Map(catalogueNow.map((p) => [p.handle, p]));

  const lines = cart.lines.flatMap((line) => {
    const product = byHandle.get(line.handle);
    if (!product) return [];
    const variant = product.sizes.find((s) => s.label === line.variantTitle) ?? product.sizes[0];
    const lineTotal = Math.round(variant.price * line.qty * 100) / 100;
    return [
      {
        ...line,
        title: product.title,
        image: product.image,
        unitPrice: variant.price,
        lineTotal,
        unitPriceText: formatMoney(variant.price, currency),
        lineTotalText: formatMoney(lineTotal, currency),
      },
    ];
  });

  const subtotal = Math.round(lines.reduce((n, l) => n + l.lineTotal, 0) * 100) / 100;
  const remaining = Math.max(0, settings.freeShippingThreshold - subtotal);

  return {
    id: cart.id,
    currency,
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
    subtotal,
    subtotalText: formatMoney(subtotal, currency),
    freeShippingRemaining: remaining,
    freeShippingRemainingText: formatMoney(remaining, currency),
    freeShippingThreshold: settings.freeShippingThreshold,
    lines,
  };
}

const emptyCart = (): StoredCart => ({ id: randomUUID(), lines: [], updatedAt: Date.now() });

async function loadCart(cartId: string | null): Promise<StoredCart> {
  if (!cartId) return emptyCart();
  const store = await readStore<StoredCart>(CART_FILE);
  return store[cartId] ?? emptyCart();
}

async function saveCart(cart: StoredCart): Promise<void> {
  const store = await readStore<StoredCart>(CART_FILE);
  cart.updatedAt = Date.now();
  store[cart.id] = cart;
  await writeStore(CART_FILE, store);
}

const collectionViews = (): CollectionInfo[] =>
  catalogue.map((c) => ({ handle: c.handle, title: c.title, intro: c.intro, image: c.image }));

function applyQuery(list: Product[], query: ProductQuery = {}) {
  let out = list;

  if (query.collection && query.collection !== 'all') {
    out = out.filter((p) => p.categories.includes(query.collection!));
  }
  if (query.caffeine && query.caffeine !== 'all') {
    out = out.filter((p) => caffeineBucket(p.caffeine) === query.caffeine);
  }

  switch (query.sort) {
    case 'price-asc':
      out = [...out].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      out = [...out].sort((a, b) => b.price - a.price);
      break;
    case 'name':
      out = [...out].sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  return query.limit ? out.slice(0, query.limit) : out;
}

export const mockCommerce: Commerce = {
  provider: 'mock',

  async listProducts(query = {}) {
    return applyQuery(await allProducts(), query);
  },

  async getProduct(handle) {
    return findProduct(handle);
  },

  async search(term) {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    const list = await allProducts();
    return list.filter((p) =>
      [p.title, p.subtitle, p.notes, p.blurb, p.origin, ...p.categories]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  },

  async collections() {
    return collectionViews();
  },

  async getCollection(handle) {
    const c = getCollection(handle);
    if (!c) return null;
    return { handle: c.handle, title: c.title, intro: c.intro, image: c.image };
  },

  async getCart(cartId, currency) {
    const cart = await loadCart(cartId);
    return { cart: await toView(cart, currency), cartId: cart.id };
  },

  async addLine(cartId, input, currency) {
    const cart = await loadCart(cartId);
    const product = await findProduct(input.handle);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');

    const variant = product.sizes.find((s) => s.label === input.variantTitle) ?? product.sizes[0];
    const existing = cart.lines.find(
      (l) => l.handle === input.handle && l.variantTitle === variant.label,
    );

    if (existing) {
      existing.qty += Math.max(1, input.qty);
    } else {
      cart.lines.push({
        id: randomUUID(),
        handle: input.handle,
        variantTitle: variant.label,
        qty: Math.max(1, input.qty),
      });
    }

    await saveCart(cart);
    return { cart: await toView(cart, currency), cartId: cart.id };
  },

  async updateLine(cartId, lineId, qty, currency) {
    const cart = await loadCart(cartId);
    cart.lines =
      qty <= 0
        ? cart.lines.filter((l) => l.id !== lineId)
        : cart.lines.map((l) => (l.id === lineId ? { ...l, qty } : l));
    await saveCart(cart);
    return toView(cart, currency);
  },

  async removeLine(cartId, lineId, currency) {
    const cart = await loadCart(cartId);
    cart.lines = cart.lines.filter((l) => l.id !== lineId);
    await saveCart(cart);
    return toView(cart, currency);
  },
};

export { toView as toCartView, randomUUID as newLineId };
export type { StoredLine };
