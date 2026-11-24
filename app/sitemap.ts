import type { MetadataRoute } from 'next';
import { getGeo } from '@/lib/storefront/geo';
import { commerce } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [geo, products, collections] = await Promise.all([
    getGeo(),
    commerce.listProducts(),
    commerce.collections(),
  ]);
  const base = geo.canonicalBase.replace(/\/$/, '');
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/collections/all`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/search`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/llms.txt`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const collectionPages: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${base}/collections/${c.handle}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.handle}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...collectionPages, ...productPages];
}
