import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { readStore } from '@/lib/storefront/db';
import { formatMoney } from '@/lib/currency';
import type { Order } from '@/lib/storefront/types';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  await requireAdmin();
  const store = await readStore<Order>('orders.json');
  const orders = Object.values(store).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">交易</p>
          <h1 className="mt-2 font-display text-[34px] leading-none">订单</h1>
        </div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted">共 {orders.length} 笔</p>
      </header>

      {orders.length === 0 ? (
        <div className="mt-8 border border-line bg-white px-6 py-16 text-center">
          <p className="font-display text-[24px]">还没有订单</p>
          <p className="mt-2 text-[13px] text-muted">前台下单后会显示在这里。</p>
          <Link href="/" target="_blank" className="btn btn-solid mt-6 text-white">
            <span>打开前台</span>
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-[12.5px]">
            <thead className="text-[10px] uppercase tracking-[0.1em] text-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-normal">订单号</th>
                <th className="px-3 py-3 font-normal">客户</th>
                <th className="px-3 py-3 font-normal">收货地</th>
                <th className="px-3 py-3 font-normal">件数</th>
                <th className="px-3 py-3 font-normal">金额</th>
                <th className="px-5 py-3 font-normal text-right">下单时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line/70 last:border-0 hover:bg-cream/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="underline underline-offset-4 hover:text-tan">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <p>{o.name}</p>
                    <p className="text-[11px] text-muted">{o.email}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">
                    {o.city}, {o.country}
                  </td>
                  <td className="px-3 py-3">{o.lines.reduce((n, l) => n + l.qty, 0)}</td>
                  <td className="px-3 py-3">{formatMoney(o.total, o.currency)}</td>
                  <td className="px-5 py-3 text-right text-muted">
                    {new Date(o.createdAt).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
