'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/cart-provider';
import { IconBag, IconClose, IconMinus, IconPlus } from '@/components/icons';
import { formatMoney } from '@/lib/currency';
import { useI18n } from '@/lib/i18n/client';
import { dirFor } from '@/lib/i18n/config';
import type { Product } from '@/lib/products';

export function CartDrawer({ recommended = [] }: { recommended?: Product[] }) {
  const { t, locale } = useI18n();
  const { isOpen, close, lines, subtotalText, cart, remove, setQty, add, loading, error } = useCart();

  const threshold = cart?.freeShippingThreshold ?? 75;
  const remaining = cart?.freeShippingRemaining ?? threshold;
  const remainingText = cart?.freeShippingRemainingText ?? '$75.00';
  const pct = threshold > 0 ? Math.min(100, ((threshold - remaining) / threshold) * 100) : 100;
  const currency = cart?.currency ?? 'USD';

  return (
    <div className={`fixed inset-0 z-[60] ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <button
        aria-label={t('common.close')}
        onClick={close}
        className={`absolute inset-0 bg-ink/25 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        style={{
          transform: isOpen
            ? 'translateX(0)'
            : `translateX(${dirFor(locale) === 'rtl' ? '-100%' : '100%'})`,
        }}
        className="absolute end-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-bone transition-transform duration-400 ease-[cubic-bezier(.22,.61,.36,1)]"
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-[22px]">{t('cart.title')}</h2>
          <button onClick={close} aria-label={t('common.close')} className="p-1 hover:text-tan">
            <IconClose className="h-5 w-5" />
          </button>
        </header>

        <div className="border-b border-line px-6 py-4">
          <p className="text-center text-[12px] text-muted">
            {remaining > 0 ? (
              <>
                {t('cart.awayFrom', { amount: remainingText })}{' '}
                <span className="font-medium text-ink">{t('cart.freeShippingBang')}</span>
              </>
            ) : (
              <span className="font-medium text-forest">{t('cart.shipsFree')}</span>
            )}
          </p>
          <div className="mt-3 h-[2px] w-full bg-line">
            <div className="h-full bg-forest transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.1em] text-muted">
            <span>{t('cart.freeShipping')}</span>
            <span>{t('cart.freeSample')}</span>
          </div>
        </div>

        {error && (
          <p className="border-b border-line bg-tan/10 px-6 py-2 text-[11px] text-tan-deep">
            {t('cart.error')}
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="font-display text-[22px]">{t('cart.empty')}</p>
              <p className="mt-1 text-[13px] text-muted">{t('cart.emptyBody')}</p>
              <Link href="/collections/all" onClick={close} className="btn btn-solid mt-6 w-full text-white">
                <span>{t('cart.shopNow')}</span>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line px-6">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-4 py-5">
                  <Link href={`/products/${l.handle}`} onClick={close} className="relative h-20 w-20 shrink-0 overflow-hidden bg-card">
                    <Image src={l.image} alt={l.title} fill sizes="80px" className="object-cover mix-blend-multiply" />
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between gap-3">
                      <Link href={`/products/${l.handle}`} onClick={close} className="font-display text-[17px] leading-tight">
                        {l.title}
                      </Link>
                      <span className="text-[13px]">{l.lineTotalText}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted">{l.variantTitle}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          aria-label="-"
                          disabled={loading}
                          onClick={() => setQty(l.id, l.qty - 1)}
                          className="grid h-8 w-8 place-items-center hover:text-tan disabled:opacity-40"
                        >
                          <IconMinus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-[12px]">{l.qty}</span>
                        <button
                          aria-label="+"
                          disabled={loading}
                          onClick={() => setQty(l.id, l.qty + 1)}
                          className="grid h-8 w-8 place-items-center hover:text-tan disabled:opacity-40"
                        >
                          <IconPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(l.id)}
                        className="text-[11px] uppercase tracking-[0.1em] text-muted underline underline-offset-4 hover:text-ink"
                      >
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="px-6 pb-8 pt-6">
            <div className="flex items-center gap-6 border-b border-line pb-3 text-[10px] uppercase tracking-[0.12em]">
              <span className="border-b-2 border-ink pb-3 text-ink">{t('cart.recommended')}</span>
              <span className="pb-3 text-muted">{t('cart.recentlyViewed')}</span>
            </div>
            <h3 className="mt-5 font-display text-[20px]">{t('cart.think')}</h3>
            <ul className="mt-2">
              {recommended.map((p) => (
                <li key={p.handle} className="flex items-center gap-3 border-b border-line/70 py-3">
                  <Link href={`/products/${p.handle}`} onClick={close} className="relative h-14 w-14 shrink-0 bg-card">
                    <Image src={p.image} alt={p.title} fill sizes="56px" className="object-cover mix-blend-multiply" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${p.handle}`} onClick={close} className="block truncate text-[13px] font-medium">
                      {p.title}
                    </Link>
                    <p className="truncate text-[11px] text-muted">{p.notes}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{formatMoney(p.price, currency)}</p>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => add(p.handle, p.sizes[0].label, 1)}
                    className="shrink-0 bg-ink px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white hover:bg-forest disabled:opacity-50"
                  >
                    {p.sizes.length > 1 ? t('cart.size') : t('cart.add')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-line bg-bone px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] uppercase tracking-[0.12em]">{t('cart.subtotal')}</span>
              <span className="font-display text-[20px]">{subtotalText}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted">{t('cart.taxes')}</p>
            <Link href="/checkout" onClick={close} className="btn btn-solid mt-4 w-full text-white">
              <IconBag className="h-4 w-4" />
              <span>{t('cart.checkout')} — {subtotalText}</span>
            </Link>
            <button
              onClick={close}
              className="mt-3 w-full text-center text-[11px] uppercase tracking-[0.12em] text-muted underline underline-offset-4"
            >
              {t('cart.continue')}
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
