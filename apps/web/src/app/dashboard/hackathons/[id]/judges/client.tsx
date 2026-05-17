'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input } from '@/components/ui';

export function InviteJudgeForm({ hackathonId }: { hackathonId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(() => {
          void (async () => {
            const res = await fetch('/api/judges/invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hackathonId, email }),
            }).then((r) => r.json());

            if (!res.ok) {
              setMsg({ kind: 'err', text: res.error });
              return;
            }
            setMsg({
              kind: 'ok',
              text: res.isNew
                ? `Invite sent to ${email}. They'll receive an email to set up their account and start judging.`
                : `${email} already has an account — added as judge.`,
            });
            setEmail('');
            router.refresh();
          })();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: '2fr auto', alignItems: 'end', marginTop: 'var(--space-3)' }}
    >
      <Field label="Judge email" htmlFor="j-email">
        <Input
          id="j-email"
          type="email"
          required
          placeholder="judge@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value.toLowerCase()); setMsg(null); }}
        />
      </Field>
      <Button type="submit" loading={pending}>Send invite</Button>
      {msg && (
        <p style={{
          gridColumn: '1 / -1',
          fontWeight: 700,
          fontSize: 14,
          color: msg.kind === 'ok' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
          background: msg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-warning)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          margin: 0,
        }}>
          {msg.text}
        </p>
      )}
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
            await fetch('/api/judges/remove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hackathonId, assignmentId }),
            });
            router.refresh();
          })();
        })
      }
    >
      Remove
    </Button>
  );
}
