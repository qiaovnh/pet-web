import type { Product } from '@/lib/products';
import type { CurrencyCode } from '@/lib/currency';

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';
export type CaffeineBucket = 'dog' | 'cat' | 'both';

export type ProductQuery = {
  collection?: string;
  caffeine?: CaffeineBucket | 'all';
  sort?: SortKey;
  limit?: number;
};

export type CollectionInfo = {
  handle: string;
  title: string;
  intro: string;
  image: string;
  count?: number;
};

export type StoredLine = {
  id: string;
  handle: string;
  variantTitle: string;
  qty: number;
};

export type StoredCart = {
  id: string;
  lines: StoredLine[];
  updatedAt: number;
};

export type CartLineView = StoredLine & {
  title: string;
  image: string;
  unitPrice: number;
  lineTotal: number;
  unitPriceText: string;
  lineTotalText: string;
};

export type CartView = {
  id: string;
  currency: CurrencyCode;
  itemCount: number;
  subtotal: number;
  subtotalText: string;
  freeShippingRemaining: number;
  freeShippingRemainingText: string;
  freeShippingThreshold: number;
  lines: CartLineView[];
};

export type OrderLine = CartLineView;

export type Order = {
  id: string;
  createdAt: number;
  email: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: string;
  currency: CurrencyCode;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  totalText: string;
};

export type CheckoutInput = {
  email: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: string;
};

export interface Commerce {
  provider: 'mock' | 'shopify';
  listProducts(query?: ProductQuery): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  search(term: string): Promise<Product[]>;
  collections(): Promise<CollectionInfo[]>;
  getCollection(handle: string): Promise<CollectionInfo | null>;
  getCart(cartId: string | null, currency: CurrencyCode): Promise<{ cart: CartView; cartId: string }>;
  addLine(
    cartId: string | null,
    input: { handle: string; variantTitle: string; qty: number },
    currency: CurrencyCode,
  ): Promise<{ cart: CartView; cartId: string }>;
  updateLine(cartId: string, lineId: string, qty: number, currency: CurrencyCode): Promise<CartView>;
  removeLine(cartId: string, lineId: string, currency: CurrencyCode): Promise<CartView>;
}
