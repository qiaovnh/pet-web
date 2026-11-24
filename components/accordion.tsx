'use client';

import { useState } from 'react';
import { IconPlus } from '@/components/icons';

export function Accordion({ items }: { items: { title: string; body: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <div key={item.title}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-6 py-5 text-left"
          >
            <span className="text-[12px] uppercase tracking-[0.12em]">{item.title}</span>
            <IconPlus
              className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
                open === i ? 'rotate-45' : ''
              }`}
            />
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <p className="max-w-xl pb-6 text-[13px] leading-[1.7] text-ink-soft">{item.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
