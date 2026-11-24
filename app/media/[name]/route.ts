import { readUpload } from '@/lib/admin/uploads';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = await readUpload(name);

  if (!file) {
    return new Response('Not found', { status: 404 });
  }

  const headers: Record<string, string> = {
    'Content-Type': file.type,
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
  // Blob 代理不总能给出长度，这时不要硬塞一个错的 Content-Length，
  // 否则浏览器会把响应截断成图片损坏。
  if (file.size > 0) {
    headers['Content-Length'] = String(file.size);
  }

  return new Response(file.body, { headers });
}
