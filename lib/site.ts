import type { DictKey } from '@/lib/i18n/dictionaries/en';

export const site = {
  name: 'INAUE',
  tagline: 'Pet GPS Trackers',
};

export type NavItem = { key?: DictKey; label?: string; href: string };
export type NavGroup = { key: DictKey; href: string; items: NavItem[] };

export const nav: NavGroup[] = [
  {
    key: 'nav.shop',
    href: '/collections/all',
    items: [
      { key: 'nav.looseLeaf', href: '/collections/dogs' },
      { key: 'nav.matchaPowders', href: '/collections/cats' },
      { key: 'nav.sachets', href: '/collections/accessories' },
      { key: 'nav.giftsTeaware', href: '/collections/bundles' },
      { key: 'nav.shopAll', href: '/collections/all' },
    ],
  },
  {
    key: 'nav.discover',
    href: '/#story',
    items: [
      { key: 'nav.ourStory', href: '/#how' },
      { key: 'nav.directTrade', href: '/#story' },
      { key: 'nav.brewingGuides', href: '/#setup' },
      { key: 'nav.journal', href: '/#journal' },
    ],
  },
  { key: 'nav.quiz', href: '/#plans', items: [] },
  { key: 'nav.holiday', href: '/#support', items: [] },
];

export const footerNav: { titleKey: DictKey; links: NavItem[] }[] = [
  {
    titleKey: 'footer.shop',
    links: [
      { key: 'nav.looseLeaf', href: '/collections/dogs' },
      { key: 'nav.matchaPowders', href: '/collections/cats' },
      { key: 'nav.sachets', href: '/collections/accessories' },
      { key: 'nav.giftsTeaware', href: '/collections/bundles' },
      { key: 'nav.shopAll', href: '/collections/all' },
    ],
  },
  {
    titleKey: 'footer.discover',
    links: [
      { key: 'nav.ourStory', href: '/#how' },
      { key: 'nav.directTrade', href: '/#story' },
      { key: 'nav.journal', href: '/#journal' },
      { key: 'nav.brewingGuides', href: '/#setup' },
    ],
  },
  {
    titleKey: 'footer.support',
    links: [
      { key: 'footer.trackOrder', href: '#' },
      { key: 'footer.shippingReturns', href: '#' },
      { key: 'footer.faq', href: '#' },
      { key: 'footer.contact', href: '#' },
    ],
  },
  {
    titleKey: 'footer.social',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'TikTok', href: '#' },
      { label: 'YouTube', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
];

export const press = ['GQ', 'People', 'PC Mag', 'WIRED', 'The Verge', 'TechCrunch'];

export const reviews = [
  {
    quote:
      'Our beagle got out through a gate we did not know was open. We had him back in nine minutes because the alert hit my phone first.',
    name: 'Marta',
    product: 'DOG 6 Tracker',
    rating: 5,
  },
  {
    quote:
      'The cat tracker is light enough that she stopped noticing it after two days. Battery still shows 68% after a week.',
    name: 'Jonas',
    product: 'CAT 6 Mini',
    rating: 5,
  },
  {
    quote:
      'We moved house and the safe zone was the first thing I set up. It just works, even in the countryside where our old tracker gave up.',
    name: 'Priya',
    product: 'DOG 6 XL',
    rating: 5,
  },
  {
    quote:
      'The sleep and scratching charts caught a skin problem weeks before we would have. The vet asked where the data came from.',
    name: 'Aidan',
    product: 'DOG 6 Pro',
    rating: 5,
  },
];

export const benefits: { titleKey: DictKey; bodyKey: DictKey; image: string }[] = [
  { titleKey: 'benefits.organic.title', bodyKey: 'benefits.organic.body', image: '/img/life-walk.jpg' },
  { titleKey: 'benefits.direct.title', bodyKey: 'benefits.direct.body', image: '/img/life-gate.jpg' },
  { titleKey: 'benefits.ingredients.title', bodyKey: 'benefits.ingredients.body', image: '/img/life-sofa.jpg' },
];

export const exploreTeas: { key: DictKey; handle: string; quote: string }[] = [
  {
    key: 'explore.black',
    handle: 'dogs',
    quote:
      'Under 15 kg, slips out of the garden the moment you look away. The compact tracker sits flat on a collar and adds almost nothing to the weight.',
  },
  {
    key: 'explore.botanical',
    handle: 'dogs',
    quote:
      'Over 25 kg and full of momentum. A wider housing, a stronger clip and a GPS antenna that holds on the far side of the hill.',
  },
  {
    key: 'explore.chai',
    handle: 'cats',
    quote:
      'Cats go further than you think. A tracker light enough that a cat forgets it, with a breakaway clip so nothing snags on a fence.',
  },
  {
    key: 'explore.green',
    handle: 'dogs',
    quote:
      'A puppy exploring the edge of the garden for the first time. Safe zones plus an alert the second they cross the line.',
  },
  {
    key: 'explore.matcha',
    handle: 'dogs',
    quote:
      'Older pets wander less, but sleep and activity patterns matter more. Health insights that make a small change obvious.',
  },
  {
    key: 'explore.oolong',
    handle: 'cats',
    quote:
      'Indoor cats still find the one open window. Escape alerts and a seven-day battery mean you hear about it early.',
  },
  {
    key: 'explore.puer',
    handle: 'dogs',
    quote:
      'Working dogs cover real ground. Longer battery, wider coverage and a housing that survives mud, water and a working day.',
  },
  {
    key: 'explore.white',
    handle: 'bundles',
    quote:
      'Two dogs, one cat, one app. Every tracker under a single account, with a shared map and per-pet profiles.',
  },
];
