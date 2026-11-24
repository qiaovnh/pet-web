import Image from 'next/image';
import Link from 'next/link';
import { commerce } from '@/lib/storefront';
import { getCurrency } from '@/lib/server/session';
import { getT } from '@/lib/i18n/server';
import { getContent, bannerFor } from '@/lib/storefront/content';
import { getGeo } from '@/lib/storefront/geo';
import { JsonLd, faqSchema } from '@/components/seo/jsonld';
import { benefits, exploreTeas, press, reviews } from '@/lib/site';
import { FeaturedTabs } from '@/components/home/featured-tabs';
import { ExploreTeas } from '@/components/home/explore-teas';
import { HeroVideo } from '@/components/home/hero-video';
import { IconStar } from '@/components/icons';

export const dynamic = 'force-dynamic';

const NEW_HANDLES = ['cat-6-mini', 'dog-6-pro', 'trail-bundle', 'magnetic-charger'];

const formatTiles = [
  { key: 'format.looseLeaf' as const, handle: 'green', image: '/img/p-dog6.jpg', count: '6' },
  { key: 'format.matchaPowders' as const, handle: 'matcha', image: '/img/p-cat6.jpg', count: '1' },
  { key: 'format.botanical' as const, handle: 'botanical', image: '/img/p-cat6mini.jpg', count: '1' },
  { key: 'format.giftsTeaware' as const, handle: 'gifts', image: '/img/p-bundle.jpg', count: '3' },
];

export default async function HomePage() {
  const [all, currency, t, content, geo] = await Promise.all([
    commerce.listProducts(),
    getCurrency(),
    getT(),
    getContent(),
    getGeo(),
  ]);
  const hero = bannerFor(content, 'home-hero');
  const promo = bannerFor(content, 'home-promo');
  const themeClass = (theme: string) =>
    theme === 'ink' ? 'bg-ink text-cream' : theme === 'cream' ? 'bg-bone text-ink' : 'bg-forest text-cream';
  const byBadge = (b: string) => all.filter((p) => p.badge === b);
  const newest = all.filter((p) => NEW_HANDLES.includes(p.handle));
  const giftSets = all.filter((p) => p.categories.includes('gifts'));

  return (
    <>
      {geo.faqs.length > 0 && <JsonLd data={faqSchema(geo.faqs)} />}

      {/* Hero */}
      <section
        className="relative -mt-[76px] h-[86vh] min-h-[560px] w-full overflow-hidden"
        data-banner="home-hero"
      >
        <HeroVideo
          poster={hero?.image || '/img/hero-wide.jpg'}
          desktopSrc="/video/hero-desktop.mp4"
          mobileSrc="/video/hero-mobile.mp4"
        />
        <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-6 pt-[76px] text-center text-white">
          <h1 className="max-w-4xl font-display text-[clamp(38px,5.6vw,76px)] leading-[0.98] tracking-[-0.03em] drop-shadow-[0_2px_24px_rgba(0,0,0,0.25)]">
            {hero?.title || t('hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/90">
            {hero?.subtitle || t('hero.sub')}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/collections/dogs" className="btn bg-white text-tan hover:bg-cream">
              <span>{t('nav.looseLeaf')}</span>
            </Link>
            <Link href="/collections/cats" className="btn bg-white text-tan hover:bg-cream">
              <span>{t('nav.matchaPowders')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section id="story" className="bg-bone py-20 md:py-28">
        <div className="wrap max-w-3xl text-center">
          <p className="eyebrow text-muted">{t('intro.eyebrow')}</p>
          <h2 className="mt-6 font-display text-[clamp(32px,4vw,54px)] leading-[1.12]">
            {t('intro.title')}
            <br />
            <span className="text-tan">{t('intro.titleItalic')}</span>
          </h2>
          <Link href="#quiz" className="mt-8 inline-block text-[13px] link-underline">
            {t('intro.link')}
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white pb-20 md:pb-28">
        <div className="wrap grid gap-10 md:grid-cols-3 md:gap-8">
          {benefits.map((b) => (
            <article key={b.titleKey}>
              <div className="relative aspect-[4/3] overflow-hidden bg-card">
                <Image src={b.image} alt={t(b.titleKey)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <h3 className="eyebrow mt-6 text-ink">{t(b.titleKey)}</h3>
              <p className="mt-3 max-w-sm text-[13.5px] leading-[1.65] text-ink-soft">{t(b.bodyKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <FeaturedTabs
        bestSellers={byBadge('Best Seller')}
        newArrivals={newest}
        gifts={giftSets}
        currency={currency}
      />

      {/* Matcha promo split */}
      <section className="bg-bone" data-banner="home-promo">
        <div className="wrap grid items-stretch gap-6 py-6 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-card md:aspect-auto">
            <Image
              src={promo?.image || '/img/detail-closeup.jpg'}
              alt={promo?.title || t('promo.matcha.title')}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className={`flex flex-col justify-center px-8 py-14 md:px-14 ${themeClass(promo?.theme ?? 'forest')}`}>
            <h2 className="font-display text-[clamp(30px,3.4vw,46px)] leading-[1.1]">
              {promo?.title || t('promo.matcha.title')}
            </h2>
            <p className="mt-5 max-w-sm text-[13.5px] leading-[1.7] opacity-75">
              {promo?.subtitle || t('promo.matcha.body')}
            </p>
            <div className="mt-8">
              <Link
                href={promo?.ctaHref || '/collections/matcha'}
                className={`btn btn-outline ${
                  promo?.theme === 'cream' ? 'border-ink/50 text-ink hover:bg-ink hover:text-cream' : 'border-cream/60 text-cream hover:bg-cream/10'
                }`}
              >
                <span className="text-[11px] tracking-[0.16em]">{promo?.ctaLabel || t('promo.matcha.cta')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ExploreTeas />

      {/* Shop by format */}
      <section className="bg-white py-20 md:py-28">
        <div className="wrap">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-[clamp(32px,3.6vw,50px)]">{t('format.title')}</h2>
            <Link href="/collections/all" className="hidden text-[12px] link-underline sm:block">
              {t('format.viewAll')}
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {formatTiles.map((tile) => (
              <Link key={tile.key} href={`/collections/${tile.handle}`} className="group relative block overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden bg-card">
                  <Image
                    src={tile.image}
                    alt={t(tile.key)}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent p-5 pt-16 text-cream">
                  <p className="font-display text-[22px] leading-tight">{t(tile.key)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-cream/70">{tile.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Winter band */}
      <section className="relative">
        <div className="relative aspect-[16/9] min-h-[420px] w-full overflow-hidden md:aspect-[21/9]">
          <Image src="/img/hero-dog.jpg" alt={t('winter.title1')} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/10 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 flex items-center">
            <div className="wrap">
              <div className="max-w-md text-cream">
                <h2 className="font-display text-[clamp(32px,4.2vw,58px)] leading-[1.05]">
                  {t('winter.title1')}
                  <br />
                  {t('winter.title2')}
                </h2>
                <p className="mt-5 max-w-sm text-[13.5px] leading-[1.7] text-cream/80">{t('winter.body')}</p>
                <div className="mt-8">
                  <Link href="/collections/gifts" className="btn btn-outline border-cream/70 text-cream hover:bg-cream/10">
                    <span className="text-[11px] tracking-[0.16em]">{t('winter.cta')}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-forest py-20 text-cream md:py-24">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-cream/50">{t('reviews.eyebrow')}</p>
              <h2 className="mt-4 max-w-lg font-display text-[clamp(30px,3.4vw,46px)] leading-[1.12]">
                {t('reviews.title')}
              </h2>
            </div>
            <Link href="/collections/all" className="btn btn-outline border-cream/50 text-cream hover:bg-cream/10">
              <span className="text-[10px] tracking-[0.16em]">{t('reviews.shopNow')}</span>
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <figure key={r.name} className="flex flex-col justify-between bg-bone p-6 text-ink">
                <blockquote className="font-display text-[17px] leading-[1.45]">“{r.quote}”</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <div className="flex gap-0.5 text-tan">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <IconStar key={i} className="h-3 w-3" />
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.1em]">— {r.name}</p>
                  <p className="mt-1 text-[12px] text-muted">{r.product}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="border-y border-line bg-bone py-14">
        <div className="wrap">
          <p className="eyebrow text-center text-muted">{t('press.title')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {press.map((p) => (
              <span key={p} className="font-display text-[clamp(16px,1.5vw,22px)] text-ink/45">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz */}
      <section id="quiz" className="bg-bone pb-20 pt-16 md:pb-24">
        <div className="wrap grid items-center gap-10 md:grid-cols-[1fr_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden bg-card">
            <Image src="/img/life-walk.jpg" alt={t('quiz.title1')} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow text-muted">{t('quiz.eyebrow')}</p>
            <h2 className="mt-4 font-display text-[clamp(30px,3.4vw,46px)] leading-[1.1]">
              {t('quiz.title1')}
              <br />
              {t('quiz.title2')}
            </h2>
            <p className="mt-5 max-w-md text-[13.5px] leading-[1.7] text-ink-soft">{t('quiz.body')}</p>
            <Link href="/collections/all" className="btn btn-solid mt-8 text-white">
              <span>{t('quiz.cta')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Journal strip */}
      <section id="journal" className="bg-white py-16">
        <div className="wrap">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-[clamp(26px,2.6vw,36px)]">{t('journal.title')}</h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{t('journal.handle')}</span>
          </div>
          <div className="no-bar mt-8 flex gap-3 overflow-x-auto">
            {[
              '/img/hero-cat.jpg',
              '/img/life-walk.jpg',
              '/img/hero-dog.jpg',
              '/img/life-sofa.jpg',
              '/img/life-gate.jpg',
              '/img/detail-closeup.jpg',
            ].map((src) => (
              <div key={src} className="relative aspect-square w-[46%] shrink-0 overflow-hidden bg-card sm:w-[30%] lg:w-[16.4%]">
                <Image src={src} alt={t('journal.title')} fill sizes="(max-width: 768px) 46vw, 17vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
