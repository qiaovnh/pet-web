'use client';

import { useRef, useState } from 'react';

const label = 'text-[11px] tracking-[0.08em] text-muted';

const errorText: Record<string, string> = {
  FILE_TOO_LARGE: '图片不能超过 8MB',
  UNSUPPORTED_TYPE: '仅支持 JPG / PNG / WebP / GIF / AVIF',
  EMPTY_FILE: '文件为空',
  NO_FILE: '没有选择文件',
  UNAUTHORIZED: '登录已过期，请重新登录',
};

export function ImageField({
  value,
  onChange,
  presets = [],
  title = '图片',
}: {
  value: string;
  onChange: (url: string) => void;
  presets?: string[];
  title?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!json.ok || !json.url) {
        setError(errorText[json.error ?? ''] ?? '上传失败，请重试');
        return;
      }
      onChange(json.url);
    } catch {
      setError('上传失败，请检查网络');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className={label}>{title}</span>
      <div className="mt-1 flex gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void upload(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`relative grid h-24 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden border bg-card text-center text-[10px] text-muted ${
            dragging ? 'border-ink bg-cream' : 'border-line'
          }`}
          title="点击上传，或把图片拖到这里"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="预览" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 leading-tight">{busy ? '上传中…' : '点击或拖入\n上传图片'}</span>
          )}
          {busy && value && <span className="absolute inset-0 grid place-items-center bg-white/70 text-[10px] text-ink">上传中…</span>}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/img/p-dog6.jpg 或 /media/xxx.jpg"
            className="w-full border border-line bg-white px-3 py-2 text-[12.5px] outline-none focus:border-ink"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="border border-ink bg-ink px-3 py-1.5 text-[10px] tracking-[0.06em] text-cream hover:bg-forest disabled:opacity-50"
            >
              {busy ? '上传中…' : '上传图片'}
            </button>
            {presets.length > 0 && (
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="border border-line bg-white px-3 py-1.5 text-[10px] tracking-[0.06em] hover:border-ink"
              >
                {pickerOpen ? '收起图库' : '从图库选择'}
              </button>
            )}
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[10px] text-tan-deep hover:underline"
              >
                清除
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          {error && <p className="text-[11px] text-tan-deep">{error}</p>}
        </div>
      </div>

      {pickerOpen && presets.length > 0 && (
        <div className="mt-3 grid grid-cols-6 gap-2 border border-line bg-cream/50 p-3 sm:grid-cols-8">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                onChange(preset);
                setPickerOpen(false);
              }}
              title={preset}
              className={`relative aspect-square overflow-hidden border ${
                preset === value ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preset} alt={preset} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
