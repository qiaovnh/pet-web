'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Banner, Content, NavGroup, NavLink } from '@/lib/storefront/content';
import { ImageField } from '@/components/admin/image-field';
import { PRESET_IMAGES } from '@/lib/image-presets';

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

const label = 'text-[11px] tracking-[0.08em] text-muted';
const input =
  'mt-1 w-full border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-ink';

function Field({
  title,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className={label}>{title}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={input}
      />
    </label>
  );
}

export function PagesEditor({ initial }: { initial: Content }) {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>(initial.banners);
  const [nav, setNav] = useState<NavGroup[]>(initial.nav);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const patchBanner = (id: string, patch: Partial<Banner>) =>
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const moveBanner = (index: number, dir: -1 | 1) =>
    setBanners((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((b, i) => ({ ...b, order: i }));
    });

  const patchGroup = (id: string, patch: Partial<NavGroup>) =>
    setNav((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const patchChild = (gid: string, cid: string, patch: Partial<NavLink>) =>
    setNav((prev) =>
      prev.map((g) =>
        g.id === gid
          ? { ...g, children: g.children.map((c) => (c.id === cid ? { ...c, ...patch } : c)) }
          : g,
      ),
    );

  const moveGroup = (index: number, dir: -1 | 1) =>
    setNav((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((g, i) => ({ ...g, order: i }));
    });

  const save = async () => {
    setStatus('saving');
    const res = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banners, nav }),
    });
    const json = (await res.json()) as { ok: boolean; error?: string };
    if (!json.ok) {
      setStatus('error');
      return;
    }
    setStatus('saved');
    router.refresh();
    setTimeout(() => setStatus('idle'), 2500);
  };

  return (
    <div className="space-y-10">
      {/* Banner */}
      <section>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-[24px] leading-none">首页 Banner</h2>
            <p className="mt-2 text-[12px] text-muted">
              主视觉位与促销位各取「已启用」中排序最靠前的一条。
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setBanners((prev) => [
                ...prev,
                {
                  id: uid('banner'),
                  placement: 'home-hero',
                  title: '新 Banner',
                  subtitle: '',
                  ctaLabel: '立即选购',
                  ctaHref: '/collections/all',
                  image: '/img/hero-cat.jpg',
                  theme: 'forest',
                  active: false,
                  order: prev.length,
                },
              ])
            }
            className="border border-line bg-white px-4 py-2 text-[10px] tracking-[0.1em] hover:border-ink"
          >
            + 新增 Banner
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {banners.map((b, index) => (
            <div key={b.id} className="border border-line bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="border border-line px-2 py-1 text-[10px] tracking-[0.08em] text-muted">
                  {b.placement === 'home-hero' ? '首页主视觉' : '首页促销位'} · 排序 {index + 1}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-[11px] text-ink-soft">
                    <input
                      type="checkbox"
                      checked={b.active}
                      onChange={(e) => patchBanner(b.id, { active: e.target.checked })}
                    />
                    启用
                  </label>
                  <button type="button" onClick={() => moveBanner(index, -1)} className="text-[11px] text-muted hover:text-ink">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveBanner(index, 1)} className="text-[11px] text-muted hover:text-ink">
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('删除这个 Banner？')) {
                        setBanners((prev) => prev.filter((x) => x.id !== b.id).map((x, i) => ({ ...x, order: i })));
                      }
                    }}
                    className="text-[11px] text-tan-deep hover:underline"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={label}>位置</span>
                  <select
                    value={b.placement}
                    onChange={(e) => patchBanner(b.id, { placement: e.target.value as Banner['placement'] })}
                    className={input}
                  >
                    <option value="home-hero">首页主视觉</option>
                    <option value="home-promo">首页促销位</option>
                  </select>
                </label>
                <label className="block">
                  <span className={label}>配色</span>
                  <select
                    value={b.theme}
                    onChange={(e) => patchBanner(b.id, { theme: e.target.value as Banner['theme'] })}
                    className={input}
                  >
                    <option value="forest">深绿</option>
                    <option value="ink">墨蓝</option>
                    <option value="cream">米白</option>
                  </select>
                </label>
                <Field title="标题" value={b.title} onChange={(v) => patchBanner(b.id, { title: v })} />
                <Field title="按钮文字" value={b.ctaLabel} onChange={(v) => patchBanner(b.id, { ctaLabel: v })} />
                <Field title="按钮链接" value={b.ctaHref} onChange={(v) => patchBanner(b.id, { ctaHref: v })} />
                <div className="md:col-span-2">
                  <ImageField
                    title="Banner 图片"
                    value={b.image}
                    onChange={(v) => patchBanner(b.id, { image: v })}
                    presets={PRESET_IMAGES}
                  />
                </div>
                <label className="block md:col-span-2">
                  <span className={label}>副标题</span>
                  <textarea
                    value={b.subtitle}
                    rows={2}
                    onChange={(e) => patchBanner(b.id, { subtitle: e.target.value })}
                    className={input}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nav */}
      <section>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-[24px] leading-none">导航条</h2>
            <p className="mt-2 text-[12px] text-muted">
              只显示「已显示」的分组与子项；内置项保留了多语言键，切换语言时会自动翻译。
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setNav((prev) => [
                ...prev,
                {
                  id: uid('nav'),
                  label: '新菜单',
                  href: '/collections/all',
                  visible: false,
                  order: prev.length,
                  children: [],
                },
              ])
            }
            className="border border-line bg-white px-4 py-2 text-[10px] tracking-[0.1em] hover:border-ink"
          >
            + 新增一级菜单
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {nav.map((g, index) => (
            <div key={g.id} className="border border-line bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="border border-line px-2 py-1 text-[10px] tracking-[0.08em] text-muted">
                  第 {index + 1} 项 · {g.children.length} 个子项
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-[11px] text-ink-soft">
                    <input
                      type="checkbox"
                      checked={g.visible}
                      onChange={(e) => patchGroup(g.id, { visible: e.target.checked })}
                    />
                    显示
                  </label>
                  <button type="button" onClick={() => moveGroup(index, -1)} className="text-[11px] text-muted hover:text-ink">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveGroup(index, 1)} className="text-[11px] text-muted hover:text-ink">
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('删除这个菜单分组？')) {
                        setNav((prev) => prev.filter((x) => x.id !== g.id).map((x, i) => ({ ...x, order: i })));
                      }
                    }}
                    className="text-[11px] text-tan-deep hover:underline"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field title="名称" value={g.label} onChange={(v) => patchGroup(g.id, { label: v })} />
                <Field title="链接" value={g.href} onChange={(v) => patchGroup(g.id, { href: v })} />
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <div className="flex items-center justify-between">
                  <span className={label}>子项（下拉菜单）</span>
                  <button
                    type="button"
                    onClick={() =>
                      setNav((prev) =>
                        prev.map((x) =>
                          x.id === g.id
                            ? {
                                ...x,
                                children: [
                                  ...x.children,
                                  { id: uid('nav'), label: '新子项', href: '/collections/all', visible: true },
                                ],
                              }
                            : x,
                        ),
                      )
                    }
                    className="text-[11px] text-muted hover:text-ink"
                  >
                    + 添加子项
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {g.children.length === 0 && <p className="text-[11.5px] text-muted">暂无子项。</p>}
                  {g.children.map((c) => (
                    <div key={c.id} className="flex flex-wrap items-center gap-2">
                      <input
                        value={c.label}
                        onChange={(e) => patchChild(g.id, c.id, { label: e.target.value })}
                        className="w-40 border border-line px-3 py-2 text-[12.5px] outline-none focus:border-ink"
                      />
                      <input
                        value={c.href}
                        onChange={(e) => patchChild(g.id, c.id, { href: e.target.value })}
                        className="flex-1 border border-line px-3 py-2 text-[12.5px] outline-none focus:border-ink"
                      />
                      <label className="flex items-center gap-1.5 text-[11px] text-muted">
                        <input
                          type="checkbox"
                          checked={c.visible}
                          onChange={(e) => patchChild(g.id, c.id, { visible: e.target.checked })}
                        />
                        显示
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setNav((prev) =>
                            prev.map((x) =>
                              x.id === g.id ? { ...x, children: x.children.filter((y) => y.id !== c.id) } : x,
                            ),
                          )
                        }
                        className="text-[11px] text-tan-deep hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-5 flex items-center gap-4 border-t border-line bg-[#f5f4f0] px-5 py-4 md:-mx-10 md:px-10">
        <button type="button" onClick={save} disabled={status === 'saving'} className="btn btn-solid text-white disabled:opacity-60">
          <span>{status === 'saving' ? '保存中…' : '保存全部'}</span>
        </button>
        {status === 'saved' && <p className="text-[12px] text-forest">已保存，前台已更新。</p>}
        {status === 'error' && <p className="text-[12px] text-tan-deep">保存失败，请重试。</p>}
      </div>
    </div>
  );
}
