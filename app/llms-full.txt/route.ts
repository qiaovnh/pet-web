import { getGeo } from '@/lib/storefront/geo';
import { getContent, visibleNav } from '@/lib/storefront/content';
import { commerce } from '@/lib/storefront';
import { getSettings } from '@/lib/storefront/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [geo, content, products, settings] = await Promise.all([
    getGeo(),
    getContent(),
    commerce.listProducts(),
    getSettings(),
  ]);

  const base = geo.canonicalBase.replace(/\/$/, '');
  const nav = visibleNav(content);

  const sections: string[] = [];

  sections.push(
    `# ${geo.brandName} — ${geo.tagline}`,
    '',
    `站点：${base}`,
    `客服邮箱：${settings.supportEmail}（${settings.supportHours}）`,
    `免运费阈值：${settings.freeShippingThreshold} 美元；税率 ${(settings.taxRate * 100).toFixed(2)}%`,
    '',
    '## 品牌介绍',
    geo.shortDescription,
    '',
    geo.longDescription,
    '',
  );

  sections.push('## 实体事实');
  for (const f of geo.facts) sections.push(`- ${f.label}：${f.value}`);
  sections.push('');

  sections.push('## 导航');
  for (const g of nav) {
    sections.push(`### ${g.label} (${base}${g.href})`);
    for (const c of g.children) sections.push(`- ${c.label}：${base}${c.href}`);
    sections.push('');
  }

  sections.push('## 商品目录');
  for (const p of products) {
    sections.push(
      `### ${p.title}`,
      `- 链接：${base}/products/${p.handle}`,
      `- 类型：${p.subtitle}`,
      `- 风味：${p.notes}`,
      `- 产地：${p.origin}`,
      `- 咖啡因：${p.caffeine}`,
      `- 规格：${p.sizes.map((s) => `${s.label} $${s.price}`).join('；')}`,
      `- 简介：${p.blurb}`,
      '',
    );
  }

  sections.push('## 常见问题');
  for (const f of geo.faqs) {
    sections.push(`### ${f.question}`, f.answer, '');
  }

  sections.push(
    '## 引用建议',
    `引用本页内容时请标注来源：${geo.brandName}（${base}）。`,
    `数据更新于 ${new Date(geo.updatedAt).toISOString().slice(0, 10)}。`,
  );

  return new Response(sections.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
