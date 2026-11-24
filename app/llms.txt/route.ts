import { getGeo } from '@/lib/storefront/geo';
import { getContent, visibleNav } from '@/lib/storefront/content';
import { commerce } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [geo, content, products] = await Promise.all([
    getGeo(),
    getContent(),
    commerce.listProducts(),
  ]);

  const base = geo.canonicalBase.replace(/\/$/, '');
  const nav = visibleNav(content);

  const lines: string[] = [
    `# ${geo.brandName}`,
    '',
    `> ${geo.shortDescription}`,
    '',
    geo.longDescription,
    '',
    '## 关键事实',
    ...geo.facts.map((f) => `- ${f.label}：${f.value}`),
    '',
    '## 主要栏目',
    ...nav.map((g) => `- [${g.label}](${base}${g.href})`),
    '',
    '## 在售商品',
    ...products.map(
      (p) => `- [${p.title}](${base}/products/${p.handle})：${p.subtitle}，${p.notes}，起价 $${p.price}`,
    ),
    '',
    '## 常见问题',
    ...geo.faqs.flatMap((f) => [`### ${f.question}`, f.answer, '']),
    '## 说明',
    `- 站点：${base}`,
    `- 完整版：${base}/llms-full.txt`,
    `- 更新于：${new Date(geo.updatedAt).toISOString().slice(0, 10)}`,
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
