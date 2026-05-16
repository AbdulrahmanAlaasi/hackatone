import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, CardTitle } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string; submissionId: string };
}) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: sub } = await supabase
    .from('submissions')
    .select(
      'id, title, description, status, submitted_at, github_url, demo_url, presentation_url, video_url, screenshot_urls, teams(id, name, team_members(profiles(full_name, email))), hackathon_tracks(name)',
    )
    .eq('id', params.submissionId)
    .eq('hackathon_id', params.id)
    .maybeSingle();

  if (!sub) notFound();

  const team = sub.teams as any;
  const members = (team?.team_members ?? []) as Array<{ profiles: { full_name: string; email: string } | null }>;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
      <Card>
        <Link
          href={`/dashboard/hackathons/${params.id}/submissions`}
          style={{ fontSize: 'var(--font-size-caption)' }}
        >
          ← All submissions
        </Link>
        <h2 style={{ margin: '8px 0 12px', fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>
          {sub.title}
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <Badge tone={sub.status === 'submitted' ? 'success' : 'info'}>{sub.status}</Badge>
          {(sub.hackathon_tracks as any)?.name ? <Badge tone="secondary">{(sub.hackathon_tracks as any).name}</Badge> : null}
        </div>
        {sub.description ? (
          <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text)' }}>{sub.description}</p>
        ) : null}

        <div style={{ marginTop: 'var(--space-5)', display: 'grid', gap: 'var(--space-2)' }}>
          {sub.github_url ? <LinkRow label="GitHub" href={sub.github_url} /> : null}
          {sub.demo_url ? <LinkRow label="Demo" href={sub.demo_url} /> : null}
          {sub.presentation_url ? <LinkRow label="Presentation" href={sub.presentation_url} /> : null}
          {sub.video_url ? <LinkRow label="Video" href={sub.video_url} /> : null}
        </div>

        {sub.screenshot_urls && sub.screenshot_urls.length > 0 ? (
          <div style={{ marginTop: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>Screenshots</h3>
            <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginTop: 'var(--space-2)' }}>
              {sub.screenshot_urls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`Screenshot ${i + 1}`}
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card>
        <CardTitle>Team</CardTitle>
        <p style={{ marginTop: 'var(--space-2)', fontWeight: 700 }}>{team?.name ?? '—'}</p>
        <ul style={{ paddingLeft: '1.2em', marginTop: 'var(--space-2)' }}>
          {members.map((m, i) => (
            <li key={i} style={{ marginBottom: 'var(--space-1)' }}>
              {m.profiles?.full_name ?? '—'} <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>· {m.profiles?.email}</span>
            </li>
          ))}
        </ul>
        {sub.submitted_at ? (
          <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}>
            Submitted {new Date(sub.submitted_at).toLocaleString()}
          </p>
        ) : null}
      </Card>
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <strong style={{ width: 120 }}>{label}:</strong>
      <a href={href} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>
        {href}
      </a>
    </div>
  );
}
