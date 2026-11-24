import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { commerce } from '@/lib/storefront';
import { formatMoney } from '@/lib/currency';
import { getCurrency } from '@/lib/server/session';
import { getT } from '@/lib/i18n/server';
import { getGeo } from '@/lib/storefront/geo';
import { JsonLd, productSchema } from '@/components/seo/jsonld';
import { ProductGallery } from '@/components/product/gallery';
import { productImages } from '@/lib/products';
import { absoluteUrl } from '@/lib/url';
import { Accordion } from '@/components/accordion';
import { BuyBox } from '@/components/product/buy-box';
import { ProductRail } from '@/components/home/featured-tabs';
import { IconStar } from '@/components/icons';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const p = await commerce.getProduct(handle);
  return { title: p ? `${p.title} — INAUE Tea & Botanicals` : 'Not found' };
}

const dist = [
  { stars: 5, pct: 86 },
  { stars: 4, pct: 8 },
  { stars: 3, pct: 3 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 2 },
];

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [product, currency, t, geo] = await Promise.all([
    commerce.getProduct(handle),
    getCurrency(),
    getT(),
    getGeo(),
  ]);
  if (!product) notFound();

  const catalogue = await commerce.listProducts();
  const others = catalogue.filter((p) => p.handle !== product.handle).slice(0, 4);
  const accessories = catalogue
    .filter((p) => p.categories.includes('ware') || p.categories.includes('gifts'))
    .slice(0, 3);

  const base = geo.canonicalBase.replace(/\/$/, '');

  return (
    <>
      <JsonLd
        data={productSchema({
          name: product.title,
          description: product.blurb,
          image: absoluteUrl(base, productImages(product)[0]),
          url: `${base}/products/${product.handle}`,
          brand: geo.brandName,
          price: product.price,
          currency: 'USD',
          sku: product.handle,
          origin: product.origin,
        })}
      />
      <section className="bg-bone pb-20 pt-8">
        <div className="wrap">
          <nav className="text-[11px] uppercase tracking-[0.12em] text-muted">
            <Link href="/" className="hover:text-ink">{t('common.home')}</Link>
            <span className="px-2">/</span>
            <Link href="/collections/all" className="hover:text-ink">{t('nav.shopAll')}</Link>
            <span className="px-2">/</span>
            <span className="text-ink">{product.title}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Gallery */}
            <div>
              <ProductGallery images={productImages(product)} alt={product.title} />

            </div>

            {/* Buy box */}
            <div className="lg:sticky lg:top-[100px] lg:self-start">
              <p className="eyebrow text-muted">INAUE Tea &amp; Botanicals</p>
              <h1 className="mt-3 font-display text-[clamp(36px,4vw,54px)] leading-[1.05]">
                {product.title}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-tan">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} className="h-3 w-3" />
                  ))}
                </div>
                <span className="text-[11px] text-muted">(958)</span>
              </div>
              <p className="mt-5 max-w-md text-[13.5px] leading-[1.7] text-ink-soft">{product.blurb}</p>
              <p className="mt-4 text-[12px] italic text-muted">From {product.origin}</p>

              <div className="mt-7">
                <BuyBox product={product} currency={currency} />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6">
                {others.slice(0, 3).map((p) => (
                  <Link key={p.handle} href={`/products/${p.handle}`} className="group">
                    <div className="relative aspect-square overflow-hidden bg-card">
                      <Image src={p.image} alt={p.title} fill sizes="120px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <p className="mt-2 truncate text-[11.5px]">{p.title}</p>
                    <p className="text-[11px] text-muted">{formatMoney(p.price, currency)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="bg-cream py-20 md:py-28">
        <div className="wrap max-w-4xl text-center">
          <p className="font-display text-[clamp(24px,3vw,40px)] leading-[1.25]">
            {product.story}
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section className="bg-white py-16">
        <div className="wrap grid gap-10 md:grid-cols-[0.4fr_1fr]">
          <h2 className="font-display text-[clamp(26px,2.6vw,36px)]">{t('pdp.about')}</h2>
          <Accordion
            items={[
              { title: t('pdp.notes'), body: product.blurb },
              { title: t('pdp.prep'), body: product.preparation },
              { title: t('pdp.origin'), body: `${product.origin}. ${product.story}` },
              { title: t('pdp.ingredients'), body: product.ingredients },
              { title: t('pdp.caffeine'), body: product.caffeine },
            ]}
          />
        </div>
      </section>

      {/* Origin story */}
      <section className="bg-ink py-6">
        <div className="wrap grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
          <div className="bg-bone p-8 md:p-10">
            <p className="eyebrow text-tan">{t('pdp.originSpotlight')}</p>
            <h2 className="mt-4 font-display text-[clamp(24px,2.4vw,34px)] leading-[1.15]">
              {product.origin}
            </h2>
            <p className="mt-5 text-[13px] leading-[1.7] text-ink-soft">{product.story}</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-ink-soft md:aspect-auto md:min-h-[380px]">
            <Image src="/img/life-gate.jpg" alt="Growers at the garden" fill sizes="33vw" className="object-cover" />
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-ink-soft md:aspect-auto md:min-h-[380px]">
            <Image src="/img/life-sofa.jpg" alt="Botanical detail" fill sizes="33vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Featured botanicals */}
      <section className="bg-white py-20">
        <div className="wrap">
          <p className="eyebrow text-muted">{t('pdp.botanicals')}</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {[
              { img: '/img/life-sofa.jpg', name: 'Health+', origin: 'Sleep · Activity · Scratching', copy: 'Weekly trends per pet, so a change in behaviour shows up as a line on a chart rather than a vague feeling.' },
              { img: '/img/detail-closeup.jpg', name: 'Live GPS', origin: 'LTE-M · 175 countries', copy: 'Indoor positioning over Bluetooth, outdoor over cellular and GPS. Updates every few seconds while your pet is moving.' },
            ].map((b) => (
              <div key={b.name} className="grid grid-cols-[0.9fr_1.1fr] gap-5">
                <div className="relative aspect-[4/5] overflow-hidden bg-card">
                  <Image src={b.img} alt={b.name} fill sizes="(max-width: 768px) 45vw, 22vw" className="object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-display text-[24px]">{b.name}</h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted">{b.origin}</p>
                  <p className="mt-3 text-[13px] leading-[1.65] text-ink-soft">{b.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full bleed */}
      <section className="relative h-[42vh] min-h-[320px] w-full overflow-hidden md:h-[60vh]">
        <Image src="/img/detail-closeup.jpg" alt="Tea leaves" fill sizes="100vw" className="object-cover" />
      </section>

      {/* Brew accessories */}
      <section className="bg-bone py-20">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-muted">{t('pdp.teaware')}</p>
              <h2 className="mt-4 max-w-md font-display text-[clamp(26px,2.8vw,38px)] leading-[1.15]">
                {t('pdp.brewTitle')}
              </h2>
            </div>
          </div>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {accessories.map((a) => (
              <li key={a.handle}>
                <Link href={`/products/${a.handle}`} className="group flex items-center gap-6 py-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-card">
                    <Image src={a.image} alt={a.title} fill sizes="80px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-[20px]">{a.title}</p>
                    <p className="text-[12px] text-muted">{a.notes}</p>
                  </div>
                  <span className="text-[12px] text-muted">{formatMoney(a.price, currency)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Customer favorites */}
      <section className="bg-white py-20">
        <div className="wrap">
          <h2 className="mb-10 font-display text-[clamp(28px,3vw,42px)]">{t('pdp.favorites')}</h2>
          <ProductRail products={others} cta={t('pdp.shopAll')} currency={currency} />
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-bone py-20">
        <div className="wrap max-w-5xl">
          <h2 className="text-center font-display text-[clamp(28px,3vw,42px)]">{t('pdp.reviews')}</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-end gap-3">
                <span className="font-display text-[46px] leading-none">4.9</span>
                <div className="pb-1">
                  <div className="flex gap-0.5 text-tan">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar key={i} className="h-3.5 w-3.5" />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{t('pdp.reviewsCount', { count: 958 })}</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {dist.map((d) => (
                  <div key={d.stars} className="flex items-center gap-3 text-[11px] text-muted">
                    <span className="w-3">{d.stars}</span>
                    <div className="h-[3px] flex-1 bg-line">
                      <div className="h-full bg-ink/70" style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className="w-8 text-right">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {[
                { n: 'Rachel', t: '2 months ago', q: product.blurb, v: t('pdp.verified') },
                { n: 'John C.', t: '4 months ago', q: product.story, v: t('pdp.verified') },
                { n: 'Charity L.', t: '6 months ago', q: 'Second tracker we have bought. The first one survived two years of a dog who swims in every pond he finds.', v: t('pdp.verified') },
              ].map((r) => (
                <article key={r.n} className="border-b border-line pb-6">
                  <div className="flex gap-0.5 text-tan">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar key={i} className="h-3 w-3" />
                    ))}
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.7] text-ink-soft">“{r.q}”</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.1em] text-muted">
                    {r.n} · {r.v} · {r.t}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
