import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { storageDriver } from '@/lib/storefront/db';

export const UPLOAD_DIR = path.join(process.cwd(), '.data', 'uploads');
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

const TYPE_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

const SAFE_NAME = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif|avif)$/;

export type UploadResult = { ok: true; url: string; name: string } | { ok: false; error: string };

const blobPathFor = (name: string) => `uploads/${name}`;

export async function saveUpload(file: File): Promise<UploadResult> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return { ok: false, error: 'UNSUPPORTED_TYPE' };
  if (file.size <= 0) return { ok: false, error: 'EMPTY_FILE' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'FILE_TOO_LARGE' };

  const name = `${randomUUID().slice(0, 8)}-${Date.now().toString(36)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (storageDriver() === 'blob') {
    const { put } = await import('@vercel/blob');
    // 存储用的 Blob store 是 private 的（订单等 JSON 里含姓名、电话、地址，
    // 放 public store 等于直接对外裸奔）。private store 不接受 public 写入，
    // 所以图片同样存 private，再由 /media 路由代理输出。
    await put(blobPathFor(name), buffer, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: file.type,
    });
    // 对外仍然只暴露本站路径，不把 Blob 的直链（可能带签名）写进商品数据。
    return { ok: true, url: `/media/${name}`, name };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);

  return { ok: true, url: `/media/${name}`, name };
}

export type UploadPayload = {
  body: ReadableStream<Uint8Array>;
  type: string;
  size: number;
};

export async function readUpload(name: string): Promise<UploadPayload | null> {
  if (!SAFE_NAME.test(name)) return null;
  const ext = name.split('.').pop()!.toLowerCase();
  const type = TYPE_BY_EXT[ext] ?? 'application/octet-stream';

  if (storageDriver() === 'blob') {
    try {
      const { get } = await import('@vercel/blob');
      const result = await get(blobPathFor(name), { access: 'private' });
      if (!result || result.statusCode !== 200) return null;
      return {
        body: result.stream,
        type: result.blob.contentType || type,
        size: result.blob.size ?? 0,
      };
    } catch {
      return null;
    }
  }

  try {
    const buffer = await fs.readFile(path.join(UPLOAD_DIR, name));
    const copy = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    return {
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(copy));
          controller.close();
        },
      }),
      size: copy.byteLength,
      type,
    };
  } catch {
    return null;
  }
}
