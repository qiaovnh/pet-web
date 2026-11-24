import { requireAdmin } from '@/lib/admin/auth';
import { getSettings } from '@/lib/storefront/settings';
import { SettingsForm } from '@/components/admin/settings-form';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div>
      <header className="border-b border-line pb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">配置</p>
        <h1 className="mt-2 font-display text-[34px] leading-none">设置</h1>
        <p className="mt-2 max-w-lg text-[13px] text-muted">
          修改保存后立即作用于前台，无需重新构建。
        </p>
      </header>
      <div className="mt-8">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
