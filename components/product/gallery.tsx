'use client';

import { useState } from 'react';

/**
 * 亚马逊式商品图集：左侧缩略图竖排 + 主图，悬停放大。
 * 移动端改为「主图在上、缩略图横排在下」。
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const list = images.length > 0 ? images : ['/img/p-dog6.jpg'];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="grid gap-3 md:grid-cols-[64px_1fr] md:items-start">
      <div className="order-2 flex gap-2 overflow-x-auto pb-1 md:order-none md:max-h-[560px] md:flex-col md:overflow-y-auto md:pb-0">
        {list.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            onMouseEnter={() => setActive(index)}
            aria-label={`查看第 ${index + 1} 张`}
            aria-current={index === active}
            className={`relative h-14 w-14 shrink-0 overflow-hidden border bg-white transition-colors ${
              index === active ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink/60'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <div
        className="order-1 relative aspect-square w-full overflow-hidden bg-white md:order-none md:sticky md:top-[100px]"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-gallery-main
          src={current}
          alt={alt}
          style={{ transformOrigin: origin, transform: zoom ? 'scale(1.9)' : 'scale(1)' }}
          className="h-full w-full object-contain transition-transform duration-200 ease-out"
        />
        {list.length > 1 && (
          <span className="pointer-events-none absolute bottom-3 end-3 bg-white/85 px-2 py-1 text-[10px] tracking-[0.08em] text-muted">
            {Math.min(active, list.length - 1) + 1} / {list.length}
          </span>
        )}
      </div>
    </div>
  );
}
