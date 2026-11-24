'use client';

import Image from 'next/image';
import { useState } from 'react';
import { exploreTeas } from '@/lib/site';
import { useI18n } from '@/lib/i18n/client';

export function ExploreTeas() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const item = exploreTeas[active];

  return (
    <section className="bg-ink text-cream">
      <div className="wrap grid gap-12 py-20 md:grid-cols-[0.9fr_1.1fr] md:py-28">
        <div>
          <p className="eyebrow text-cream/50">{t('explore.eyebrow')}</p>
          <ul className="mt-6">
            {exploreTeas.map((tea, i) => (
              <li key={tea.key}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`block text-start font-display text-[clamp(28px,3.2vw,44px)] leading-[1.12] transition-colors duration-300 ${
                    i === active ? 'text-tan' : 'text-cream/85 hover:text-cream'
                  }`}
                >
                  {t(tea.key)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-col justify-between">
          <p className="max-w-xl font-display text-[clamp(24px,2.4vw,34px)] leading-[1.28] text-cream/90">
            {item.quote}
          </p>
          <div className="mt-10 flex justify-end">
            <div className="relative aspect-[4/5] w-[54%] min-w-[220px] overflow-hidden bg-ink-soft">
              <Image
                src="/img/life-walk.jpg"
                alt="A glass cup of brewed tea on stone"
                fill
                sizes="(max-width: 768px) 60vw, 30vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
