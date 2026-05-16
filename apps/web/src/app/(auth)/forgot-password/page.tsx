'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Field, Input } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <Card>
      <h1 style={{ margin: 0, fontSize: 'var(--font-size-h1)', fontWeight: 800 }}>Reset password</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        We&apos;ll email you a secure link to set a new password.
      </p>
      {sent ? (
        <p
          style={{
            background: 'var(--color-success)',
            color: 'var(--color-success-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginTop: 'var(--space-4)',
            fontWeight: 700,
          }}
        >
          Email sent. Check your inbox.
        </p>
      ) : (
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
            Send reset link
          </Button>
        </form>
      )}
      <p style={{ marginTop: 'var(--space-5)', fontSize: 'var(--font-size-caption)' }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </Card>
  );
}
