import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Badge, Card, CardTitle } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { RowActions } from '../RowActions';

export default async function ParticipantDetailPage({
  params,
}: {
  params: { id: string; regId: string };
}) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: reg } = await supabase
    .from('registrations')
    .select(
      'id, full_name, email, phone, organization_or_company, major_or_job_title, skill_level, skills, github_url, portfolio_url, team_preference, status, decision_note, decided_at, checked_in_at, qr_token, created_at, hackathon_tracks(name)',
    )
    .eq('id', params.regId)
    .eq('hackathon_id', params.id)
    .maybeSingle();

  if (!reg) notFound();

  const trackName = (reg.hackathon_tracks as any)?.name;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
      <Card>
        <Link href={`/dashboard/hackathons/${params.id}/participants`} style={{ fontSize: 'var(--font-size-caption)' }}>
          ← All participants
        </Link>
        <h2 style={{ margin: '8px 0 12px', fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>{reg.full_name}</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <Badge tone="info">{reg.status}</Badge>
          {reg.checked_in_at ? <Badge tone="success">Checked in</Badge> : null}
          {trackName ? <Badge tone="secondary">{trackName}</Badge> : null}
        </div>

        <Detail label="Email" value={reg.email} />
        <Detail label="Phone" value={reg.phone ?? '—'} />
        <Detail label="Org / company" value={reg.organization_or_company ?? '—'} />
        <Detail label="Major / title" value={reg.major_or_job_title ?? '—'} />
        <Detail label="Skill level" value={reg.skill_level ?? '—'} />
        <Detail
          label="Skills"
          value={reg.skills && reg.skills.length ? reg.skills.join(', ') : '—'}
        />
        <Detail label="GitHub / portfolio" value={reg.github_url ?? reg.portfolio_url ?? '—'} />
        <Detail label="Team preference" value={reg.team_preference ?? '—'} />
        <Detail label="Registered" value={new Date(reg.created_at).toLocaleString()} />
        {reg.decision_note ? <Detail label="Decision note" value={reg.decision_note} /> : null}
      </Card>

      <Card>
        <CardTitle>Actions</CardTitle>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <RowActions
            hackathonId={params.id}
            registrationId={reg.id}
            status={reg.status as any}
            checkedIn={!!reg.checked_in_at}
          />
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-4) 0' }} />
        <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
          Participant QR token (used for check-in):
        </p>
        <code
          style={{
            display: 'block',
            wordBreak: 'break-all',
            background: 'var(--color-background)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-caption)',
          }}
        >
          {reg.qr_token}
        </code>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 'var(--space-3)', padding: 'var(--space-2) 0' }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)', fontWeight: 700 }}>
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
