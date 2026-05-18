'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input } from '@/components/ui';

export function InviteJudgeForm({ hackathonId }: { hackathonId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ marginTop: 'var(--space-3)' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setLink(null);
          start(() => {
            void (async () => {
              const res = await fetch('/api/judges/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hackathonId, email }),
              }).then((r) => r.json());

              if (!res.ok) {
                setError(res.error);
                return;
              }
              setLink(res.link);
              setEmail('');
              router.refresh();
            })();
          });
        }}
        style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: '2fr auto', alignItems: 'end' }}
      >
        <Field label="Judge email" htmlFor="j-email">
          <Input
            id="j-email"
            type="email"
            required
            placeholder="judge@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value.toLowerCase()); setError(null); setLink(null); }}
          />
        </Field>
        <Button type="submit" loading={pending}>Send invite</Button>
      </form>

      {error && (
        <p style={{ marginTop: 10, fontWeight: 700, fontSize: 14, color: 'var(--color-warning-text)', background: 'var(--color-warning)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </p>
      )}

      {link && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-primary)' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 14 }}>
            Judge link generated — copy and send it to the judge:
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ flex: 1, fontSize: 12, background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-border)', wordBreak: 'break-all', color: 'var(--color-primary-pressed)' }}>
              {link}
            </code>
            <Button variant="secondary" onClick={() => copyLink(link)}>
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
            The judge opens this link directly — no login required. The link is unique to this judge.
          </p>
        </div>
      )}
    </div>
  );
}

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      onClick={() => {
        navigator.clipboard.writeText(link).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? 'Copied!' : 'Copy link'}
    </Button>
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
