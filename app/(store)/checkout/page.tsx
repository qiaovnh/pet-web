import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentCart } from '@/lib/server/session';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { getT } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Checkout — INAUE Tea & Botanicals' };

export default async function CheckoutPage() {
  const [{ cart }, t] = await Promise.all([currentCart(), getT()]);
  if (!cart || cart.lines.length === 0) redirect('/collections/all');

  return (
    <section className="bg-bone pb-24 pt-10">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
              <Link href="/collections/all" className="hover:text-ink">{t('nav.shop')}</Link>
              <span className="px-2">/</span>
              <span className="text-ink">{t('checkout.title')}</span>
            </p>
            <h1 className="mt-3 font-display text-[clamp(36px,4.2vw,56px)] leading-none">{t('checkout.title')}</h1>
          </div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
            {t('checkout.items', { count: cart.itemCount })} · {cart.subtotalText}
          </p>
        </div>

        <div className="mt-10">
          <CheckoutForm cart={cart} />
        </div>
      </div>
    </section>
  );
}
