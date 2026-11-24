import { formatMoney, type CurrencyCode } from '@/lib/currency';
import type { Product } from '@/lib/products';
import type {
  CartView,
  CollectionInfo,
  Commerce,
  OrderLine,
  ProductQuery,
  StoredCart,
} from '@/lib/storefront/types';

/**
 * Shopify Storefront API adapter.
 *
 * Activate with:
 *   COMMERCE_PROVIDER=shopify
 *   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN=...
 *   SHOPIFY_API_VERSION=2025-01
 *
 * Catalogue prices are read in the shop currency; the presentation layer still
 * converts for display, exactly like the mock provider.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? '';
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN ?? '';
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? '2025-01';

export const shopifyReady = Boolean(DOMAIN && TOKEN);

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!shopifyReady) throw new Error('SHOPIFY_NOT_CONFIGURED');
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  if (!json.data) throw new Error('EMPTY_RESPONSE');
  return json.data;
}

type ShopifyProduct = {
  handle: string;
  title: string;
  description: string;
  tags: string[];
  featuredImage: { url: string } | null;
  priceRange: { minVariantPrice: { amount: string } };
  variants: { nodes: { id: string; title: string; price: { amount: string }; availableForSale: boolean }[] };
};

const PRODUCT_FRAGMENT = `
  fragment P on Product {
    handle title description tags
    featuredImage { url }
    priceRange { minVariantPrice { amount } }
    variants(first: 10) { nodes { id title price { amount } availableForSale } }
  }
`;

function mapProduct(node: ShopifyProduct): Product {
  const first = node.variants.nodes[0];
  const basePrice = Number(node.priceRange.minVariantPrice.amount);
  return {
    handle: node.handle,
    title: node.title,
    subtitle: node.tags[0] ?? 'Tea',
    notes: node.tags.slice(1, 4).join(' | '),
    price: basePrice,
    image: node.featuredImage?.url ?? '/img/p-dog6.jpg',
    categories: node.tags.map((t) => t.toLowerCase()),
    sizes: node.variants.nodes.map((v) => ({ label: v.title, price: Number(v.price.amount) })),
    blurb: node.description.slice(0, 240),
    origin: 'Direct trade',
    caffeine: 'Varies',
    ingredients: 'See product page',
    preparation: '1 tsp per 8 oz',
    story: node.description,
    ...(first ? {} : {}),
  };
}

type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        price: { amount: string };
        product: { handle: string; title: string; featuredImage: { url: string } | null };
      };
    }[];
  };
  cost: { subtotalAmount: { amount: string } };
};

const CART_FRAGMENT = `
  fragment C on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount } }
    lines(first: 50) {
      nodes {
        id quantity
        merchandise {
          ... on ProductVariant {
            id title price { amount }
            product { handle title featuredImage { url } }
          }
        }
      }
    }
  }
`;

function mapCart(cart: ShopifyCart, currency: CurrencyCode): CartView {
  const lines: OrderLine[] = cart.lines.nodes.map((line) => {
    const unit = Number(line.merchandise.price.amount);
    const total = Math.round(unit * line.quantity * 100) / 100;
    return {
      id: line.id,
      handle: line.merchandise.product.handle,
      variantTitle: line.merchandise.title,
      qty: line.quantity,
      title: line.merchandise.product.title,
      image: line.merchandise.product.featuredImage?.url ?? '',
      unitPrice: unit,
      lineTotal: total,
      unitPriceText: formatMoney(unit, currency),
      lineTotalText: formatMoney(total, currency),
    };
  });
  const subtotal = Math.round(lines.reduce((n, l) => n + l.lineTotal, 0) * 100) / 100;
  const remaining = Math.max(0, 75 - subtotal);
  return {
    id: cart.id,
    currency,
    itemCount: cart.totalQuantity,
    subtotal,
    subtotalText: formatMoney(subtotal, currency),
    freeShippingRemaining: remaining,
    freeShippingRemainingText: formatMoney(remaining, currency),
    freeShippingThreshold: 75,
    lines,
  };
}

export const shopifyCommerce: Commerce = {
  provider: 'shopify',

  async listProducts(query: ProductQuery = {}) {
    const search = query.collection && query.collection !== 'all' ? `tag:${query.collection}` : '';
    const sortMap: Record<string, string> = {
      'price-asc': 'PRICE',
      'price-desc': 'PRICE',
      name: 'TITLE',
      featured: 'RELEVANCE',
    };
    const data = await gql<{ products: { nodes: ShopifyProduct[] } }>(
      `query P($q: String, $sort: ProductSortKeys, $reverse: Boolean) {
        products(first: ${query.limit ?? 48}, query: $q, sortKey: $sort, reverse: $reverse) {
          nodes { ...P }
        }
      }
      ${PRODUCT_FRAGMENT}`,
      {
        q: search || null,
        sort: sortMap[query.sort ?? 'featured'] ?? 'RELEVANCE',
        reverse: query.sort === 'price-desc',
      },
    );
    return data.products.nodes.map(mapProduct);
  },

  async getProduct(handle) {
    const data = await gql<{ product: ShopifyProduct | null }>(
      `query P($handle: String!) { product(handle: $handle) { ...P } }
       ${PRODUCT_FRAGMENT}`,
      { handle },
    );
    return data.product ? mapProduct(data.product) : null;
  },

  async search(term) {
    if (!term.trim()) return [];
    const data = await gql<{ products: { nodes: ShopifyProduct[] } }>(
      `query S($q: String!) { products(first: 24, query: $q) { nodes { ...P } } }
       ${PRODUCT_FRAGMENT}`,
      { q: term },
    );
    return data.products.nodes.map(mapProduct);
  },

  async collections(): Promise<CollectionInfo[]> {
    const data = await gql<{
      collections: { nodes: { handle: string; title: string; description: string; image: { url: string } | null }[] };
    }>(`query { collections(first: 50) { nodes { handle title description image { url } } } }`);
    return data.collections.nodes.map((c) => ({
      handle: c.handle,
      title: c.title,
      intro: c.description,
      image: c.image?.url ?? '/img/p-dog6.jpg',
    }));
  },

  async getCollection(handle) {
    const all = await this.collections();
    return all.find((c) => c.handle === handle) ?? null;
  },

  async getCart(cartId, currency) {
    if (!cartId) return { cart: mapCart({ id: '', checkoutUrl: '', totalQuantity: 0, lines: { nodes: [] }, cost: { subtotalAmount: { amount: '0' } } }, currency), cartId: '' };
    const data = await gql<{ cart: ShopifyCart | null }>(
      `query C($id: ID!) { cart(id: $id) { ...C } } ${CART_FRAGMENT}`,
      { id: cartId },
    );
    if (!data.cart) throw new Error('CART_NOT_FOUND');
    return { cart: mapCart(data.cart, currency), cartId: data.cart.id };
  },

  async addLine(cartId, input, currency) {
    const product = await this.getProduct(input.handle);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');

    const variantData = await gql<{ product: { variants: { nodes: { id: string; title: string }[] } } | null }>(
      `query V($handle: String!) { product(handle: $handle) { variants(first: 20) { nodes { id title } } } }`,
      { handle: input.handle },
    );
    const variant =
      variantData.product?.variants.nodes.find((v) => v.title === input.variantTitle) ??
      variantData.product?.variants.nodes[0];

    const lines = [{ merchandiseId: variant!.id, quantity: Math.max(1, input.qty) }];

    const data = cartId
      ? await gql<{ cartLinesAdd: { cart: ShopifyCart } }>(
          `mutation A($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...C } }
          } ${CART_FRAGMENT}`,
          { cartId, lines },
        ).then((d) => d.cartLinesAdd)
      : await gql<{ cartCreate: { cart: ShopifyCart } }>(
          `mutation N($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { ...C } } } ${CART_FRAGMENT}`,
          { lines },
        ).then((d) => d.cartCreate);

    return { cart: mapCart(data.cart, currency), cartId: data.cart.id };
  },

  async updateLine(cartId, lineId, qty, currency) {
    const data = await gql<{ cartLinesUpdate: { cart: ShopifyCart } }>(
      `mutation U($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...C } }
      } ${CART_FRAGMENT}`,
      { cartId, lines: [{ id: lineId, quantity: Math.max(0, qty) }] },
    );
    return mapCart(data.cartLinesUpdate.cart, currency);
  },

  async removeLine(cartId, lineId, currency) {
    const data = await gql<{ cartLinesRemove: { cart: ShopifyCart } }>(
      `mutation R($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...C } }
      } ${CART_FRAGMENT}`,
      { cartId, lineIds: [lineId] },
    );
    return mapCart(data.cartLinesRemove.cart, currency);
  },
};

export type { StoredCart };
