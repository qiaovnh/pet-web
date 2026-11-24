import { requireAdmin } from '@/lib/admin/auth';
import { getContent } from '@/lib/storefront/content';
import { PagesEditor } from '@/components/admin/pages-editor';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  await requireAdmin();
  const content = await getContent();

  return (
    <div>
      <header className="border-b border-line pb-6">
        <p className="text-[10px] tracking-[0.2em] text-muted">内容</p>
        <h1 className="mt-2 font-display text-[34px] leading-none">页面管理</h1>
        <p className="mt-2 max-w-xl text-[13px] text-muted">
          管理首页 Banner 与站点导航。修改保存后前台立即生效，无需重新部署。
        </p>
      </header>
      <div className="mt-8">
        <PagesEditor initial={content} />
      </div>
    </div>
  );
}
