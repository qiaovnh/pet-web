'use client';

import { useRef, useState } from 'react';
import { PRESET_IMAGES } from '@/lib/image-presets';

const label = 'text-[11px] tracking-[0.08em] text-muted';

const errorText: Record<string, string> = {
  FILE_TOO_LARGE: '图片不能超过 8MB',
  UNSUPPORTED_TYPE: '仅支持 JPG / PNG / WebP / GIF / AVIF',
  EMPTY_FILE: '文件为空',
  NO_FILE: '没有选择文件',
  UNAUTHORIZED: '登录已过期，请重新登录',
};

export function MultiImageField({
  value,
  onChange,
  title = '商品图片',
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  title?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const addUrls = (urls: string[]) => {
    const next = [...value];
    for (const url of urls) if (!next.includes(url)) next.push(url);
    onChange(next);
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError('');
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body });
        const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
        if (!json.ok || !json.url) {
          setError(errorText[json.error ?? ''] ?? `「${file.name}」上传失败`);
          continue;
        }
        uploaded.push(json.url);
      } catch {
        setError('上传失败，请检查网络');
      }
    }

    if (uploaded.length > 0) addUrls(uploaded);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div>
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={label}>{title}</span>
          <span className="text-[10.5px] text-muted/80">
            {value.length} 张 · 第一张为封面{value.length > 1 ? ' · 拖拽缩略图可排序' : ''}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="border border-ink bg-ink px-3 py-1.5 text-[10px] tracking-[0.06em] text-cream hover:bg-forest disabled:opacity-50"
          >
            {busy ? '上传中…' : '上传图片'}
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="border border-line bg-white px-3 py-1.5 text-[10px] tracking-[0.06em] hover:border-ink"
          >
            {pickerOpen ? '收起图库' : '从图库添加'}
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => void upload(e.target.files)}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (dragIndex === null) setOverIndex(-1);
        }}
        onDragLeave={() => setOverIndex(null)}
        onDrop={(e) => {
          e.preventDefault();
          if (dragIndex !== null && (overIndex === null || overIndex < 0)) move(dragIndex, value.length - 1);
          setDragIndex(null);
          setOverIndex(null);
        }}
        className={`mt-2 grid grid-cols-3 gap-2 border border-dashed p-2 sm:grid-cols-5 ${
          dragIndex !== null ? 'border-ink bg-cream/40' : 'border-line bg-cream/20'
        }`}
      >
        {value.length === 0 && (
          <div className="col-span-full py-8 text-center text-[11.5px] text-muted">
            还没有图片。点「上传图片」选择文件（可多选），或从图库添加。
          </div>
        )}

        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={(e) => {
              setDragIndex(index);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={`group relative aspect-square cursor-grab overflow-hidden border bg-white active:cursor-grabbing ${
              overIndex === index && dragIndex !== null ? 'border-ink ring-2 ring-ink/30' : 'border-line'
            } ${dragIndex === index ? 'opacity-40' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`图 ${index + 1}`} className="pointer-events-none h-full w-full object-cover" />

            <span className="absolute start-1 top-1 bg-ink/80 px-1.5 py-0.5 text-[9px] text-cream">
              {index === 0 ? '封面' : index + 1}
            </span>

            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  className="bg-white/90 px-1.5 py-0.5 text-[10px] text-ink hover:bg-white disabled:opacity-40"
                  title="前移"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === value.length - 1}
                  className="bg-white/90 px-1.5 py-0.5 text-[10px] text-ink hover:bg-white disabled:opacity-40"
                  title="后移"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-white/90 px-1.5 py-0.5 text-[10px] text-tan-deep hover:bg-white"
                title="删除"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid aspect-square place-items-center border border-dashed border-line text-[18px] text-muted hover:border-ink hover:text-ink"
          title="添加图片"
        >
          +
        </button>
      </div>

      {error && <p className="mt-2 text-[11px] text-tan-deep">{error}</p>}

      {pickerOpen && (
        <div className="mt-3 grid grid-cols-6 gap-2 border border-line bg-cream/50 p-3 sm:grid-cols-8">
          {PRESET_IMAGES.map((preset) => {
            const used = value.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => addUrls([preset])}
                title={preset}
                className={`relative aspect-square overflow-hidden border ${
                  used ? 'border-ink opacity-40' : 'border-line hover:border-ink'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preset} alt={preset} className="h-full w-full object-cover" />
                {used && <span className="absolute inset-0 grid place-items-center text-[10px] text-ink">已用</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
