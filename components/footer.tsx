import Link from 'next/link';
import { footerNav } from '@/lib/site';
import { IconArrowRight, IconLeaf } from '@/components/icons';
import { getT } from '@/lib/i18n/server';
import { getSettings } from '@/lib/storefront/settings';

const payments = ['Shop Pay', 'Apple Pay', 'G Pay', 'Amazon Pay', 'VISA', 'Mastercard'];

export async function Footer() {
  const [t, settings] = await Promise.all([getT(), getSettings()]);

  return (
    <footer className="bg-cream text-ink">
      <div className="wrap pt-16">
        <div className="grid gap-10 border-b border-line pb-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-md">
            <p className="eyebrow text-muted">{t('footer.newsletter')}</p>
            <form className="mt-4 flex items-center border-b border-ink/30 pb-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted"
              />
              <button aria-label={t('footer.newsletter')} className="ps-3 text-ink hover:text-tan">
                <IconArrowRight className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">{t('footer.newsletterNote')}</p>
          </div>
          <div className="md:justify-self-end md:text-end">
            <p className="eyebrow text-muted">{t('footer.service')}</p>
            <a href={`mailto:${settings.supportEmail}`} className="mt-3 block text-[13px] link-underline">
              {settings.supportEmail}
            </a>
            <p className="mt-1 text-[12px] text-muted">{settings.supportHours}</p>
          </div>
        </div>

        <div className="grid gap-10 py-14 md:grid-cols-[auto_repeat(4,minmax(0,1fr))]">
          <div className="hidden md:block">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-ink/25">
              <IconLeaf className="h-6 w-6 text-ink/70" />
            </div>
          </div>
          {footerNav.map((col) => (
            <div key={col.titleKey}>
              <h3 className="eyebrow text-muted">{t(col.titleKey)}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label ?? l.key}>
                    <Link href={l.href} className="text-[13px] text-ink-soft hover:text-tan">
                      {l.key ? t(l.key) : l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line py-8">
          <span className="eyebrow me-4 text-muted">{t('footer.secure')}</span>
          {payments.map((p) => (
            <span
              key={p}
              className="border border-line bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-soft"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-4 py-5 text-[11px] text-muted md:flex-row md:items-center md:justify-between">
          <p>{t('footer.rights')}</p>
          <p className="hidden uppercase tracking-[0.28em] md:block">{t('footer.est')}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { key: 'footer.privacy' as const, href: '#' },
              { key: 'footer.terms' as const, href: '#' },
              { key: 'footer.accessibility' as const, href: '#' },
              { key: 'footer.shippingLink' as const, href: '#' },
            ].map((l) => (
              <li key={l.key}>
                <Link href={l.href} className="hover:text-ink">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
