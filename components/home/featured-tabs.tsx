'use client';

import { useRef, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { IconArrowLeft, IconArrowRight } from '@/components/icons';
import type { Product } from '@/lib/products';
import type { CurrencyCode } from '@/lib/currency';
import { useI18n } from '@/lib/i18n/client';

export function ProductRail({
  products,
  cta,
  ctaHref = '/collections/all',
  currency = 'USD',
}: {
  products: Product[];
  cta?: string;
  ctaHref?: string;
  currency?: CurrencyCode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };

  return (
    <div>
      <div
        ref={ref}
        className="no-bar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-1 md:-mx-0 md:gap-6 md:px-0"
      >
        {products.map((p) => (
          <div
            key={p.handle}
            className="w-[74%] shrink-0 snap-start md:w-[calc(25%-1.125rem)]"
          >
            <ProductCard product={p} currency={currency} />
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/25 transition-colors hover:border-ink hover:bg-ink hover:text-cream"
          >
            <IconArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next"
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/25 transition-colors hover:border-ink hover:bg-ink hover:text-cream"
          >
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
        {cta && (
          <a href={ctaHref} className="btn btn-tan hidden text-white sm:inline-flex">
            <span>{cta}</span>
          </a>
        )}
      </div>
    </div>
  );
}

export function FeaturedTabs({
  bestSellers,
  newArrivals,
  gifts,
  currency = 'USD',
}: {
  bestSellers: Product[];
  newArrivals: Product[];
  gifts: Product[];
  currency?: CurrencyCode;
}) {
  const { t } = useI18n();
  const tabs = [
    { label: t('featured.best'), items: bestSellers },
    { label: t('featured.new'), items: newArrivals },
    { label: t('featured.gifts'), items: gifts },
  ];
  const [active, setActive] = useState(0);

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(32px,3.6vw,50px)] leading-none">
            {t('featured.title')}
          </h2>
          <div className="flex gap-2">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActive(i)}
                className={`rounded-full border px-5 py-2.5 text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  i === active
                    ? 'border-ink bg-ink text-cream'
                    : 'border-ink/25 text-ink-soft hover:border-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <ProductRail products={tabs[active].items} cta={t('featured.cta')} currency={currency} />
      </div>
    </section>
  );
}
