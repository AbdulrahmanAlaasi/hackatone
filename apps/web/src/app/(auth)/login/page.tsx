'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Field, Input } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <Card>
      <h1 style={{ margin: 0, fontSize: 'var(--font-size-h1)', fontWeight: 800 }}>Welcome back</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        Sign in to your Hackatone account.
      </p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error ? (
          <p
            role="alert"
            style={{
              background: 'var(--color-warning)',
              color: 'var(--color-warning-text)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 700,
              margin: 0,
            }}
          >
            {error}
          </p>
        ) : null}
        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>
      <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-caption)' }}>
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/signup">Create an account</Link>
      </div>
    </Card>
  );
}
