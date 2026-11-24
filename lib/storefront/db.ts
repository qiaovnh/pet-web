import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_DIR = path.join(process.cwd(), '.data');

export type StorageDriver = 'local' | 'blob';

export function storageDriver(): StorageDriver {
  if (process.env.STORAGE_DRIVER === 'blob') return 'blob';
  if (process.env.STORAGE_DRIVER === 'local') return 'local';
  // Vercel Blob 有两套凭据模型：
  //   1) 静态 read-write token —— BLOB_READ_WRITE_TOKEN
  //   2) OIDC 自动轮转        —— VERCEL_OIDC_TOKEN + BLOB_STORE_ID
  // 项目用 CLI `storage connect --auth oidc --add-rw-token` 连接时两个都会注入，
  // 但只勾 OIDC 的连接就只有 BLOB_STORE_ID，两种都要认。
  return process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID ? 'blob' : 'local';
}

/* ------------------------------------------------------------------ *
 * 本地文件驱动：.data/*.json，写临时文件再 rename。
 * Vercel 的函数文件系统是只读的，写入会失败——此时退化为内存模式，
 * 让站点仍能正常浏览（数据不持久化），而不是直接 500。
 * ------------------------------------------------------------------ */
const memory = new Map<string, unknown>();
let warnedReadOnly = false;

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function localRead<T>(name: string, fallback: T): Promise<T> {
  if (memory.has(name)) return memory.get(name) as T;
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, name), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function localWrite(name: string, value: unknown): Promise<void> {
  try {
    await ensureDir();
    const target = path.join(DATA_DIR, name);
    const temp = `${target}.${process.pid}.${randomUUID().slice(0, 8)}.tmp`;
    await fs.writeFile(temp, JSON.stringify(value, null, 2), 'utf8');
    try {
      await fs.rename(temp, target);
    } catch (error) {
      await fs.rm(temp, { force: true }).catch(() => {});
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code ?? '';
    if (['EROFS', 'EACCES', 'EPERM', 'ENOENT'].includes(code)) {
      memory.set(name, value);
      if (!warnedReadOnly) {
        warnedReadOnly = true;
        console.warn(
          '[storage] 文件系统不可写（Vercel 只读），已切换到内存模式：数据不会持久化。' +
            ' 生产部署请设置 STORAGE_DRIVER=blob 或接入数据库。',
        );
      }
      return;
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * Vercel Blob 驱动：所有内容（JSON 文档 + 上传的图片）都存私有 blob。
 * 存储用的 store 必须是 private——订单 JSON 里含姓名、电话、地址，
 * 放 public store 等于把 PII 直接对外裸奔。
 * 图片对外通过 /media 路由代理输出。
 * ------------------------------------------------------------------ */
async function blobRead<T>(name: string, fallback: T): Promise<T> {
  try {
    const { get } = await import('@vercel/blob');
    const result = await get(`data/${name}`, { access: 'private' });
    if (!result || result.statusCode !== 200) return fallback;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function blobWrite(name: string, value: unknown): Promise<void> {
  const { put } = await import('@vercel/blob');
  await put(`data/${name}`, JSON.stringify(value), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

/* ------------------------------------------------------------------ */

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  return storageDriver() === 'blob' ? blobRead(name, fallback) : localRead(name, fallback);
}

export async function writeJson(name: string, value: unknown): Promise<void> {
  return storageDriver() === 'blob' ? blobWrite(name, value) : localWrite(name, value);
}

type Store<T> = Record<string, T>;

export async function readStore<T>(name: string): Promise<Store<T>> {
  return readJson<Store<T>>(name, {});
}

export async function writeStore<T>(name: string, store: Store<T>): Promise<void> {
  await writeJson(name, store);
}

export const DATA_DIR_PATH = DATA_DIR;
