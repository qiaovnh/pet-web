/** 图片可能是站内路径（/img/x.jpg）或 Blob 绝对地址，拼 canonical 时只处理前者。 */
export function absoluteUrl(base: string, src: string): string {
  if (!src) return base;
  if (/^https?:\/\//i.test(src)) return src;
  return `${base.replace(/\/$/, '')}${src.startsWith('/') ? '' : '/'}${src}`;
}
