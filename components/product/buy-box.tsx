'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart-provider';
import { IconMinus, IconPlus } from '@/components/icons';
import { formatMoney, type CurrencyCode } from '@/lib/currency';
import type { Product } from '@/lib/products';
import { useI18n } from '@/lib/i18n/client';

export function BuyBox({ product, currency = 'USD' }: { product: Product; currency?: CurrencyCode }) {
  const { add, loading } = useCart();
  const { t } = useI18n();
  const [sizeIndex, setSizeIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [plan, setPlan] = useState<'once' | 'subscribe'>('once');

  const size = product.sizes[sizeIndex];
  const price = plan === 'subscribe' ? Math.round(size.price * 0.9 * 100) / 100 : size.price;
  const total = Math.round(price * qty * 100) / 100;

  return (
    <div>
      <div className="border-t border-line pt-6">
        <p className="eyebrow text-muted">{t('pdp.size')}</p>
        <div className="mt-4 space-y-2">
          {product.sizes.map((s, i) => (
            <label
              key={s.label}
              className={`flex cursor-pointer items-center justify-between border px-4 py-3.5 text-[13px] transition-colors ${
                i === sizeIndex ? 'border-ink bg-white' : 'border-line hover:border-ink/40'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${i === sizeIndex ? 'border-ink' : 'border-ink/30'}`}>
                  {i === sizeIndex && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
                </span>
                {s.label}
              </span>
              <span className="text-muted">{formatMoney(s.price, currency)}</span>
              <input
                type="radio"
                name="size"
                className="sr-only"
                checked={i === sizeIndex}
                onChange={() => setSizeIndex(i)}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <p className="eyebrow text-muted">{t('pdp.frequency')}</p>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => setPlan('once')}
            className={`flex w-full items-center gap-3 border px-4 py-3.5 text-left text-[13px] transition-colors ${
              plan === 'once' ? 'border-ink bg-white' : 'border-line hover:border-ink/40'
            }`}
          >
            <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${plan === 'once' ? 'border-ink' : 'border-ink/30'}`}>
              {plan === 'once' && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
            </span>
            {t('pdp.once')}
          </button>
          <button
            onClick={() => setPlan('subscribe')}
            className={`w-full border px-4 py-3.5 text-left transition-colors ${
              plan === 'subscribe' ? 'border-ink bg-white' : 'border-line hover:border-ink/40'
            }`}
          >
            <span className="flex items-center gap-3 text-[13px]">
              <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${plan === 'subscribe' ? 'border-ink' : 'border-ink/30'}`}>
                {plan === 'subscribe' && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
              </span>
              {t('pdp.subscribe')}
            </span>
            <span className="mt-2 block ps-6 text-[11.5px] leading-relaxed text-muted">{t('pdp.subscribeBody')}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-3 border-t border-line pt-6">
        <div className="flex items-center border border-line">
          <button
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-[52px] w-11 place-items-center hover:text-tan"
          >
            <IconMinus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-[13px]">{qty}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="grid h-[52px] w-11 place-items-center hover:text-tan"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => add(product.handle, size.label, qty)}
          disabled={loading}
          className="btn btn-solid flex-1 text-white disabled:opacity-60"
        >
          <span>{loading ? t('pdp.adding') : `${t('pdp.addToCart')} — ${formatMoney(total, currency)}`}</span>
        </button>
      </div>

      <p className="mt-4 text-[11.5px] text-muted">
        {t('pdp.ships', { amount: formatMoney(75, currency) })}
      </p>
    </div>
  );
}
