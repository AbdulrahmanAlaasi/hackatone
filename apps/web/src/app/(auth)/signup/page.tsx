'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Field, Input } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.replace('/dashboard');
      router.refresh();
    } else {
      setNeedsConfirm(true);
    }
  }

  if (needsConfirm) {
    return (
      <Card>
        <h1 style={{ margin: 0, fontSize: 'var(--font-size-h1)', fontWeight: 800 }}>Check your email</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish creating your
          account.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 style={{ margin: 0, fontSize: 'var(--font-size-h1)', fontWeight: 800 }}>
        Create your account
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        Organizers, judges, and admins start here. Participants register from a hackathon page.
      </p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
        <Field label="Full name" htmlFor="name">
          <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
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
        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
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
          Create account
        </Button>
      </form>
      <p style={{ marginTop: 'var(--space-5)', fontSize: 'var(--font-size-caption)' }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </Card>
  );
}
