import type { Metadata } from 'next';
import '@/app/globals.css';
import { CartProvider } from '@/components/cart-provider';
import { CartDrawer } from '@/components/cart-drawer';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { I18nProvider } from '@/lib/i18n/client';
import { dictFor } from '@/lib/i18n/dictionaries';
import { dirFor } from '@/lib/i18n/config';
import { getLocale } from '@/lib/i18n/server';
import { getCurrency } from '@/lib/server/session';
import { getSettings } from '@/lib/storefront/settings';
import { commerce } from '@/lib/storefront';
import { getContent, visibleNav } from '@/lib/storefront/content';
import { getGeo } from '@/lib/storefront/geo';
import { JsonLd, organizationSchema, websiteSchema } from '@/components/seo/jsonld';

export const metadata: Metadata = {
  title: 'INAUE — Tea & Botanicals',
  description:
    'Direct trade, organic teas and botanicals from single gardens. Loose leaf, matcha, and caffeine-free botanicals, selected by hand.',
};

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [locale, currency, settings, recommended, content, geo] = await Promise.all([
    getLocale(),
    getCurrency(),
    getSettings(),
    commerce.listProducts({ limit: 3 }),
    getContent(),
    getGeo(),
  ]);
  const base = geo.canonicalBase.replace(/\/$/, '');
  const dict = dictFor(locale);

  return (
    <html lang={locale} dir={dirFor(locale)}>
      <body>
        <JsonLd
          data={[
            organizationSchema({
              name: geo.brandName,
              url: base,
              description: geo.shortDescription,
              email: settings.supportEmail,
              logo: '/icon.svg',
            }),
            websiteSchema({ name: geo.brandName, url: base, description: geo.shortDescription }),
          ]}
        />
        <I18nProvider locale={locale} dict={dict}>
          <CartProvider>
            <Header
              currency={currency}
              locale={locale}
              announcement={settings.announcement}
              navGroups={visibleNav(content)}
            />
            <main>{children}</main>
            <Footer />
            <CartDrawer recommended={recommended} />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
