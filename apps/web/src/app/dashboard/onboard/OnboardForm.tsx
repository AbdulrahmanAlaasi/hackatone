'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input } from '@/components/ui';
import { createOrganization } from './actions';

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function OnboardForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(() => {
          void (async () => {
            const res = await createOrganization({ name, slug: slug || toSlug(name) });
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.replace('/dashboard');
            router.refresh();
          })();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-4)' }}
    >
      <Field label="Organization name" htmlFor="name">
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slug) setSlug(toSlug(e.target.value));
          }}
        />
      </Field>
      <Field label="URL slug" htmlFor="slug" hint="Used inside the dashboard. Lowercase, dashes only.">
        <Input
          id="slug"
          required
          pattern="[a-z0-9-]+"
          value={slug}
          onChange={(e) => setSlug(toSlug(e.target.value))}
        />
      </Field>
      {error ? <p style={{ color: 'var(--color-warning-text)', fontWeight: 700 }}>{error}</p> : null}
      <Button type="submit" loading={pending}>
        Create organization
      </Button>
    </form>
  );
}
