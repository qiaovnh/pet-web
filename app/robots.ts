import type { MetadataRoute } from 'next';
import { getGeo } from '@/lib/storefront/geo';

export const dynamic = 'force-dynamic';

const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot', 'anthropic-ai'];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const geo = await getGeo();
  const base = geo.canonicalBase.replace(/\/$/, '');

  const disallow = ['/admin', '/admin/', '/api/', '/checkout/', '/checkout/success'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      ...(geo.allowAiCrawlers
        ? [
            {
              userAgent: AI_CRAWLERS,
              allow: ['/', '/llms.txt', '/llms-full.txt'],
              disallow: ['/admin', '/admin/', '/api/', '/checkout/'],
            },
          ]
        : []),
      ...(geo.allowAiCrawlers
        ? []
        : [{ userAgent: AI_CRAWLERS, disallow: '/' }]),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
