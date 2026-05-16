'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input } from '@/components/ui';
import { assignJudge, removeJudge } from './actions';

export function AssignJudgeForm({ hackathonId }: { hackathonId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(() => {
          void (async () => {
            const res = await assignJudge(hackathonId, email);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            setEmail('');
            router.refresh();
          })();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: '2fr auto', alignItems: 'end', marginTop: 'var(--space-3)' }}
    >
      <Field label="Judge email" htmlFor="j-email">
        <Input id="j-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
      </Field>
      <Button type="submit" loading={pending}>Assign</Button>
      {error ? <p style={{ gridColumn: '1 / -1', color: 'var(--color-warning-text)', fontWeight: 700 }}>{error}</p> : null}
    </form>
  );
}

export function RemoveJudgeButton({ hackathonId, assignmentId }: { hackathonId: string; assignmentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="text"
      loading={pending}
      onClick={() =>
        start(() => {
          void (async () => {
            await removeJudge(hackathonId, assignmentId);
            router.refresh();
          })();
        })
      }
    >
      Remove
    </Button>
  );
}
