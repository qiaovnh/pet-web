import { slugify } from '@/lib/storefront/product-store';
import type { Product } from '@/lib/products';

export function normaliseProduct(input: Partial<Product>): { product?: Product; errors: string[] } {
  const errors: string[] = [];
  const title = (input.title ?? '').trim();
  if (!title) errors.push('TITLE_REQUIRED');

  const handle = slugify(input.handle || title);
  if (!handle) errors.push('HANDLE_REQUIRED');

  const sizes = (input.sizes ?? []).filter((s) => s && s.label && Number(s.price) > 0);
  if (sizes.length === 0) errors.push('SIZE_REQUIRED');

  const price = Number(input.price ?? sizes[0]?.price ?? 0);
  if (!(price > 0)) errors.push('PRICE_INVALID');

  const images = (input.images ?? [])
    .map((src) => String(src ?? '').trim())
    .filter(Boolean);
  const cover = (input.image ?? '').trim() || images[0] || '';
  const gallery = images.length > 0 ? images : cover ? [cover] : [];
  if (gallery.length === 0) errors.push('IMAGE_REQUIRED');

  if (errors.length > 0) return { errors };

  const product: Product = {
    handle,
    title,
    subtitle: (input.subtitle ?? 'Tea').trim(),
    notes: (input.notes ?? '').trim(),
    price,
    image: gallery[0] ?? '/img/p-dog6.jpg',
    images: gallery,
    badge: input.badge?.trim() || undefined,
    categories: (input.categories ?? [])
      .map((c) => String(c).trim().toLowerCase())
      .filter(Boolean),
    sizes: sizes.map((s) => ({ label: s.label.trim(), price: Number(s.price) })),
    blurb: (input.blurb ?? '').trim(),
    origin: (input.origin ?? '').trim(),
    caffeine: (input.caffeine ?? 'Dog & Cat').trim(),
    ingredients: (input.ingredients ?? '').trim(),
    preparation: (input.preparation ?? '').trim(),
    story: (input.story ?? '').trim(),
  };

  return { product, errors };
}
