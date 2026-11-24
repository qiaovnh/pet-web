import Link from 'next/link';
import { commerce } from '@/lib/storefront';
import { getCurrency } from '@/lib/server/session';
import { getT } from '@/lib/i18n/server';
import { ProductCard } from '@/components/product-card';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Search — INAUE Tea & Botanicals' };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const term = q.trim();
  const [results, currency, t] = await Promise.all([commerce.search(term), getCurrency(), getT()]);

  return (
    <section className="bg-white pb-24 pt-12">
      <div className="wrap">
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="hover:text-ink">{t('common.home')}</Link>
          <span className="px-2">/</span>
          <span className="text-ink">{t('search.title')}</span>
        </p>

        <div className="mt-6 border-b border-line pb-8">
          <h1 className="font-display text-[clamp(36px,4.4vw,60px)] leading-none">
            {term ? `“${term}”` : t('search.title')}
          </h1>
          <p className="mt-3 text-[13px] text-muted">
            {term
              ? results.length === 1
                ? t('search.resultsOne')
                : t('search.results', { count: results.length })
              : t('search.try')}
          </p>
        </div>

        {term && results.length === 0 && (
          <div className="border border-line py-20 text-center">
            <p className="font-display text-[24px]">{t('search.noResults', { term })}</p>
            <p className="mt-2 text-[13px] text-muted">{t('search.noResultsBody')}</p>
            <Link href="/collections/all" className="btn btn-solid mt-6 text-white">
              <span>{t('pdp.shopAll')}</span>
            </Link>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.handle} product={p} currency={currency} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
