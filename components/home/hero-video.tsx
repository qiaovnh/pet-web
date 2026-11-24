'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 首屏背景视频：桌面用 1080p、窄屏用 960px 版本，避免手机下载大文件。
 * 尊重 prefers-reduced-motion（不自动播放），右下角提供播放/暂停。
 */
export function HeroVideo({
  poster,
  desktopSrc,
  mobileSrc,
  className = '',
}: {
  poster: string;
  desktopSrc: string;
  mobileSrc: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setSrc(window.innerWidth < 900 ? mobileSrc : desktopSrc);
    setPlaying(!reduced);
  }, [desktopSrc, mobileSrc]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    if (playing) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [playing, src]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {src && (
        <video
          ref={ref}
          className="h-full w-full object-cover"
          poster={poster}
          src={src}
          muted
          loop
          playsInline
          autoPlay={playing}
          preload="metadata"
          aria-hidden="true"
        />
      )}
      {!src && (
        // 未挂载前用静态图兜底，避免首帧空白
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${poster})` }} />
      )}

      {/* 暗色渐变遮罩，保证白色文字可读 */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink/45 via-ink/35 to-ink/60" />

      <button
        type="button"
        onClick={() => setPlaying((v) => !v)}
        aria-label={playing ? 'Pause background video' : 'Play background video'}
        className="absolute bottom-6 end-6 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-ink shadow-lg backdrop-blur transition-colors hover:bg-white"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <rect x="7" y="5" width="3.5" height="14" rx="1" />
            <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
