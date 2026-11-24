'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useCart } from '@/components/cart-provider';
import { IconBag, IconClose, IconMenu, IconSearch, IconUser } from '@/components/icons';
import { CurrencySwitcher } from '@/components/currency-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useI18n } from '@/lib/i18n/client';
import { site } from '@/lib/site';
import type { NavGroup } from '@/lib/storefront/content';
import type { CurrencyCode } from '@/lib/currency';
import type { Locale } from '@/lib/i18n/config';

export function Header({
  currency = 'USD',
  locale = 'en',
  announcement,
  navGroups = [],
}: {
  currency?: CurrencyCode;
  locale?: Locale;
  announcement: string;
  navGroups?: NavGroup[];
}) {
  const { t } = useI18n();
  const { count, open } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const overlay = pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="bg-lime text-ink">
        <div className="wrap flex h-9 items-center justify-center">
          <p className="px-2 text-center text-[9px] uppercase leading-tight tracking-[0.13em] sm:text-[10px] sm:tracking-[0.16em]">
            {announcement}
          </p>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${overlay ? 'bg-transparent' : 'bg-white'} ${
          overlay ? '' : 'shadow-[0_1px_0_rgba(40,54,69,0.10)]'
        }`}
      >
        <div className="wrap grid h-[76px] grid-cols-[1fr_auto_1fr] items-center">
          <nav className="hidden items-center gap-8 lg:flex">
            {navGroups.map((item) => (
              <div key={item.id} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 py-6 text-[11px] font-medium uppercase tracking-[0.13em] transition-colors ${overlay ? 'text-white hover:text-white/80' : 'text-ink hover:text-tan'}`}
                >
                  {item.labelKey ? t(item.labelKey) : item.label}
                  {item.children.length > 0 && (
                    <svg viewBox="0 0 10 6" className="h-[5px] w-[9px] fill-none stroke-current stroke-[1.2]">
                      <path d="m1 1 4 4 4-4" />
                    </svg>
                  )}
                </Link>
                {item.children.length > 0 && (
                  <div className="invisible absolute start-0 top-full z-50 w-56 translate-y-1 border border-line bg-white p-5 opacity-0 shadow-[0_18px_40px_rgba(40,54,69,0.10)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="space-y-3">
                      {item.children.map((sub) => (
                        <li key={sub.id}>
                          <Link href={sub.href} className="text-[12px] text-ink-soft transition-colors hover:text-tan">
                            {sub.labelKey ? t(sub.labelKey) : sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button aria-label={t('common.menu')} onClick={() => setMobileOpen(true)} className="-ms-2 p-2 lg:hidden">
            <IconMenu className="h-5 w-5" />
          </button>

          <Link href="/" aria-label={site.name} className={`justify-self-center ${overlay ? 'text-white' : 'text-ink'}`}>
            <Logo size={26} />
          </Link>

          <div className={`flex items-center justify-end gap-4 ${overlay ? 'text-white' : 'text-ink'}`}>
            <LanguageSwitcher current={locale} className={`hidden sm:inline-flex ${overlay ? 'text-white' : 'text-ink-soft'}`} />
            <CurrencySwitcher current={currency} className={`hidden lg:inline-flex ${overlay ? 'text-white hover:text-white/80' : 'text-ink-soft hover:text-ink'}`} />
            <button aria-label={t('search.title')} onClick={() => setSearchOpen((v) => !v)} className="p-1 hover:text-tan">
              <IconSearch className="h-[19px] w-[19px]" />
            </button>
            <button aria-label="Account" className="hidden p-1 hover:text-tan sm:block">
              <IconUser className="h-[19px] w-[19px]" />
            </button>
            <button aria-label={t('cart.title')} onClick={open} className="relative p-1 hover:text-tan">
              <IconBag className="h-[19px] w-[19px]" />
              {count > 0 && (
                <span className="absolute -end-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t border-line bg-bone transition-[max-height] duration-300 ${
            searchOpen ? 'max-h-40' : 'max-h-0 border-t-0'
          }`}
        >
          <form
            className="wrap flex items-center gap-3 py-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSearchOpen(false);
              router.push(`/search?q=${encodeURIComponent(query)}`);
            }}
          >
            <IconSearch className="h-5 w-5 text-muted" />
            <input
              autoFocus={searchOpen}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full bg-transparent font-display text-[26px] outline-none placeholder:text-muted/60"
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label={t('common.close')}>
              <IconClose className="h-5 w-5 text-muted" />
            </button>
          </form>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[70] overflow-y-auto bg-white transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo size={20} />
          <button onClick={() => setMobileOpen(false)} aria-label={t('common.close')}>
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-5 py-6">
          <ul className="space-y-1">
            {navGroups.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block border-b border-line py-4 font-display text-[26px]"
                >
                  {item.labelKey ? t(item.labelKey) : item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[10px] uppercase tracking-[0.14em] text-muted">{t('common.language')}</p>
          <div className="mt-3">
            <LanguageSwitcher current={locale} variant="menu" />
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-[0.14em] text-muted">{t('common.currency')}</p>
          <div className="mt-3">
            <CurrencySwitcher current={currency} className="text-[12px]" />
          </div>
        </nav>
      </div>
    </>
  );
}
