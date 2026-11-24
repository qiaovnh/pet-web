import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_COOKIE,
  adminCredentialsReady,
  checkPassword,
  createSessionToken,
} from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  // 生产环境没配好凭据时，明确报「未配置」而不是伪装成密码错误，
  // 免得运维反复试密码却找不到真正原因。
  if (!adminCredentialsReady()) {
    console.error('[admin] 生产环境未配置 ADMIN_PASSWORD / ADMIN_SECRET，后台登录已禁用');
    return NextResponse.json(
      { ok: false, error: 'ADMIN_NOT_CONFIGURED' },
      { status: 503 },
    );
  }

  if (!body?.password || !checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 250));
    return NextResponse.json({ ok: false, error: 'INVALID_PASSWORD' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
    // 生产环境走 HTTPS，加 secure 让 cookie 不走明文
    secure: Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production',
  });
  return res;
}
