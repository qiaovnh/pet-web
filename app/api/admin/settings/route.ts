import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { getSettings, saveSettings, type Settings } from '@/lib/storefront/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  return NextResponse.json({ ok: true, settings: await getSettings() });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Partial<Settings> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });

  const settings = await saveSettings(body);
  return NextResponse.json({ ok: true, settings });
}
