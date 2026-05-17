'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, Field, Input } from '@/components/ui';

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

function SkillPill({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      background: 'var(--color-surface-soft)',
      padding: '2px 8px',
      borderRadius: 999,
      color: 'var(--color-primary-pressed)',
    }}>
      {label}
    </span>
  );
}

function ParticipantRow({ p, teamLabel }: { p: Participant; teamLabel?: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 'var(--font-size-body)' }}>{p.full_name}</strong>
          {teamLabel && (
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 999,
            }}>
              {teamLabel}
            </span>
          )}
        </div>
        {p.ai_summary && (
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.5 }}>
            {p.ai_summary}
          </p>
        )}
        {p.ai_skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {p.ai_skills.slice(0, 6).map((s) => <SkillPill key={s} label={s} />)}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>
        {p.ai_level
          ? <Badge tone={LEVEL_TONE[p.ai_level]}>{p.ai_level}</Badge>
          : <Badge tone="neutral">no CV</Badge>
        }
      </div>
    </div>
  );
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
  const defaultTeamCount = Math.max(1, Math.ceil(participants.length / Math.max(minSize, Math.min(4, maxSize))));
  const [teamCount, setTeamCount] = useState(defaultTeamCount);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [applied, setApplied] = useState(false);

  // Sort strongest first; unanalyzed appended last
  const sorted = useMemo(() =>
    [...participants].sort(
      (a, b) => (b.ai_level ? LEVEL_RANK[b.ai_level] : 0) - (a.ai_level ? LEVEL_RANK[a.ai_level] : 0)
    ),
    [participants]
  );

  const teams = useMemo(() => snakeDraft(sorted, Math.max(1, teamCount)), [sorted, teamCount]);

  // Map user_id → team label for the participant roster
  const teamLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    teams.forEach((members, i) => {
      members.forEach((m) => { map[m.user_id] = `Team ${i + 1}`; });
    });
    return map;
  }, [teams]);

  function apply() {
    setMsg(null);
    start(() => {
      void (async () => {
        const payload = teams.map((members, i) => ({
          name: `Team ${i + 1}`,
          memberUserIds: members.map((m) => m.user_id),
        }));
        const res = await fetch('/api/teams/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hackathonId, teams: payload, reset: true }),
        }).then((r) => r.json());
        if (!res.ok) {
          setMsg({ kind: 'err', text: res.error ?? 'Something went wrong.' });
        } else {
          setMsg({ kind: 'ok', text: `${res.created} team${res.created === 1 ? '' : 's'} created successfully.` });
          setApplied(true);
          router.refresh();
        }
      })();
    });
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>

      {/* ── Participant roster ── */}
      <Card>
        <h3 style={{ margin: '0 0 4px', fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
          Accepted participants
        </h3>
        <p style={{ margin: '0 0 12px', color: 'var(--color-text-muted)', fontSize: 13 }}>
          Each participant is shown with their AI-extracted skill level and summary from their CV.
          The colored tag shows which team they'll be assigned to.
        </p>
        {sorted.map((p) => (
          <ParticipantRow key={p.user_id} p={p} teamLabel={teamLabelMap[p.user_id]} />
        ))}
      </Card>

      {/* ── Team config + apply ── */}
      <Card>
        <h3 style={{ margin: '0 0 12px', fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
          Configure & apply
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Field label="Number of teams" htmlFor="tc" style={{ width: 160 }}>
            <Input
              id="tc"
              type="number"
              min={1}
              max={participants.length}
              value={teamCount}
              onChange={(e) => {
                setApplied(false);
                setMsg(null);
                setTeamCount(Math.max(1, Math.min(participants.length, +e.target.value)));
              }}
            />
          </Field>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, paddingBottom: 10, margin: 0 }}>
            ~{Math.ceil(participants.length / Math.max(1, teamCount))} members per team
          </p>
          <Button onClick={apply} loading={pending} style={{ marginBottom: 2 }}>
            {applied ? 'Re-apply (recreate teams)' : 'Apply (create teams)'}
          </Button>
        </div>

        {msg && (
          <p style={{
            marginTop: 12,
            background: msg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-warning)',
            color: msg.kind === 'ok' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: 14,
          }}>
            {msg.text}
          </p>
        )}
      </Card>

      {/* ── Team preview cards ── */}
      <h3 style={{ margin: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
        Suggested team layout
      </h3>
      <div style={{
        display: 'grid',
        gap: 'var(--space-3)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      }}>
        {teams.map((members, i) => (
          <Card key={i}>
            <h4 style={{ margin: '0 0 2px', fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
              Team {i + 1}
            </h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 0, marginBottom: 12 }}>
              {members.length} member{members.length === 1 ? '' : 's'}
            </p>
            {members.map((m) => (
              <div key={m.user_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: 14 }}>{m.full_name}</strong>
                  {m.ai_skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                      {m.ai_skills.slice(0, 4).map((s) => <SkillPill key={s} label={s} />)}
                    </div>
                  )}
                </div>
                {m.ai_level
                  ? <Badge tone={LEVEL_TONE[m.ai_level]}>{m.ai_level}</Badge>
                  : <Badge tone="neutral">no CV</Badge>
                }
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
