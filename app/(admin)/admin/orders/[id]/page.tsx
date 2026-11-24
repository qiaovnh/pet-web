import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { getOrder } from '@/lib/orders';
import { formatMoney } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const placed = new Date(order.createdAt).toLocaleString('zh-CN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link href="/admin/orders" className="text-[10px] uppercase tracking-[0.2em] text-muted hover:text-ink">
            ← 订单列表
          </Link>
          <h1 className="mt-2 font-display text-[34px] leading-none">{order.id}</h1>
          <p className="mt-2 text-[12px] text-muted">{placed}</p>
        </div>
        <span className="border border-forest/30 bg-forest/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-forest">
          Confirmed
        </span>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="border border-line bg-white">
          <h2 className="border-b border-line px-5 py-4 text-[12px] uppercase tracking-[0.14em]">商品明细</h2>
          <ul className="divide-y divide-line">
            {order.lines.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 px-5 py-4 text-[13px]">
                <div>
                  <p>{l.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {l.variantTitle} · Qty {l.qty} · {formatMoney(l.unitPrice, order.currency)} each
                  </p>
                </div>
                <span>{formatMoney(l.lineTotal, order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line px-5 py-4 text-[12.5px]">
            <div className="flex justify-between">
              <dt className="text-muted">小计</dt>
              <dd>{formatMoney(order.subtotal, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">运费（{order.shippingMethod}）</dt>
              <dd>{order.shipping === 0 ? 'Free' : formatMoney(order.shipping, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">税费</dt>
              <dd>{formatMoney(order.tax, order.currency)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-[11px] uppercase tracking-[0.12em]">合计</dt>
              <dd className="font-display text-[22px]">{formatMoney(order.total, order.currency)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="border border-line bg-white p-5">
            <h2 className="text-[12px] uppercase tracking-[0.14em]">客户</h2>
            <p className="mt-3 text-[13px] leading-relaxed">
              {order.name}
              <br />
              <a href={`mailto:${order.email}`} className="text-ink-soft underline underline-offset-4">
                {order.email}
              </a>
            </p>
          </section>

          <section className="border border-line bg-white p-5">
            <h2 className="text-[12px] uppercase tracking-[0.14em]">收货地址</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              {order.name}
              <br />
              {order.address}
              <br />
              {order.city} {order.postalCode}
              <br />
              {order.country}
            </p>
          </section>

          <section className="border border-line bg-white p-5">
            <h2 className="text-[12px] uppercase tracking-[0.14em]">支付</h2>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              演示结账——未发生真实扣款。订单币种：{' '}
              {order.currency}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
