import { site } from '@/lib/site';

export function Logo({ className = '', size = 26 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span
        className="font-display"
        style={{ fontSize: size, letterSpacing: '0.24em', textIndent: '0.24em' }}
      >
        {site.name}
      </span>
      <span
        className="mt-[7px] uppercase"
        style={{ fontSize: Math.max(7, size * 0.3), letterSpacing: '0.34em', textIndent: '0.34em' }}
      >
        {site.tagline}
      </span>
    </span>
  );
}
