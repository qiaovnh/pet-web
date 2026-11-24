'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useCart } from '@/components/cart-provider';
import { formatMoney, type CurrencyCode } from '@/lib/currency';
import type { CartView } from '@/lib/storefront/types';
import { useI18n } from '@/lib/i18n/client';

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia'];


export function CheckoutForm({ cart }: { cart: CartView }) {
  const router = useRouter();
  const { refresh } = useCart();
  const currency = cart.currency as CurrencyCode;
  const { t } = useI18n();

  const [form, setForm] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
    shippingMethod: 'standard' as 'standard' | 'express',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(() => {
    const subtotal = cart.subtotal;
    const freeEligible = subtotal >= 75;
    const shipping =
      form.shippingMethod === 'express' ? 18 : freeEligible ? 0 : 8;
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;
    return { subtotal, shipping, tax, total, freeEligible };
  }, [cart.subtotal, form.shippingMethod]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const found: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) found.push('email');
    for (const field of ['name', 'address', 'city', 'postalCode'] as const) {
      if (!form[field].trim()) found.push(field);
    }
    return found;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { ok: boolean; orderId?: string; error?: string };
      if (!json.ok || !json.orderId) {
        setErrors([json.error ?? 'CHECKOUT_FAILED']);
        setSubmitting(false);
        return;
      }
      await refresh();
      router.push(`/checkout/success?order=${json.orderId}`);
    } catch {
      setErrors(['NETWORK_ERROR']);
      setSubmitting(false);
    }
  };

  const field = (key: string) => (errors.includes(key) ? 'border-tan bg-tan/5' : 'border-line');

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
        <section>
          <h2 className="font-display text-[26px]">{t('checkout.contact')}</h2>
          <div className="mt-5">
            <label className="eyebrow text-muted" htmlFor="email">{t('checkout.email')}</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              className={`mt-2 w-full border bg-white px-4 py-3 text-[13px] outline-none focus:border-ink ${field('email')}`}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-[26px]">{t('checkout.shippingAddress')}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="eyebrow text-muted" htmlFor="name">{t('checkout.name')}</label>
              <input
                id="name"
                value={form.name}
                onChange={set('name')}
                className={`mt-2 w-full border bg-white px-4 py-3 text-[13px] outline-none focus:border-ink ${field('name')}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="eyebrow text-muted" htmlFor="address">{t('checkout.address')}</label>
              <input
                id="address"
                value={form.address}
                onChange={set('address')}
                className={`mt-2 w-full border bg-white px-4 py-3 text-[13px] outline-none focus:border-ink ${field('address')}`}
              />
            </div>
            <div>
              <label className="eyebrow text-muted" htmlFor="city">{t('checkout.city')}</label>
              <input
                id="city"
                value={form.city}
                onChange={set('city')}
                className={`mt-2 w-full border bg-white px-4 py-3 text-[13px] outline-none focus:border-ink ${field('city')}`}
              />
            </div>
            <div>
              <label className="eyebrow text-muted" htmlFor="postalCode">{t('checkout.postal')}</label>
              <input
                id="postalCode"
                value={form.postalCode}
                onChange={set('postalCode')}
                className={`mt-2 w-full border bg-white px-4 py-3 text-[13px] outline-none focus:border-ink ${field('postalCode')}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="eyebrow text-muted" htmlFor="country">{t('checkout.country')}</label>
              <select
                id="country"
                value={form.country}
                onChange={set('country')}
                className="mt-2 w-full border border-line bg-white px-4 py-3 text-[13px] outline-none focus:border-ink"
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-[26px]">{t('checkout.shippingMethod')}</h2>
          <div className="mt-5 space-y-2">
            {(['standard', 'express'] as const).map((key) => {
              const cost = key === 'express' ? 18 : totals.freeEligible ? 0 : 8;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setForm((prev) => ({ ...prev, shippingMethod: key }))}
                  className={`flex w-full items-center justify-between border px-4 py-3.5 text-left text-[13px] transition-colors ${
                    form.shippingMethod === key ? 'border-ink bg-white' : 'border-line hover:border-ink/40'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${form.shippingMethod === key ? 'border-ink' : 'border-ink/30'}`}>
                      {form.shippingMethod === key && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
                    </span>
                    {t(key === 'express' ? 'checkout.express' : 'checkout.standard')}
                  </span>
                  <span className="text-muted">{cost === 0 ? t('checkout.free') : formatMoney(cost, currency)}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10 border border-line bg-cream/60 p-6">
          <h2 className="eyebrow text-muted">{t('checkout.payment')}</h2>
          <p className="mt-3 text-[13px] leading-[1.65] text-ink-soft">{t('checkout.paymentNote')}</p>
        </section>

        {errors.length > 0 && (
          <p className="mt-6 border border-tan bg-tan/10 px-4 py-3 text-[12px] text-tan-deep">
            {t('checkout.errors', { fields: errors.join(', ') })}
          </p>
        )}
      </div>

      <aside className="lg:sticky lg:top-[110px] lg:self-start">
        <div className="border border-line bg-white p-6">
          <h2 className="font-display text-[22px]">{t('checkout.summary')}</h2>
          <ul className="mt-5 divide-y divide-line">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex gap-4 py-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-card">
                  <Image src={l.image} alt={l.title} fill sizes="64px" className="object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium leading-tight">{l.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted">{l.variantTitle}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted">Qty {l.qty}</p>
                </div>
                <span className="text-[12.5px]">{l.lineTotalText}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-line pt-5 text-[12.5px]">
            <div className="flex justify-between">
              <dt className="text-muted">{t('checkout.subtotal')}</dt>
              <dd>{formatMoney(totals.subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('checkout.shipping')}</dt>
              <dd>{totals.shipping === 0 ? 'Free' : formatMoney(totals.shipping, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('checkout.tax')}</dt>
              <dd>{formatMoney(totals.tax, currency)}</dd>
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-[11px] uppercase tracking-[0.12em]">{t('checkout.total')}</dt>
              <dd className="font-display text-[22px]">{formatMoney(totals.total, currency)}</dd>
            </div>
          </dl>

          <button type="submit" disabled={submitting} className="btn btn-solid mt-6 w-full text-white disabled:opacity-60">
            <span>{submitting ? t('checkout.placing') : t('checkout.place')}</span>
          </button>
          <p className="mt-3 text-center text-[10.5px] uppercase tracking-[0.1em] text-muted">
            {t('checkout.allPrices', { currency })}
          </p>
        </div>
      </aside>
    </form>
  );
}
