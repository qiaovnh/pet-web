'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CURRENCY_LIST, CURRENCIES, type CurrencyCode } from '@/lib/currency';

export function CurrencySwitcher({
  current,
  className = '',
}: {
  current: CurrencyCode;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<CurrencyCode>(current);

  const change = async (next: CurrencyCode) => {
    setValue(next);
    await fetch('/api/currency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: next }),
    });
    startTransition(() => router.refresh());
  };

  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">Currency</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => change(e.target.value as CurrencyCode)}
        className="cursor-pointer appearance-none bg-transparent text-[10px] uppercase tracking-[0.12em] outline-none"
      >
        {CURRENCY_LIST.map((code) => (
          <option key={code} value={code}>
            {CURRENCIES[code].symbol} {code}
          </option>
        ))}
      </select>
    </label>
  );
}
