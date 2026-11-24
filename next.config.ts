import type { NextConfig } from 'next';

/**
 * Vercel 与自建服务器用不同的输出模式：
 *
 * - Vercel：用自己的构建器接管运行，不能开 `output: 'standalone'`，
 *   否则构建产物的路由布局与 Vercel 预期不符，表现为「构建成功但全站 404」。
 * - 自建服务器 / Docker：需要 `standalone`，才能打出精简独立运行包
 *   （见 scripts/deploy-selfhosted.sh）。
 *
 * Vercel 在构建时会注入 `VERCEL=1`，用这个变量区分两种目标。
 */
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
};

export default nextConfig;
