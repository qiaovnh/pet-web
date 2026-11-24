import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { getContent, saveContent, type Content } from '@/lib/storefront/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  return NextResponse.json({ ok: true, content: await getContent() });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Partial<Content> | null;
  if (!body || !Array.isArray(body.banners) || !Array.isArray(body.nav)) {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  const clean: Content = {
    banners: body.banners.map((b, i) => ({
      id: b.id || `banner-${i}`,
      placement: b.placement === 'home-promo' ? 'home-promo' : 'home-hero',
      title: (b.title ?? '').trim(),
      subtitle: (b.subtitle ?? '').trim(),
      ctaLabel: (b.ctaLabel ?? '').trim(),
      ctaHref: (b.ctaHref ?? '').trim(),
      image: (b.image ?? '').trim(),
      theme: b.theme === 'ink' || b.theme === 'cream' ? b.theme : 'forest',
      active: Boolean(b.active),
      order: Number.isFinite(b.order) ? Number(b.order) : i,
    })),
    nav: body.nav.map((g, i) => ({
      id: g.id || `nav-${i}`,
      label: (g.label ?? '').trim(),
      labelKey: g.labelKey,
      href: (g.href ?? '/').trim(),
      visible: Boolean(g.visible),
      order: Number.isFinite(g.order) ? Number(g.order) : i,
      children: (g.children ?? []).map((c, j) => ({
        id: c.id || `nav-${i}-${j}`,
        label: (c.label ?? '').trim(),
        labelKey: c.labelKey,
        href: (c.href ?? '/').trim(),
        visible: Boolean(c.visible),
      })),
    })),
  };

  const content = await saveContent(clean);
  return NextResponse.json({ ok: true, content });
}
