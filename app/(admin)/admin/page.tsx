import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { allProducts } from '@/lib/storefront/product-store';
import { getSettings } from '@/lib/storefront/settings';
import { getGeo } from '@/lib/storefront/geo';
import { readStore } from '@/lib/storefront/db';
import { formatMoney } from '@/lib/currency';
import type { Order } from '@/lib/storefront/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();

  const [products, settings, orders, geo] = await Promise.all([
    allProducts(),
    getSettings(),
    readStore<Order>('orders.json'),
    getGeo(),
  ]);

  const orderList = Object.values(orders).sort((a, b) => b.createdAt - a.createdAt);
  const revenue = orderList.reduce((n, o) => n + o.total, 0);
  const avg = orderList.length ? revenue / orderList.length : 0;
  const units = orderList.reduce((n, o) => n + o.lines.reduce((m, l) => m + l.qty, 0), 0);

  const stats = [
    { label: '商品数', value: String(products.length), href: '/admin/products' },
    { label: '订单数', value: String(orderList.length), href: '/admin/orders' },
    { label: '营业额', value: formatMoney(revenue, 'USD'), href: '/admin/orders' },
    { label: '客单价', value: formatMoney(avg, 'USD') },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-muted">概览</p>
          <h1 className="mt-2 font-display text-[34px] leading-none">仪表盘</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="btn btn-solid h-10 px-5 text-white">
            <span className="text-[10px]">新建商品</span>
          </Link>
          <Link href="/admin/pages" className="flex h-10 items-center border border-line bg-white px-5 text-[10px] tracking-[0.1em] hover:border-ink">
            页面管理
          </Link>
          <Link href="/admin/settings" className="flex h-10 items-center border border-line bg-white px-5 text-[10px] tracking-[0.1em] hover:border-ink">
            设置
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-white p-5">
            <p className="text-[10px] tracking-[0.14em] text-muted">{s.label}</p>
            <p className="mt-3 font-display text-[30px] leading-none">{s.value}</p>
            {s.href && (
              <Link href={s.href} className="mt-3 inline-block text-[11px] text-muted underline underline-offset-4 hover:text-ink">
                查看
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-[12px] tracking-[0.14em]">最近订单</h2>
            <Link href="/admin/orders" className="text-[11px] text-muted hover:text-ink">全部订单 →</Link>
          </div>
          {orderList.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-muted">
              还没有订单。在前台下单后会出现在这里。
            </p>
          ) : (
            <table className="w-full text-left text-[12.5px]">
              <thead className="text-[10px] tracking-[0.1em] text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-3 font-normal">订单号</th>
                  <th className="px-3 py-3 font-normal">客户</th>
                  <th className="px-3 py-3 font-normal">金额</th>
                  <th className="px-5 py-3 font-normal text-right">下单时间</th>
                </tr>
              </thead>
              <tbody>
                {orderList.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="underline underline-offset-4 hover:text-tan">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{o.name}</td>
                    <td className="px-3 py-3">{formatMoney(o.total, o.currency)}</td>
                    <td className="px-5 py-3 text-right text-muted">
                      {new Date(o.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div className="space-y-6">
          <section className="border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[12px] tracking-[0.14em]">店铺设置</h2>
            </div>
            <dl className="space-y-3 px-5 py-4 text-[12.5px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">公告栏</dt>
                <dd className="max-w-[60%] text-right">{settings.announcement}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">免运费门槛</dt>
                <dd>{formatMoney(settings.freeShippingThreshold, 'USD')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">税率</dt>
                <dd>{(settings.taxRate * 100).toFixed(2)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">售出件数</dt>
                <dd>{units}</dd>
              </div>
            </dl>
            <div className="border-t border-line px-5 py-4">
              <Link href="/admin/settings" className="text-[11px] text-muted underline underline-offset-4 hover:text-ink">
                编辑设置 →
              </Link>
            </div>
          </section>

          <section className="border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[12px] tracking-[0.14em]">GEO 状态</h2>
            </div>
            <div className="space-y-3 px-5 py-4 text-[12.5px]">
              <div className="flex justify-between">
                <dt className="text-muted">AI 爬虫</dt>
                <dd>{geo.allowAiCrawlers ? '已允许' : '已屏蔽'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">FAQ 条目</dt>
                <dd>{geo.faqs.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">结构化事实</dt>
                <dd>{geo.facts.length}</dd>
              </div>
            </div>
            <div className="border-t border-line px-5 py-4">
              <Link href="/admin/geo" className="text-[11px] text-muted underline underline-offset-4 hover:text-ink">
                前往 GEO 优化 →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
