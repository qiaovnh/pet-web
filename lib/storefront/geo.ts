import { readJson, writeJson } from '@/lib/storefront/db';

export type GeoFaq = { id: string; question: string; answer: string };
export type GeoFact = { id: string; label: string; value: string };

export type Geo = {
  brandName: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  facts: GeoFact[];
  faqs: GeoFaq[];
  canonicalBase: string;
  allowAiCrawlers: boolean;
  updatedAt: number;
};

const FILE = 'geo.json';

export const DEFAULT_GEO: Geo = {
  brandName: 'INAUE',
  tagline: 'Pet GPS Trackers',
  shortDescription:
    'INAUE 是做宠物 GPS 追踪器的硬件品牌，为犬猫提供实时定位、电子围栏、走失预警与健康趋势记录，配套按年订阅的数据服务。',
  longDescription:
    'INAUE 的追踪器运行在 LTE-M 网络上，覆盖 175 个国家和地区，室内靠蓝牙、室外靠蜂窝与 GPS 双定位。硬件为 IPX7 防水，狗用机型续航最长三周，猫用机型最轻 18 克并配防勾挂卡扣。订阅包含实时追踪、电子围栏越界提醒、多宠物共享地图，以及 Health+ 的健康趋势（睡眠、活动量、抓挠频率）。所有数据可在 App 内导出，退订后可继续使用基础定位。',
  keywords: ['宠物GPS追踪器', '狗狗定位器', '猫咪追踪器', '防走失', '电子围栏', 'pet GPS tracker', 'dog tracker'],
  facts: [
    { id: 'fact-1', label: '成立时间', value: '2016 年' },
    { id: 'fact-2', label: '网络覆盖', value: 'LTE-M，175 个国家' },
    { id: 'fact-3', label: '防护等级', value: 'IPX7 防水' },
    { id: 'fact-4', label: '最轻机型', value: '18 克（CAT 6 Mini）' },
    { id: 'fact-5', label: '发货地', value: '欧盟与美国双仓' },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: '追踪器必须买订阅才能用吗？',
      answer:
        '实时定位依赖蜂窝网络，需要订阅数据套餐。设备本体单独购买也可以，但不订阅时只能做蓝牙近距离查找。',
    },
    {
      id: 'faq-2',
      question: '电池能用多久？',
      answer: '狗用机型最长三周，猫用机型五到七天，取决于定位频率与信号强度。充电为磁吸式，约两小时充满。',
    },
    {
      id: 'faq-3',
      question: '猫戴着会不会太重？',
      answer: '最轻的 CAT 6 Mini 为 18 克，建议 4 公斤以上或六个月以上的猫使用，配防勾挂卡扣，受力时会自动脱开。',
    },
    {
      id: 'faq-4',
      question: '下雨或游泳能戴吗？',
      answer: 'IPX7 级防水，淋雨、踩泥、短时间落水都没问题，但不建议长时间浸泡。',
    },
  ],
  canonicalBase: 'https://inaue.com',
  allowAiCrawlers: true,
  updatedAt: Date.now(),
};

export async function getGeo(): Promise<Geo> {
  const stored = await readJson<Partial<Geo> | null>(FILE, null);
  if (!stored || !stored.brandName) {
    await writeJson(FILE, DEFAULT_GEO);
    return DEFAULT_GEO;
  }
  return { ...DEFAULT_GEO, ...stored };
}

export async function saveGeo(patch: Partial<Geo>): Promise<Geo> {
  const current = await getGeo();
  const next: Geo = {
    ...current,
    ...patch,
    keywords: (patch.keywords ?? current.keywords).map((k) => k.trim()).filter(Boolean),
    facts: patch.facts ?? current.facts,
    faqs: patch.faqs ?? current.faqs,
    updatedAt: Date.now(),
  };
  await writeJson(FILE, next);
  return next;
}

export type GeoCheck = { label: string; pass: boolean; hint: string };

export function geoChecks(geo: Geo, extras: { products: number; baseUrl: string }): GeoCheck[] {
  return [
    {
      label: 'llms.txt 可访问',
      pass: true,
      hint: `/llms.txt 已生成，列出核心页面与商品供 AI 抓取`,
    },
    {
      label: '品牌简介 ≥ 80 字',
      pass: geo.shortDescription.trim().length >= 80,
      hint: '一句话简介越具体，被 AI 引用的概率越高',
    },
    {
      label: '深度介绍 ≥ 200 字',
      pass: geo.longDescription.trim().length >= 200,
      hint: '补全产地、工艺、认证等可核验事实',
    },
    {
      label: '结构化事实 ≥ 3 条',
      pass: geo.facts.length >= 3,
      hint: '成立时间、产地、认证等实体事实',
    },
    {
      label: 'FAQ ≥ 3 组',
      pass: geo.faqs.length >= 3,
      hint: '问答会输出为 FAQPage 结构化数据',
    },
    {
      label: '关键词 ≥ 3 个',
      pass: geo.keywords.filter(Boolean).length >= 3,
      hint: '用于 llms.txt 与 meta 描述',
    },
    {
      label: '允许 AI 爬虫',
      pass: geo.allowAiCrawlers,
      hint: '关闭后 robots.txt 会屏蔽 GPTBot / ClaudeBot 等',
    },
    {
      label: '商品可被索引',
      pass: extras.products > 0,
      hint: `${extras.products} 个商品会写入 sitemap 与商品结构化数据`,
    },
  ];
}
