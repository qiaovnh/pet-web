import { readJson, writeJson } from '@/lib/storefront/db';
import { products as seedProducts, type Product } from '@/lib/products';

const FILE = 'products.json';

/** The catalogue lives in `.data/products.json`, seeded from the static file on first run. */
export async function allProducts(): Promise<Product[]> {
  const stored = await readJson<Product[] | null>(FILE, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    await writeJson(FILE, seedProducts);
    return seedProducts;
  }
  return stored;
}

export async function saveAllProducts(list: Product[]): Promise<void> {
  await writeJson(FILE, list);
}

export async function findProduct(handle: string): Promise<Product | null> {
  const list = await allProducts();
  return list.find((p) => p.handle === handle) ?? null;
}

export async function upsertProduct(product: Product): Promise<void> {
  const list = await allProducts();
  const index = list.findIndex((p) => p.handle === product.handle);
  if (index >= 0) list[index] = product;
  else list.unshift(product);
  await saveAllProducts(list);
}

export async function deleteProduct(handle: string): Promise<boolean> {
  const list = await allProducts();
  const next = list.filter((p) => p.handle !== handle);
  if (next.length === list.length) return false;
  await saveAllProducts(next);
  return true;
}

const asciiSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * 只生成 ASCII 标识：非拉丁标题（中文/日文等）在路由与分享链接里不可靠，
 * 因此退化为稳定的随机标识，商家可在后台手动填一个拼音/英文 slug。
 */
export function slugify(value: string): string {
  const ascii = asciiSlug(value).slice(0, 60);
  return ascii || `item-${Date.now().toString(36)}`;
}
