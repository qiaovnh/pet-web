'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Geo, GeoFaq, GeoFact, GeoCheck } from '@/lib/storefront/geo';

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const label = 'text-[11px] tracking-[0.08em] text-muted';
const input = 'mt-1 w-full border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-ink';

export function GeoEditor({
  initial,
  checks,
  baseUrl,
}: {
  initial: Geo;
  checks: GeoCheck[];
  baseUrl: string;
}) {
  const router = useRouter();
  const [geo, setGeo] = useState<Geo>(initial);
  const [keywordText, setKeywordText] = useState(initial.keywords.join(', '));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const set = <K extends keyof Geo>(key: K, value: Geo[K]) => setGeo((prev) => ({ ...prev, [key]: value }));

  const patchFact = (id: string, patch: Partial<GeoFact>) =>
    setGeo((prev) => ({ ...prev, facts: prev.facts.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));

  const patchFaq = (id: string, patch: Partial<GeoFaq>) =>
    setGeo((prev) => ({ ...prev, faqs: prev.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));

  const save = async () => {
    setStatus('saving');
    const payload = {
      ...geo,
      keywords: keywordText.split(/[,，]/).map((k) => k.trim()).filter(Boolean),
    };
    const res = await fetch('/api/admin/geo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { ok: boolean; geo?: Geo };
    if (!json.ok || !json.geo) {
      setStatus('error');
      return;
    }
    setGeo(json.geo);
    setKeywordText(json.geo.keywords.join(', '));
    setStatus('saved');
    router.refresh();
    setTimeout(() => setStatus('idle'), 2500);
  };

  const passed = checks.filter((c) => c.pass).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <section className="border border-line bg-white p-5">
          <h2 className="text-[12px] tracking-[0.1em]">品牌实体</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={label}>品牌名</span>
              <input value={geo.brandName} onChange={(e) => set('brandName', e.target.value)} className={input} />
            </label>
            <label className="block">
              <span className={label}>标语</span>
              <input value={geo.tagline} onChange={(e) => set('tagline', e.target.value)} className={input} />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>一句话简介（AI 摘要首选）</span>
              <textarea
                value={geo.shortDescription}
                rows={3}
                onChange={(e) => set('shortDescription', e.target.value)}
                className={input}
              />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>深度介绍（产地、工艺、认证等可核验事实）</span>
              <textarea
                value={geo.longDescription}
                rows={5}
                onChange={(e) => set('longDescription', e.target.value)}
                className={input}
              />
            </label>
            <label className="block md:col-span-2">
              <span className={label}>关键词（逗号分隔）</span>
              <input value={keywordText} onChange={(e) => setKeywordText(e.target.value)} className={input} />
            </label>
            <label className="block">
              <span className={label}>站点域名</span>
              <input value={geo.canonicalBase} onChange={(e) => set('canonicalBase', e.target.value)} className={input} />
            </label>
            <label className="mt-6 flex items-center gap-2 text-[12px] text-ink-soft">
              <input
                type="checkbox"
                checked={geo.allowAiCrawlers}
                onChange={(e) => set('allowAiCrawlers', e.target.checked)}
              />
              允许 AI 爬虫（GPTBot / ClaudeBot / PerplexityBot 等）
            </label>
          </div>
        </section>

        <section className="border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] tracking-[0.1em]">结构化事实</h2>
            <button
              type="button"
              onClick={() => setGeo((prev) => ({ ...prev, facts: [...prev.facts, { id: uid('fact'), label: '', value: '' }] }))}
              className="text-[11px] text-muted hover:text-ink"
            >
              + 添加
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {geo.facts.map((f) => (
              <div key={f.id} className="flex gap-2">
                <input
                  value={f.label}
                  placeholder="成立时间"
                  onChange={(e) => patchFact(f.id, { label: e.target.value })}
                  className="w-40 border border-line px-3 py-2 text-[12.5px] outline-none focus:border-ink"
                />
                <input
                  value={f.value}
                  placeholder="2016 年"
                  onChange={(e) => patchFact(f.id, { value: e.target.value })}
                  className="flex-1 border border-line px-3 py-2 text-[12.5px] outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={() => setGeo((prev) => ({ ...prev, facts: prev.facts.filter((x) => x.id !== f.id) }))}
                  className="px-2 text-[11px] text-tan-deep hover:underline"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] tracking-[0.1em]">常见问题（输出为 FAQPage 结构化数据）</h2>
            <button
              type="button"
              onClick={() => setGeo((prev) => ({ ...prev, faqs: [...prev.faqs, { id: uid('faq'), question: '', answer: '' }] }))}
              className="text-[11px] text-muted hover:text-ink"
            >
              + 添加
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {geo.faqs.map((f) => (
              <div key={f.id} className="border border-line p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={f.question}
                    placeholder="问题"
                    onChange={(e) => patchFaq(f.id, { question: e.target.value })}
                    className="flex-1 border border-line px-3 py-2 text-[12.5px] outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setGeo((prev) => ({ ...prev, faqs: prev.faqs.filter((x) => x.id !== f.id) }))}
                    className="text-[11px] text-tan-deep hover:underline"
                  >
                    删除
                  </button>
                </div>
                <textarea
                  value={f.answer}
                  placeholder="回答"
                  rows={2}
                  onChange={(e) => patchFaq(f.id, { answer: e.target.value })}
                  className="mt-2 w-full border border-line px-3 py-2 text-[12.5px] outline-none focus:border-ink"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button type="button" onClick={save} disabled={status === 'saving'} className="btn btn-solid text-white disabled:opacity-60">
            <span>{status === 'saving' ? '保存中…' : '保存设置'}</span>
          </button>
          {status === 'saved' && <p className="text-[12px] text-forest">已保存。</p>}
          {status === 'error' && <p className="text-[12px] text-tan-deep">保存失败，请重试。</p>}
        </div>
      </div>

      <aside className="space-y-6">
        <section className="border border-line bg-white p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[12px] tracking-[0.1em]">检查清单</h2>
            <span className="font-display text-[22px] leading-none">
              {passed}/{checks.length}
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex gap-2.5">
                <span className={c.pass ? 'text-forest' : 'text-tan-deep'}>{c.pass ? '✓' : '✕'}</span>
                <div>
                  <p className={`text-[12.5px] ${c.pass ? '' : 'text-tan-deep'}`}>{c.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{c.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-line bg-white p-5">
          <h2 className="text-[12px] tracking-[0.1em]">已生成的抓取入口</h2>
          <ul className="mt-3 space-y-2 text-[12.5px]">
            {[
              { href: '/llms.txt', text: 'llms.txt' },
              { href: '/llms-full.txt', text: 'llms-full.txt' },
              { href: '/sitemap.xml', text: 'sitemap.xml' },
              { href: '/robots.txt', text: 'robots.txt' },
            ].map((l) => (
              <li key={l.href}>
                <Link target="_blank" href={l.href} className="text-ink-soft underline underline-offset-4 hover:text-tan">
                  {l.text}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            根域名：{baseUrl}
          </p>
        </section>
      </aside>
    </div>
  );
}
