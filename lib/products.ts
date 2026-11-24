export type Product = {
  handle: string;
  title: string;
  subtitle: string;
  notes: string;
  price: number;
  image: string;
  images?: string[];
  badge?: string;
  categories: string[];
  sizes: { label: string; price: number }[];
  blurb: string;
  /** 覆盖范围 */
  origin: string;
  /** 适用宠物 */
  caffeine: string;
  /** 包装内容 */
  ingredients: string;
  /** 安装方式 */
  preparation: string;
  story: string;
};

export const products: Product[] = [
  {
    handle: 'dog-6-tracker',
    title: 'DOG 6 Tracker',
    subtitle: 'Live GPS for dogs',
    notes: 'Live GPS | Escape alerts | Health',
    price: 49.99,
    image: '/img/p-dog6.jpg',
    images: ['/img/p-dog6.jpg', '/img/detail-closeup.jpg', '/img/life-walk.jpg'],
    badge: 'Best Seller',
    categories: ['dogs'],
    sizes: [
      { label: 'Device only', price: 49.99 },
      { label: 'Device + 1-year plan', price: 118.99 },
      { label: 'Device + 2-year plan', price: 178.99 },
    ],
    blurb:
      'Real-time GPS, virtual fences and escape alerts in a housing that sits flat on any collar. Battery lasts up to two weeks, and it is IPX7 waterproof.',
    origin: 'LTE-M across 175 countries',
    caffeine: 'Dog',
    ingredients: 'Tracker, magnetic charger, collar clip, quick-start guide',
    preparation: 'Clip on, scan the code, pick a plan — about three minutes',
    story:
      'We built DOG 6 after two years of hearing the same thing: the expensive tracker came off because it was too heavy. This one weighs 35 g.',
  },
  {
    handle: 'cat-6-tracker',
    title: 'CAT 6 Tracker',
    subtitle: 'Lightweight GPS for cats',
    notes: '22 g | Breakaway clip | 7-day battery',
    price: 44.99,
    image: '/img/p-cat6.jpg',
    images: ['/img/p-cat6.jpg', '/img/detail-closeup.jpg', '/img/life-sofa.jpg'],
    badge: 'Best Seller',
    categories: ['cats'],
    sizes: [
      { label: 'Device only', price: 44.99 },
      { label: 'Device + 1-year plan', price: 109.99 },
      { label: 'Device + 2-year plan', price: 164.99 },
    ],
    blurb:
      'Twenty-two grams, with a breakaway clip that opens under load so a cat cannot be caught on a fence. A week of tracking on a single charge.',
    origin: 'LTE-M across 175 countries',
    caffeine: 'Cat',
    ingredients: 'Tracker, magnetic charger, breakaway clip, quick-start guide',
    preparation: 'Clip on, scan the code, pick a plan — about three minutes',
    story:
      'A cat tracker only works if the cat keeps wearing it. So the whole design brief was weight, then everything else.',
  },
  {
    handle: 'dog-6-xl',
    title: 'DOG 6 XL',
    subtitle: 'For large dogs',
    notes: 'Wide housing | 3-week battery | Rugged',
    price: 59.99,
    image: '/img/p-dog6xl.jpg',
    images: ['/img/p-dog6xl.jpg', '/img/detail-closeup.jpg', '/img/life-gate.jpg'],
    categories: ['dogs'],
    sizes: [
      { label: 'Device only', price: 59.99 },
      { label: 'Device + 1-year plan', price: 128.99 },
      { label: 'Device + 2-year plan', price: 188.99 },
    ],
    blurb:
      'A wider body, a stronger clip and a bigger cell for dogs over 25 kg. Up to three weeks between charges, still IPX7.',
    origin: 'LTE-M across 175 countries',
    caffeine: 'Dog',
    ingredients: 'XL tracker, magnetic charger, reinforced clip, guide',
    preparation: 'Clip on, scan the code, pick a plan',
    story:
      'Same electronics as DOG 6, mounted in a housing that survives a dog that treats every hedge like a challenge.',
  },
  {
    handle: 'cat-6-mini',
    title: 'CAT 6 Mini',
    subtitle: 'Our lightest tracker',
    notes: '18 g | 5-day battery | Breakaway',
    price: 39.99,
    image: '/img/p-cat6mini.jpg',
    images: ['/img/p-cat6mini.jpg', '/img/detail-closeup.jpg', '/img/life-sofa.jpg'],
    badge: 'New',
    categories: ['cats'],
    sizes: [
      { label: 'Device only', price: 39.99 },
      { label: 'Device + 1-year plan', price: 104.99 },
      { label: 'Device + 2-year plan', price: 158.99 },
    ],
    blurb:
      'Eighteen grams for cats under 4 kg and kittens from six months. Five days of tracking, same app and same alerts.',
    origin: 'LTE-M across 175 countries',
    caffeine: 'Cat',
    ingredients: 'Mini tracker, charger, breakaway clip, guide',
    preparation: 'Clip on, scan the code, pick a plan',
    story: 'Smaller cell, smaller board, same antenna design. It took three hardware revisions to keep the range.',
  },
  {
    handle: 'dog-6-pro',
    title: 'DOG 6 Pro',
    subtitle: 'Tracker with Health+',
    notes: 'Health insights | Sleep | Scratching',
    price: 69.99,
    image: '/img/p-dog6pro.jpg',
    images: ['/img/p-dog6pro.jpg', '/img/detail-closeup.jpg', '/img/life-walk.jpg'],
    categories: ['dogs', 'bundles'],
    sizes: [
      { label: 'Device only', price: 69.99 },
      { label: 'Device + 1-year plan', price: 138.99 },
      { label: 'Device + 2-year plan', price: 198.99 },
    ],
    blurb:
      'Everything in DOG 6 plus Health+: sleep quality, daily activity and scratching patterns, charted over weeks so a change is visible early.',
    origin: 'LTE-M across 175 countries',
    caffeine: 'Dog',
    ingredients: 'Pro tracker, charger, clip, guide',
    preparation: 'Clip on, scan the code, pick a plan',
    story:
      'The health model was trained with veterinary partners on normal behaviour ranges by breed and age — so "unusual" means something.',
  },
  {
    handle: 'collar-clip-set',
    title: 'Collar Clip Set',
    subtitle: 'Spare clips, two sizes',
    notes: 'Steel spring | 2 pack',
    price: 19.99,
    image: '/img/p-clip.jpg',
    images: ['/img/p-clip.jpg', '/img/p-dog6.jpg', '/img/detail-closeup.jpg'],
    categories: ['accessories'],
    sizes: [{ label: 'Two clips', price: 19.99 }],
    blurb:
      'Two spare collar clips — one standard, one breakaway. Useful if you swap the tracker between a walking harness and a day collar.',
    origin: 'Ships from EU and US warehouses',
    caffeine: 'Dog & Cat',
    ingredients: 'Standard clip, breakaway clip',
    preparation: 'Snap onto any collar up to 25 mm wide',
    story: 'The most-replaced part of any tracker is the clip. So we sell it separately, cheaply.',
  },
  {
    handle: 'magnetic-charger',
    title: 'Magnetic Charger',
    subtitle: 'Spare charging cable',
    notes: 'USB-C | 1.5 m | Magnetic',
    price: 14.99,
    image: '/img/p-charger.jpg',
    images: ['/img/p-charger.jpg', '/img/p-dog6.jpg', '/img/detail-closeup.jpg'],
    categories: ['accessories'],
    sizes: [{ label: 'One charger', price: 14.99 }],
    blurb:
      'A spare magnetic charger, USB-C, 1.5 m. Docks without a port to clog with mud — which is the whole point.',
    origin: 'Ships from EU and US warehouses',
    caffeine: 'Dog & Cat',
    ingredients: 'Magnetic charging cable',
    preparation: 'Plug into any USB-C adapter',
    story: 'No exposed port means nothing to scrape clean at the end of a wet walk.',
  },
  {
    handle: 'trail-bundle',
    title: 'Trail Bundle',
    subtitle: 'Two trackers, one plan',
    notes: '2 trackers | 1 plan | Save $30',
    price: 89.99,
    image: '/img/p-bundle.jpg',
    images: ['/img/p-bundle.jpg', '/img/p-dog6.jpg', '/img/p-cat6.jpg'],
    badge: 'Best Seller',
    categories: ['bundles', 'dogs', 'cats'],
    sizes: [
      { label: 'DOG 6 + CAT 6', price: 89.99 },
      { label: 'DOG 6 + DOG 6', price: 89.99 },
      { label: 'Bundle + 1-year plan', price: 189.99 },
    ],
    blurb:
      'One dog and one cat tracker — or two dogs — under a single account and a single plan. Thirty dollars less than buying them apart.',
    origin: 'LTE-M across 175 countries',
    caffeine: 'Dog & Cat',
    ingredients: 'Two trackers, two chargers, two clips, guides',
    preparation: 'Set up both in the same app session',
    story: 'Most households with one tracker buy a second within a year. This is that second one, priced honestly.',
  },
];

export const collections = [
  {
    handle: 'all',
    title: 'All Trackers',
    intro: 'Every tracker, accessory and bundle we make.',
    image: '/img/p-dog6.jpg',
  },
  {
    handle: 'dogs',
    title: 'Dogs',
    intro: 'Trackers built for dogs from 4 kg to 60 kg, with clips that hold.',
    image: '/img/life-walk.jpg',
  },
  {
    handle: 'cats',
    title: 'Cats',
    intro: 'Light enough that a cat forgets it, with a breakaway clip so nothing snags.',
    image: '/img/life-sofa.jpg',
  },
  {
    handle: 'accessories',
    title: 'Accessories',
    intro: 'Clips, chargers and the parts that get lost.',
    image: '/img/p-clip.jpg',
  },
  {
    handle: 'bundles',
    title: 'Bundles',
    intro: 'Two pets, one account, one plan.',
    image: '/img/p-bundle.jpg',
  },
];

export function getCollection(handle: string) {
  return collections.find((c) => c.handle === handle);
}

export function productsIn(handle: string): Product[] {
  if (handle === 'all') return products;
  return products.filter((p) => p.categories.includes(handle));
}

export function getProduct(handle: string) {
  return products.find((p) => p.handle === handle);
}

/** 图集：没有 images 时回落到单张主图 */
export function productImages(product: Product): string[] {
  return product.images && product.images.length > 0 ? product.images : [product.image];
}
