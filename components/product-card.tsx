'use client';

import Image from 'next/image';
import Link from 'next/link';
import { productImages, type Product } from '@/lib/products';
import type { CurrencyCode } from '@/lib/currency';
import { formatMoney } from '@/lib/currency';
import { IconLeaf } from '@/components/icons';
import { useI18n } from '@/lib/i18n/client';

export function ProductCard({ product, currency = 'USD' }: { product: Product; currency?: CurrencyCode }) {
  const { t } = useI18n();

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-card">
        <Image
          src={productImages(product)[0]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover mix-blend-multiply transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute start-4 top-4 flex items-center gap-1.5 text-[9px] uppercase leading-[1.15] tracking-[0.1em] text-ink/70">
            <IconLeaf className="h-4 w-4" />
            <span className="max-w-[52px]">{product.badge}</span>
          </span>
        )}
      </div>
      <div className="pt-4">
        <h3 className="font-display text-[20px] leading-tight">{product.title}</h3>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="text-[12.5px] font-medium text-ink-soft">{product.subtitle}</p>
          <p className="shrink-0 text-[12.5px] text-muted">
            {t('product.from')} {formatMoney(product.price, currency)}
          </p>
        </div>
        <p className="mt-0.5 text-[12.5px] text-muted">{product.notes}</p>
      </div>
    </Link>
  );
}
