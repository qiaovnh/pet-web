import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { getGeo, saveGeo, type Geo } from '@/lib/storefront/geo';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  return NextResponse.json({ ok: true, geo: await getGeo() });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Partial<Geo> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });

  const geo = await saveGeo({
    brandName: (body.brandName ?? '').trim() || undefined,
    tagline: (body.tagline ?? '').trim(),
    shortDescription: (body.shortDescription ?? '').trim(),
    longDescription: (body.longDescription ?? '').trim(),
    keywords: body.keywords,
    facts: (body.facts ?? []).map((f, i) => ({
      id: f.id || `fact-${i}`,
      label: (f.label ?? '').trim(),
      value: (f.value ?? '').trim(),
    })),
    faqs: (body.faqs ?? []).map((f, i) => ({
      id: f.id || `faq-${i}`,
      question: (f.question ?? '').trim(),
      answer: (f.answer ?? '').trim(),
    })),
    canonicalBase: (body.canonicalBase ?? '').trim(),
    allowAiCrawlers: Boolean(body.allowAiCrawlers),
  });

  return NextResponse.json({ ok: true, geo });
}
