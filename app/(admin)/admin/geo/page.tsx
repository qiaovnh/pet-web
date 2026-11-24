import { requireAdmin } from '@/lib/admin/auth';
import { getGeo, geoChecks } from '@/lib/storefront/geo';
import { commerce } from '@/lib/storefront';
import { GeoEditor } from '@/components/admin/geo-editor';

export const dynamic = 'force-dynamic';

export default async function AdminGeoPage() {
  await requireAdmin();
  const [geo, products] = await Promise.all([getGeo(), commerce.listProducts()]);
  const checks = geoChecks(geo, {
    products: products.length,
    baseUrl: geo.canonicalBase,
  });

  return (
    <div>
      <header className="border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.2em] text-muted">生成式引擎优化</p>
        <h1 className="mt-2 font-display text-[34px] leading-none">GEO 优化</h1>
        <p className="mt-2 max-w-2xl text-[13px] text-muted">
          面向 ChatGPT、Perplexity、Google AI 概览等生成式引擎：把品牌实体、事实与问答写清楚，
          并自动生成 llms.txt、sitemap.xml、robots.txt 与结构化数据。
        </p>
      </header>
      <div className="mt-8">
        <GeoEditor initial={geo} checks={checks} baseUrl={geo.canonicalBase} />
      </div>
    </div>
  );
}
