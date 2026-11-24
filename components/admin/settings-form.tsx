'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Settings } from '@/lib/storefront/settings';

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const set = (key: keyof Settings, numeric = false) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({
        ...prev,
        [key]: numeric ? Number(e.target.value) : e.target.value,
      }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = (await res.json()) as { ok: boolean; settings?: Settings };
    if (!json.ok || !json.settings) {
      setStatus('error');
      return;
    }
    setForm(json.settings);
    setStatus('saved');
    router.refresh();
    setTimeout(() => setStatus('idle'), 2500);
  };

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-6">
      <section className="border border-line bg-white p-5">
        <h2 className="text-[12px] uppercase tracking-[0.14em]">店铺文案</h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">公告栏文案</span>
            <input value={form.announcement} onChange={set('announcement')} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">客服邮箱</span>
            <input value={form.supportEmail} onChange={set('supportEmail')} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">客服时间</span>
            <input value={form.supportHours} onChange={set('supportHours')} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
          </label>
        </div>
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="text-[12px] uppercase tracking-[0.14em]">交易规则</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">免运费门槛（美元）</span>
            <input type="number" min="0" step="1" value={form.freeShippingThreshold} onChange={set('freeShippingThreshold', true)} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">税率（%）</span>
            <input
              type="number"
              min="0"
              max="40"
              step="0.01"
              value={Number((form.taxRate * 100).toFixed(2))}
              onChange={(e) => setForm((prev) => ({ ...prev, taxRate: Number(e.target.value) / 100 }))}
              className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink"
            />
          </label>
        </div>
        <p className="mt-3 text-[11px] text-muted">
          这三项决定购物车进度条、运费与每笔订单的税费。
        </p>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={status === 'saving'} className="btn btn-solid text-white disabled:opacity-60">
          <span>{status === 'saving' ? '保存中…' : '保存设置'}</span>
        </button>
        {status === 'saved' && <p className="text-[12px] text-forest">已保存。</p>}
        {status === 'error' && <p className="text-[12px] text-tan-deep">保存失败，请重试。</p>}
      </div>
    </form>
  );
}
