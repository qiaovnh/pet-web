import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { commerce } from '@/lib/storefront';
import type { CaffeineBucket, SortKey } from '@/lib/storefront/types';
import { getCurrency } from '@/lib/server/session';
import { getT } from '@/lib/i18n/server';
import type { DictKey } from '@/lib/i18n/dictionaries/en';
import { reviews } from '@/lib/site';
import { ProductCard } from '@/components/product-card';
import { IconChevron, IconStar } from '@/components/icons';

export const dynamic = 'force-dynamic';

type SearchParams = { caffeine?: string; sort?: string };

const CAFFEINE_OPTIONS = [
  { value: 'all', key: 'filter.all' },
  { value: 'dog', key: 'filter.none' },
  { value: 'cat', key: 'filter.low' },
  { value: 'both', key: 'filter.medium' },
] as const;

const SORT_OPTIONS = [
  { value: 'featured', key: 'filter.featured' },
  { value: 'price-asc', key: 'filter.priceAsc' },
  { value: 'price-desc', key: 'filter.priceDesc' },
  { value: 'name', key: 'filter.alpha' },
] as const;

function href(handle: string, next: SearchParams) {
  const params = new URLSearchParams();
  if (next.caffeine && next.caffeine !== 'all') params.set('caffeine', next.caffeine);
  if (next.sort && next.sort !== 'featured') params.set('sort', next.sort);
  const qs = params.toString();
  return `/collections/${handle}${qs ? `?${qs}` : ''}`;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const c = await commerce.getCollection(handle);
  return { title: c ? `${c.title} — INAUE Tea & Botanicals` : 'Not found' };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { handle } = await params;
  const sp = await searchParams;
  const collection = await commerce.getCollection(handle);
  if (!collection) notFound();

  const caffeine = (CAFFEINE_OPTIONS.find((o) => o.value === sp.caffeine)?.value ?? 'all') as
    | CaffeineBucket
    | 'all';
  const sort = (SORT_OPTIONS.find((o) => o.value === sp.sort)?.value ?? 'featured') as SortKey;

  const [items, currency, t] = await Promise.all([
    commerce.listProducts({ collection: handle, caffeine, sort }),
    getCurrency(),
    getT(),
  ]);
  const titleKey = `collections.${handle}` as DictKey;
  const translated = t(titleKey);
  const heading = translated === titleKey ? collection.title : translated;

  const filtered = caffeine !== 'all' || sort !== 'featured';

  return (
    <>
      <section className="bg-white pb-16 pt-12">
        <div className="wrap">
          <nav className="text-[11px] uppercase tracking-[0.12em] text-muted">
            <Link href="/" className="hover:text-ink">{t('common.home')}</Link>
            <span className="px-2">/</span>
            <span className="text-ink">{heading}</span>
          </nav>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
            <div>
              <h1 className="font-display text-[clamp(44px,5.4vw,76px)] leading-none">{heading}</h1>
              <p className="mt-4 max-w-lg text-[13.5px] leading-[1.6] text-ink-soft">{collection.intro}</p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{items.length} {t('filter.products')}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="me-1 text-[10px] uppercase tracking-[0.12em] text-muted">{t('filter.caffeine')}</span>
              {CAFFEINE_OPTIONS.map((o) => (
                <Link
                  key={o.value}
                  href={href(handle, { caffeine: o.value, sort })}
                  className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                    caffeine === o.value ? 'border-ink bg-ink text-cream' : 'border-line hover:border-ink'
                  }`}
                >
                  {t(o.key)}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.12em] text-muted">{t('filter.sort')}</span>
              {SORT_OPTIONS.map((o) => (
                <Link
                  key={o.value}
                  href={href(handle, { caffeine, sort: o.value })}
                  className={`px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                    sort === o.value ? 'text-ink underline underline-offset-4' : 'text-muted hover:text-ink'
                  }`}
                >
                  {t(o.key)}
                </Link>
              ))}
              {filtered && (
                <Link href={`/collections/${handle}`} className="ml-2 text-[10px] uppercase tracking-[0.1em] text-tan-deep underline underline-offset-4">
                  {t('filter.clear')}
                </Link>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="border border-line py-20 text-center">
              <p className="font-display text-[24px]">{t('filter.empty')}</p>
              <p className="mt-2 text-[13px] text-muted">{t('filter.emptyBody')}</p>
              <Link href={`/collections/${handle}`} className="btn btn-solid mt-6 text-white">
                <span>{t('filter.clear')}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14">
              {items.map((p, i) => (
                <div key={p.handle} className="contents">
                  <ProductCard product={p} currency={currency} />
                  {i === 3 && !filtered && (
                    <div className="flex flex-col justify-between bg-forest p-7 text-cream">
                      <div>
                        <h2 className="font-display text-[clamp(22px,2vw,30px)] leading-[1.15]">
                          {t('promo.matcha.title')}
                        </h2>
                        <p className="mt-4 text-[12.5px] leading-[1.65] text-cream/70">{t('promo.matcha.body')}</p>
                      </div>
                      <Link
                        href="/collections/matcha"
                        className="mt-8 self-start border border-cream/60 px-5 py-3 text-[10px] uppercase tracking-[0.16em] transition-colors hover:bg-cream/10"
                      >
                        {t('promo.matcha.cta')}
                      </Link>
                    </div>
                  )}
                  {i === 7 && !filtered && (
                    <Link href="/collections/gifts" className="group relative overflow-hidden bg-card">
                      <div className="relative aspect-square">
                        <Image
                          src="/img/hero-dog.jpg"
                          alt="Winter tea"
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                        />
                      </div>
                      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/65 to-transparent p-6 text-cream">
                        <h2 className="font-display text-[clamp(22px,2vw,30px)] leading-[1.1]">
                          {t('winter.title1')}
                          <br />
                          {t('winter.title2')}
                        </h2>
                        <span className="mt-3 text-[10px] uppercase tracking-[0.16em] text-cream/80">
                          {t('winter.cta')}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          <nav className="mt-16 flex items-center justify-center gap-6 border-t border-line pt-8 text-[11px] uppercase tracking-[0.12em]">
            <span className="text-muted/50">Prev</span>
            <span className="border-b border-ink pb-1 text-ink">1</span>
            {[2, 3, 4].map((n) => (
              <span key={n} className="text-muted">{n}</span>
            ))}
            <span className="text-muted">…</span>
            <span className="text-muted">16</span>
            <span className="text-muted">Next</span>
          </nav>
        </div>
      </section>

      <section className="bg-forest py-16 text-cream">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-md font-display text-[clamp(26px,2.8vw,38px)] leading-[1.15]">
              {t('reviews.title')}
            </h2>
            <div className="flex gap-2">
              {[0, 1].map((i) => (
                <span key={i} className="grid h-10 w-10 place-items-center rounded-full border border-cream/30 text-cream/60">
                  {i === 0 ? '←' : '→'}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <figure key={r.name} className="bg-bone p-6 text-ink">
                <div className="flex gap-0.5 text-tan">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <IconStar key={i} className="h-3 w-3" />
                  ))}
                </div>
                <blockquote className="mt-4 font-display text-[16px] leading-[1.45]">“{r.quote}”</blockquote>
                <figcaption className="mt-5 border-t border-line pt-4 text-[11px] uppercase tracking-[0.1em]">
                  — {r.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
