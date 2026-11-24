import { readJson, writeJson } from '@/lib/storefront/db';
import type { DictKey } from '@/lib/i18n/dictionaries/en';

export type BannerPlacement = 'home-hero' | 'home-promo';

export type Banner = {
  id: string;
  placement: BannerPlacement;
  /** 不使用语言包，直接展示的文案 */
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  theme: 'forest' | 'ink' | 'cream';
  active: boolean;
  order: number;
};

export type NavLink = {
  id: string;
  label: string;
  /** 有 labelKey 时优先用语言包，便于内置项跟随多语言 */
  labelKey?: DictKey;
  href: string;
  visible: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  labelKey?: DictKey;
  href: string;
  visible: boolean;
  order: number;
  children: NavLink[];
};

export type Content = {
  banners: Banner[];
  nav: NavGroup[];
};

const FILE = 'content.json';

export const DEFAULT_CONTENT: Content = {
  banners: [
    {
      id: 'banner-hero',
      placement: 'home-hero',
      title: 'Never Lose Them Again',
      subtitle:
        'Live GPS, escape alerts and health insights for dogs and cats — in a tracker light enough to forget.',
      ctaLabel: 'Shop Dog Trackers',
      ctaHref: '/collections/dogs',
      image: '/img/hero-wide.jpg',
      theme: 'forest',
      active: true,
      order: 0,
    },
    {
      id: 'banner-promo',
      placement: 'home-promo',
      title: 'Know Their Day, Not Just Their Location',
      subtitle:
        'Sleep quality, daily activity and scratching patterns, tracked automatically and summarised in the app. Spot a change early, bring it to your vet.',
      ctaLabel: 'Explore Health',
      ctaHref: '/collections/dogs',
      image: '/img/life-sofa.jpg',
      theme: 'ink',
      active: true,
      order: 0,
    },
  ],
  nav: [
    {
      id: 'nav-shop',
      label: 'Shop',
      labelKey: 'nav.shop',
      href: '/collections/all',
      visible: true,
      order: 0,
      children: [
        { id: 'nav-shop-1', label: 'Dog Trackers', labelKey: 'nav.looseLeaf', href: '/collections/dogs', visible: true },
        { id: 'nav-shop-2', label: 'Cat Trackers', labelKey: 'nav.matchaPowders', href: '/collections/cats', visible: true },
        { id: 'nav-shop-3', label: 'Accessories', labelKey: 'nav.sachets', href: '/collections/accessories', visible: true },
        { id: 'nav-shop-4', label: 'Bundles', labelKey: 'nav.giftsTeaware', href: '/collections/bundles', visible: true },
        { id: 'nav-shop-5', label: 'Shop All', labelKey: 'nav.shopAll', href: '/collections/all', visible: true },
      ],
    },
    {
      id: 'nav-explore',
      label: 'Explore',
      labelKey: 'nav.discover',
      href: '/#how',
      visible: true,
      order: 1,
      children: [
        { id: 'nav-explore-1', label: 'How It Works', labelKey: 'nav.ourStory', href: '/#how', visible: true },
        { id: 'nav-explore-2', label: 'Setup Guide', labelKey: 'nav.brewingGuides', href: '/#setup', visible: true },
        { id: 'nav-explore-3', label: 'Journal', labelKey: 'nav.journal', href: '/#journal', visible: true },
      ],
    },
    {
      id: 'nav-plans',
      label: 'Plans',
      labelKey: 'nav.quiz',
      href: '/#plans',
      visible: true,
      order: 2,
      children: [],
    },
    {
      id: 'nav-support',
      label: 'Support',
      labelKey: 'nav.holiday',
      href: '/#support',
      visible: true,
      order: 3,
      children: [],
    },
  ],
};

export async function getContent(): Promise<Content> {
  const stored = await readJson<Partial<Content> | null>(FILE, null);
  if (!stored || !Array.isArray(stored.banners) || !Array.isArray(stored.nav)) {
    await writeJson(FILE, DEFAULT_CONTENT);
    return DEFAULT_CONTENT;
  }
  return { banners: stored.banners, nav: stored.nav };
}

export async function saveContent(content: Content): Promise<Content> {
  const next: Content = {
    banners: [...content.banners].sort((a, b) => a.order - b.order),
    nav: [...content.nav].sort((a, b) => a.order - b.order),
  };
  await writeJson(FILE, next);
  return next;
}

export function bannerFor(content: Content, placement: BannerPlacement): Banner | null {
  return (
    content.banners
      .filter((b) => b.placement === placement && b.active)
      .sort((a, b) => a.order - b.order)[0] ?? null
  );
}

export function visibleNav(content: Content): NavGroup[] {
  return content.nav
    .filter((g) => g.visible)
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ ...g, children: g.children.filter((c) => c.visible) }));
}

export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
