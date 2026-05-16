'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Textarea } from '@/components/ui';
import { createAnnouncement } from './actions';

export function AnnouncementForm({ hackathonId }: { hackathonId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await createAnnouncement(hackathonId, title, body);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setTitle('');
          setBody('');
          router.refresh();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}
    >
      <Field label="Title" htmlFor="a-title">
        <Input id="a-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Body" htmlFor="a-body">
        <Textarea id="a-body" required value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      {error ? <p style={{ color: 'var(--color-warning-text)', fontWeight: 700 }}>{error}</p> : null}
      <div>
        <Button type="submit" loading={pending}>Post announcement</Button>
      </div>
    </form>
  );
}
