'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input } from '@/components/ui';
import { addTrack, deleteTrack } from '../actions';

export function TracksEditor({ hackathonId }: { hackathonId: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await addTrack(hackathonId, name, description);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setName('');
          setDescription('');
          router.refresh();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-3)', gridTemplateColumns: '1fr 2fr auto', alignItems: 'end' }}
    >
      <Field label="Name" htmlFor="t-name">
        <Input id="t-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Description" htmlFor="t-desc">
        <Input id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Button type="submit" loading={pending}>Add</Button>
      {error ? <p style={{ gridColumn: '1 / -1', color: 'var(--color-warning-text)', fontWeight: 700 }}>{error}</p> : null}
    </form>
  );
}

export function DeleteTrackButton({ hackathonId, trackId }: { hackathonId: string; trackId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="text"
      loading={pending}
      onClick={() =>
        start(async () => {
          await deleteTrack(hackathonId, trackId);
          router.refresh();
        })
      }
    >
      Remove
    </Button>
  );
}
