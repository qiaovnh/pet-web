import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE = 'inaue_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const DEV_SECRET = 'inaue-dev-secret-change-me';
const DEV_PASSWORD = 'INAUE-ADMIN';

/**
 * 生产环境判定。
 *
 * Vercel 构建时会注入 VERCEL=1，自建服务器通常会设置 NODE_ENV=production。
 * 只要命中其一，就视为生产环境，必须显式配置强密码与密钥。
 */
const isProduction = () =>
  Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

const secret = () => process.env.ADMIN_SECRET ?? DEV_SECRET;
const adminPassword = () => process.env.ADMIN_PASSWORD ?? DEV_PASSWORD;

/**
 * 生产环境下凭据是否可用。
 *
 * 缺 ADMIN_SECRET / ADMIN_PASSWORD 时，后台会静默退回到弱默认值
 * （INAUE-ADMIN），等于把管理后台暴露在公网上。这里直接判定为不可用，
 * 让登录接口返回 503 而不是放行。
 */
export function adminCredentialsReady(): boolean {
  if (!isProduction()) return true;
  const s = process.env.ADMIN_SECRET;
  const p = process.env.ADMIN_PASSWORD;
  if (!s || !p) return false;
  if (s === DEV_SECRET) return false;
  if (s.length < 16) return false;
  if (p.length < 8) return false;
  return true;
}

export function checkPassword(input: string): boolean {
  if (!adminCredentialsReady()) return false;
  const expected = Buffer.from(adminPassword());
  const actual = Buffer.from(input ?? '');
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const signature = createHmac('sha256', secret()).update(String(expires)).digest('hex');
  return `${expires}.${signature}`;
}

export function verifySessionToken(value: string | undefined): boolean {
  // 生产环境凭据没配好时，一律视为未登录——否则默认弱密钥签出的
  // cookie 会被任何人生成，等于后台完全失守。
  if (!adminCredentialsReady()) return false;
  if (!value) return false;
  const [expiresRaw, signature] = value.split('.');
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now() || !signature) return false;
  const expected = createHmac('sha256', secret()).update(String(expires)).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}
