'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, Field, Input } from '@/components/ui';
import { applyBalancedTeams } from './actions';

interface Participant {
  registration_id: string;
  user_id: string;
  full_name: string;
  email: string;
  ai_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  ai_skills: string[];
  ai_strengths: string[];
  ai_summary: string | null;
}

const LEVEL_RANK: Record<NonNullable<Participant['ai_level']>, number> = {
  expert: 4,
  advanced: 3,
  intermediate: 2,
  beginner: 1,
};
const LEVEL_TONE: Record<NonNullable<Participant['ai_level']>, 'success' | 'info' | 'warning' | 'neutral'> = {
  expert: 'success',
  advanced: 'success',
  intermediate: 'info',
  beginner: 'warning',
};

// Snake-draft N participants into K teams. Participants are pre-sorted strongest-first.
function snakeDraft<T>(items: T[], teamCount: number): T[][] {
  const teams: T[][] = Array.from({ length: teamCount }, () => []);
  let idx = 0;
  let dir = 1;
  for (const item of items) {
    teams[idx]!.push(item);
    if (idx + dir < 0 || idx + dir >= teamCount) dir = -dir;
    else idx += dir;
  }
  return teams;
}

export function TeamBalancerPanel({
  hackathonId,
  minSize,
  maxSize,
  participants,
}: {
  hackathonId: string;
  minSize: number;
  maxSize: number;
  participants: Participant[];
}) {
  const router = useRouter();
  const [targetSize, setTargetSize] = useState(Math.max(minSize, Math.min(4, maxSize)));
  const [namePrefix, setNamePrefix] = useState('Team');
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const teams = useMemo(() => {
    if (participants.length === 0) return [];
    const teamCount = Math.max(1, Math.ceil(participants.length / targetSize));
    // Strongest first; un-analyzed (null) treated as 0 — appended last
    const sorted = [...participants].sort(
      (a, b) => (b.ai_level ? LEVEL_RANK[b.ai_level] : 0) - (a.ai_level ? LEVEL_RANK[a.ai_level] : 0),
    );
    return snakeDraft(sorted, teamCount);
  }, [participants, targetSize]);

  async function apply() {
    setMsg(null);
    start(() => {
      void (async () => {
        const payload = teams.map((members, i) => ({
          name: `${namePrefix} ${i + 1}`,
          memberUserIds: members.map((m) => m.user_id),
        }));
        const res = await applyBalancedTeams(hackathonId, payload);
        if (!res.ok) setMsg({ kind: 'err', text: res.error });
        else {
          setMsg({ kind: 'ok', text: `Created ${res.created} team${res.created === 1 ? '' : 's'}.` });
          router.refresh();
        }
      })();
    });
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'auto 1fr 1fr auto', alignItems: 'end' }}>
          <Field label={`Team size (${minSize}-${maxSize})`} htmlFor="ts">
            <Input
              id="ts"
              type="number"
              min={minSize}
              max={maxSize}
              value={targetSize}
              onChange={(e) => setTargetSize(Math.max(minSize, Math.min(maxSize, +e.target.value)))}
            />
          </Field>
          <Field label="Team name prefix" htmlFor="np">
            <Input id="np" value={namePrefix} onChange={(e) => setNamePrefix(e.target.value)} />
          </Field>
          <div style={{ color: 'var(--color-text-muted)', paddingBottom: 12 }}>
            Suggested: <strong>{teams.length}</strong> team{teams.length === 1 ? '' : 's'}
          </div>
          <Button onClick={apply} loading={pending}>
            Apply (create teams)
          </Button>
        </div>
        {msg ? (
          <p
            style={{
              marginTop: 'var(--space-3)',
              background: msg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-warning)',
              color: msg.kind === 'ok' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
            }}
          >
            {msg.text}
          </p>
        ) : null}
      </Card>

      <div
        style={{
          display: 'grid',
          gap: 'var(--space-3)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {teams.map((members, i) => (
          <Card key={i}>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
              {namePrefix} {i + 1}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)', marginTop: 4 }}>
              {members.length} member{members.length === 1 ? '' : 's'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-3) 0 0', display: 'grid', gap: 'var(--space-2)' }}>
              {members.map((m) => (
                <li
                  key={m.user_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 'var(--space-2)',
                    paddingBottom: 'var(--space-2)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong>{m.full_name}</strong>
                    {m.ai_summary ? (
                      <p
                        style={{
                          margin: '2px 0 0',
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--font-size-caption)',
                          lineHeight: 1.4,
                        }}
                      >
                        {m.ai_summary}
                      </p>
                    ) : null}
                    {m.ai_skills.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {m.ai_skills.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              background: 'var(--color-surface-soft)',
                              padding: '2px 8px',
                              borderRadius: 999,
                              color: 'var(--color-primary-pressed)',
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {m.ai_level ? (
                    <Badge tone={LEVEL_TONE[m.ai_level]}>{m.ai_level}</Badge>
                  ) : (
                    <Badge tone="neutral">no CV</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
