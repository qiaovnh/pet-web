'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/lib/products';
import { MultiImageField } from '@/components/admin/multi-image-field';

const CATEGORIES = ['black', 'green', 'matcha', 'oolong', 'white', 'dark', 'botanical', 'chai', 'gifts', 'sampler', 'ware'];
const CAFFEINE = ['Dog', 'Cat', 'Dog & Cat'];
const BADGES = ['', 'Best Seller', 'New', 'Limited'];

type Size = { label: string; price: number };

export function ProductForm({ product, mode }: { product?: Product; mode: 'new' | 'edit' }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: product?.title ?? '',
    handle: product?.handle ?? '',
    subtitle: product?.subtitle ?? '',
    notes: product?.notes ?? '',
    badge: product?.badge ?? '',
    blurb: product?.blurb ?? '',
    story: product?.story ?? '',
    origin: product?.origin ?? '',
    caffeine: product?.caffeine ?? 'Medium',
    ingredients: product?.ingredients ?? '',
    preparation: product?.preparation ?? '',
  });
  const [images, setImages] = useState<string[]>(
    product?.images?.length ? product.images : product?.image ? [product.image] : [],
  );
  const [sizes, setSizes] = useState<Size[]>(
    product?.sizes?.length ? product.sizes : [{ label: '4 oz loose leaf', price: 18 }],
  );
  const [categories, setCategories] = useState<string[]>(product?.categories ?? []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setSize = (index: number, patch: Partial<Size>) =>
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const cleanSizes = sizes.filter((s) => s.label.trim() && Number(s.price) > 0);
    const payload = {
      ...form,
      badge: form.badge || undefined,
      categories,
      images,
      image: images[0] ?? '',
      sizes: cleanSizes,
      price: Math.min(...cleanSizes.map((s) => Number(s.price))),
    };

    const res = await fetch(
      mode === 'new' ? '/api/admin/products' : `/api/admin/products/${encodeURIComponent(product!.handle)}`,
      {
        method: mode === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    const json = (await res.json()) as { ok: boolean; error?: string };
    if (!json.ok) {
      setError(json.error ?? 'SAVE_FAILED');
      setBusy(false);
      return;
    }
    router.push('/admin/products');
    router.refresh();
  };

  const remove = async () => {
    if (!product) return;
    if (!confirm(`确定删除「${product.title}」？此操作不可撤销。`)) return;
    setBusy(true);
    await fetch(`/api/admin/products/${encodeURIComponent(product.handle)}`, { method: 'DELETE' });
    router.push('/admin/products');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <section className="border border-line bg-white p-5">
          <h2 className="text-[12px] uppercase tracking-[0.14em]">基础信息</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">标题</span>
              <input value={form.title} onChange={set('title')} required className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">链接标识（URL）</span>
              <input
                value={form.handle}
                onChange={set('handle')}
                placeholder="留空则根据标题生成"
                className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink"
              />
              <span className="mt-1 block text-[10.5px] text-muted">
                中文标题建议手动填一个拼音或英文标识，否则会自动生成 item-xxxx。
              </span>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">副标题</span>
              <input value={form.subtitle} onChange={set('subtitle')} placeholder="例如：有机红茶拼配" className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">风味描述</span>
              <input value={form.notes} onChange={set('notes')} placeholder="例如：醇厚 | 柑橘 | 花香" className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
            </label>
          </div>
        </section>

        <section className="border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] uppercase tracking-[0.14em]">规格与价格</h2>
            <button
              type="button"
              onClick={() => setSizes((prev) => [...prev, { label: '', price: 0 }])}
              className="text-[11px] text-muted underline underline-offset-4 hover:text-ink"
            >
              + 添加规格
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={s.label}
                  onChange={(e) => setSize(i, { label: e.target.value })}
                  placeholder="如：4 盎司散茶"
                  className="flex-1 border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={s.price}
                  onChange={(e) => setSize(i, { price: Number(e.target.value) })}
                  className="w-28 border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink"
                />
                <button
                  type="button"
                  disabled={sizes.length === 1}
                  onClick={() => setSizes((prev) => prev.filter((_, idx) => idx !== i))}
                  className="px-2 text-[12px] text-muted hover:text-ink disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted">
            商品卡会自动以最低价显示「起价」。
          </p>
        </section>

        <section className="border border-line bg-white p-5">
          <h2 className="text-[12px] uppercase tracking-[0.14em]">文案</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">简介</span>
              <textarea value={form.blurb} onChange={set('blurb')} rows={3} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">品牌故事 / 引言</span>
              <textarea value={form.story} onChange={set('story')} rows={3} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">冲泡方式</span>
              <input value={form.preparation} onChange={set('preparation')} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">配料</span>
              <input value={form.ingredients} onChange={set('ingredients')} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
            </label>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="border border-line bg-white p-5">
          <h2 className="text-[12px] uppercase tracking-[0.14em]">组织信息</h2>
          <div className="mt-4 space-y-4">
            <div>
              <MultiImageField title="商品图片" value={images} onChange={setImages} />
            </div>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">标签</span>
              <select value={form.badge} onChange={set('badge')} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink">
                {BADGES.map((b) => (
                  <option key={b} value={b}>{b || '— 无 —'}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">咖啡因</span>
              <select value={form.caffeine} onChange={set('caffeine')} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink">
                {CAFFEINE.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted">产地</span>
              <input value={form.origin} onChange={set('origin')} className="mt-1.5 w-full border border-line px-3 py-2.5 text-[13px] outline-none focus:border-ink" />
            </label>
          </div>
        </section>

        <section className="border border-line bg-white p-5">
          <h2 className="text-[12px] uppercase tracking-[0.14em]">所属集合</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const on = categories.includes(c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() =>
                    setCategories((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))
                  }
                  className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors ${
                    on ? 'border-ink bg-ink text-cream' : 'border-line hover:border-ink'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {error && <p className="border border-tan bg-tan/10 px-4 py-3 text-[12px] text-tan-deep">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={busy} className="btn btn-solid flex-1 text-white disabled:opacity-60">
            <span>{busy ? '保存中…' : mode === 'new' ? '创建商品' : '保存修改'}</span>
          </button>
          {mode === 'edit' && (
            <button type="button" onClick={remove} className="border border-line px-5 text-[10px] uppercase tracking-[0.12em] text-tan-deep hover:border-tan">删除</button>
          )}
        </div>
      </div>
    </form>
  );
}
