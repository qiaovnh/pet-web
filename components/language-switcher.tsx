'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LOCALES, type Locale } from '@/lib/i18n/config';

export function LanguageSwitcher({
  current,
  className = '',
  variant = 'bar',
}: {
  current: Locale;
  className?: string;
  variant?: 'bar' | 'menu';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Locale>(current);

  const change = async (next: Locale) => {
    setValue(next);
    setOpen(false);
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  };

  const active = LOCALES.find((l) => l.code === value) ?? LOCALES[0];

  if (variant === 'menu') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => change(l.code)}
            className={`border px-3 py-2.5 text-left text-[12px] transition-colors ${
              l.code === value ? 'border-ink bg-ink text-cream' : 'border-line hover:border-ink'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] hover:text-tan"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
        </svg>
        {active.short}
        <svg viewBox="0 0 10 6" className="h-[5px] w-[9px] fill-none stroke-current stroke-[1.2]">
          <path d="m1 1 4 4 4-4" />
        </svg>
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 top-full z-50 mt-3 w-44 border border-line bg-white py-1 shadow-[0_18px_40px_rgba(40,54,69,0.12)]"
          >
            {LOCALES.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => change(l.code)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[12px] transition-colors hover:bg-cream ${
                    l.code === value ? 'text-ink' : 'text-ink-soft'
                  }`}
                >
                  <span>{l.label}</span>
                  {l.code === value && <span className="text-tan">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
