type IconProps = { className?: string; stroke?: number };

const base = (className = 'h-5 w-5') => ({
  className,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
});

export function IconSearch({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5.2 20c.7-3.6 3.5-5.6 6.8-5.6s6.1 2 6.8 5.6" />
    </svg>
  );
}

export function IconBag({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 8h12l-.9 11.2a1.6 1.6 0 0 1-1.6 1.5H8.5a1.6 1.6 0 0 1-1.6-1.5Z" />
      <path d="M9.2 8V6.6a2.8 2.8 0 1 1 5.6 0V8" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
    </svg>
  );
}

export function IconArrowLeft({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconMinus({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconLeaf({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 21c0-5.5 2.4-10.2 8-13" />
      <path d="M20 8c.3 6.4-4.2 11.4-9.6 11.4C6.6 19.4 4 16.4 4 12.6 4 7 9.4 3.4 20 3c.2 1.7.2 3.4 0 5Z" />
    </svg>
  );
}

export function IconStar({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1}>
      <path d="m12 3.6 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8Z" />
    </svg>
  );
}
