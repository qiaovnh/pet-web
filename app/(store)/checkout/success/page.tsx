import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrder } from '@/lib/orders';
import { formatMoney, type CurrencyCode } from '@/lib/currency';
import { getT } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order confirmed — INAUE Tea & Botanicals' };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const [order, t] = await Promise.all([orderId ? getOrder(orderId) : null, getT()]);
  if (!order) redirect('/collections/all');

  const currency = order.currency as CurrencyCode;
  const placed = new Date(order.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className="bg-bone pb-24 pt-14">
      <div className="wrap max-w-4xl">
        <p className="eyebrow text-tan-deep">{t('success.eyebrow')}</p>
        <h1 className="mt-4 font-display text-[clamp(40px,5vw,64px)] leading-none">
          {t('success.thanks', { name: order.name.split(' ')[0] })}
        </h1>
        <p className="mt-4 max-w-lg text-[13.5px] leading-[1.7] text-ink-soft">
          {t('success.body', { id: order.id, date: placed, email: order.email })}
        </p>

        <div className="mt-10 border border-line bg-white">
          <div className="border-b border-line px-6 py-5">
            <h2 className="font-display text-[22px]">{t('success.yourTea')}</h2>
          </div>
          <ul className="divide-y divide-line px-6">
            {order.lines.map((l) => (
              <li key={l.id} className="flex items-center gap-4 py-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-card">
                  <Image src={l.image} alt={l.title} fill sizes="64px" className="object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${l.handle}`} className="text-[13.5px] font-medium hover:text-tan">
                    {l.title}
                  </Link>
                  <p className="mt-0.5 text-[11.5px] text-muted">{l.variantTitle} · Qty {l.qty}</p>
                </div>
                <span className="text-[13px]">{formatMoney(l.lineTotal, currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line px-6 py-5 text-[12.5px]">
            <div className="flex justify-between">
              <dt className="text-muted">{t('checkout.subtotal')}</dt>
              <dd>{formatMoney(order.subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('checkout.shipping')} ({order.shippingMethod})</dt>
              <dd>{order.shipping === 0 ? 'Free' : formatMoney(order.shipping, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('checkout.tax')}</dt>
              <dd>{formatMoney(order.tax, currency)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-[11px] uppercase tracking-[0.12em]">{t('checkout.total')}</dt>
              <dd className="font-display text-[22px]">{formatMoney(order.total, currency)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow text-muted">{t('success.shippingTo')}</h3>
            <p className="mt-3 text-[13px] leading-[1.7] text-ink-soft">
              {order.name}
              <br />
              {order.address}
              <br />
              {order.city} {order.postalCode}
              <br />
              {order.country}
            </p>
          </div>
          <div>
            <h3 className="eyebrow text-muted">{t('success.next')}</h3>
            <p className="mt-3 text-[13px] leading-[1.7] text-ink-soft">{t('success.nextBody')}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/collections/all" className="btn btn-solid text-white">
            <span>{t('success.continue')}</span>
          </Link>
          <Link href="/" className="btn btn-outline border-ink/40 text-ink hover:bg-ink hover:text-cream">
            <span className="text-[11px] tracking-[0.16em]">{t('success.back')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
