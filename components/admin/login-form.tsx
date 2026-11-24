'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = (await res.json()) as { ok: boolean };
    if (!json.ok) {
      setError('密码不正确，请重试。');
      setBusy(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <label htmlFor="password" className="eyebrow text-muted">
        管理密码
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2 w-full border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-ink"
        placeholder="••••••••"
      />
      {error && <p className="mt-3 text-[12px] text-tan-deep">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-solid mt-5 w-full text-white disabled:opacity-60">
        <span>{busy ? '验证中…' : '登录'}</span>
      </button>
      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        演示密码为 <code className="bg-sand/60 px-1 py-0.5">inaue-admin</code>，可通过环境变量{' '}
        <code className="bg-sand/60 px-1 py-0.5">ADMIN_PASSWORD</code> 修改。
      </p>
    </form>
  );
}
