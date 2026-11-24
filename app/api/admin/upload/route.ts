import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { saveUpload } from '@/lib/admin/uploads';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'NO_FILE' }, { status: 400 });
  }

  const result = await saveUpload(file);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, url: result.url, name: result.name });
}
