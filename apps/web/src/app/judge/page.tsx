import Link from 'next/link';
import {
  Badge,
  Card,
  Display,
  EmptyState,
  Eyebrow,
  Icon,
} from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';

export default async function JudgeHomePage() {
  const { supabase, user } = await getCurrentUserOrRedirect();

  // Hackathons this user is assigned to judge
  const { data: assignments } = await supabase
    .from('judge_assignments')
    .select('hackathon_id, submission_id, hackathons(id, title, slug, status, starts_at, ends_at, organizations(name, logo_url))')
    .eq('judge_id', user.id);

  const byHackathon = new Map<string, {
    id: string;
    title: string;
    slug: string;
    status: string;
    starts_at: string | null;
    org_name: string | null;
    org_logo: string | null;
    assignedSubmissions: number;
    allSubs: boolean;
  }>();
  for (const a of assignments ?? []) {
    const h = (a as any).hackathons;
    if (!h) continue;
    const cur = byHackathon.get(h.id) ?? {
      id: h.id,
      title: h.title,
      slug: h.slug,
      status: h.status,
      starts_at: h.starts_at,
      org_name: h.organizations?.name ?? null,
      org_logo: h.organizations?.logo_url ?? null,
      assignedSubmissions: 0,
      allSubs: false,
    };
    if ((a as any).submission_id) cur.assignedSubmissions += 1;
    else cur.allSubs = true;
    byHackathon.set(h.id, cur);
  }
  const hackathons = Array.from(byHackathon.values());

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div>
        <Eyebrow>Welcome</Eyebrow>
        <Display>Judging panel</Display>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 640, marginTop: 'var(--space-2)' }}>
          Pick a hackathon to start scoring. The AI gives you a project summary for each
          submission so you can focus on the rubric.
        </p>
      </div>

      {hackathons.length === 0 ? (
        <EmptyState title="No assignments yet" body="Organizers will see your account here when they add you as a judge." />
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-4)',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {hackathons.map((h) => (
            <Link
              key={h.id}
              href={`/judge/${h.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {h.org_logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.org_logo} alt={h.org_name ?? ''} style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                      {(h.org_name ?? '?').slice(0, 1)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>{h.title}</h3>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h.org_name ?? '—'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Badge tone="info">{h.status.replace('_', ' ')}</Badge>
                  <Badge tone="cream">
                    {h.allSubs ? 'All submissions' : `${h.assignedSubmissions} assigned`}
                  </Badge>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-primary-pressed)', fontWeight: 800, fontSize: 'var(--font-size-caption)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Start scoring <Icon.ChevronRight size={14} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
