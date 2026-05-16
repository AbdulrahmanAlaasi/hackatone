'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Field, Input, SearchBar } from '@/components/ui';
import { checkInById, checkInByToken, undoCheckIn } from '../participants/actions';

type Accepted = {
  id: string;
  full_name: string;
  email: string;
  organization_or_company: string | null;
  checked_in_at: string | null;
};

export function TokenForm({ hackathonId }: { hackathonId: string }) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(() => {
          void (async () => {
            const res = await checkInByToken(hackathonId, token);
            if (!res.ok) {
              setMsg({ kind: 'err', text: res.error });
              return;
            }
            setMsg({
              kind: 'ok',
              text: res.alreadyCheckedIn ? `${res.name} was already checked in.` : `Checked in ${res.name}.`,
            });
            setToken('');
            router.refresh();
          })();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}
    >
      <Field label="QR token" htmlFor="qrt">
        <Input
          id="qrt"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste token from participant's QR"
          autoFocus
        />
      </Field>
      <Button type="submit" loading={pending}>
        Check in
      </Button>
      {msg ? (
        <p
          style={{
            background: msg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-warning)',
            color: msg.kind === 'ok' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            margin: 0,
          }}
        >
          {msg.text}
        </p>
      ) : null}
    </form>
  );
}

export function ManualList({ hackathonId, accepted }: { hackathonId: string; accepted: Accepted[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return accepted.slice(0, 50);
    return accepted
      .filter(
        (r) =>
          r.full_name.toLowerCase().includes(needle) ||
          r.email.toLowerCase().includes(needle) ||
          (r.organization_or_company ?? '').toLowerCase().includes(needle),
      )
      .slice(0, 50);
  }, [accepted, q]);

  function act(fn: () => Promise<unknown>, id: string) {
    setPendingId(id);
    start(() => {
      void (async () => {
        await fn();
        setPendingId(null);
        router.refresh();
      })();
    });
  }

  return (
    <div style={{ marginTop: 'var(--space-3)' }}>
      <SearchBar value={q} onChange={setQ} placeholder="Search accepted participants…" />
      <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-3) 0 0', display: 'grid', gap: 'var(--space-2)' }}>
        {filtered.length === 0 ? (
          <li style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>No matches.</li>
        ) : (
          filtered.map((r) => (
            <li
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{r.full_name}</div>
                <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}>
                  {r.email}
                  {r.organization_or_company ? ` · ${r.organization_or_company}` : ''}
                </div>
              </div>
              {r.checked_in_at ? (
                <>
                  <Badge tone="success">Checked in</Badge>
                  <Button
                    variant="text"
                    loading={pendingId === r.id}
                    onClick={() => act(() => undoCheckIn(hackathonId, r.id), r.id)}
                  >
                    Undo
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  loading={pendingId === r.id}
                  onClick={() => act(() => checkInById(hackathonId, r.id), r.id)}
                >
                  Check in
                </Button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
