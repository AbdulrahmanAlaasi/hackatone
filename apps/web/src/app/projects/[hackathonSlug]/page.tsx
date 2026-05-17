import { notFound } from 'next/navigation';
import {
  Badge,
  Card,
  Container,
  Display,
  EmptyState,
  Eyebrow,
  Hero,
  Icon,
} from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PublicGalleryPage({
  params,
}: {
  params: Promise<{ hackathonSlug: string }>;
}) {
  const { hackathonSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, title, slug, public_gallery_enabled, organizations(name, logo_url)')
    .eq('slug', hackathonSlug)
    .maybeSingle();
  if (!hackathon) notFound();

  if (!(hackathon as any).public_gallery_enabled) {
    return (
      <main>
        <Hero tone="cream">
          <Eyebrow>Coming soon</Eyebrow>
          <Display>{hackathon.title}</Display>
        </Hero>
        <Container size="form">
          <Card tone="cream" style={{ marginTop: 'var(--space-8)' }}>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              The project gallery for this hackathon hasn&apos;t been opened to the public yet.
            </p>
          </Card>
        </Container>
      </main>
    );
  }

  const { data: submissionsRaw } = await supabase
    .from('submissions')
    .select(
      'id, title, description, ai_summary, github_url, demo_url, video_url, screenshot_urls, hackathon_tracks(name), teams(name)',
    )
    .eq('hackathon_id', hackathon.id)
    .in('status', ['submitted', 'locked'])
    .order('submitted_at', { ascending: false });

  const submissions = (submissionsRaw ?? []) as unknown as Array<{
    id: string;
    title: string;
    description: string | null;
    ai_summary: string | null;
    github_url: string | null;
    demo_url: string | null;
    video_url: string | null;
    screenshot_urls: string[] | null;
    hackathon_tracks: { name: string } | null;
    teams: { name: string } | null;
  }>;

  const org = (hackathon as any).organizations as { name: string; logo_url: string | null } | null;

  return (
    <main>
      <Hero tone="sunrise">
        {org ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {org.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo_url} alt={org.name} style={{ width: 36, height: 36, borderRadius: 10, background: '#fff' }} />
            ) : null}
            <span
              style={{
                color: 'rgba(255,255,255,0.92)',
                fontWeight: 800,
                fontSize: 'var(--font-size-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {org.name}
            </span>
          </div>
        ) : null}
        <Eyebrow light>Project gallery</Eyebrow>
        <Display light>{hackathon.title}</Display>
        <p style={{ color: 'rgba(255,255,255,0.95)', marginTop: 'var(--space-3)' }}>
          {submissions.length} project{submissions.length === 1 ? '' : 's'} built during this hackathon.
        </p>
      </Hero>

      <Container>
        <section style={{ padding: 'var(--space-8) 0' }}>
          {submissions.length === 0 ? (
            <EmptyState title="No projects yet" body="Submitted projects will appear here once the hackathon is underway." />
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 'var(--space-5)',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              }}
            >
              {submissions.map((s) => (
                <article
                  key={s.id}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 24,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                  }}
                  className="project-card"
                >
                  {s.screenshot_urls && s.screenshot_urls.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.screenshot_urls[0]}
                      alt={s.title}
                      style={{ width: '100%', height: 160, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 160,
                        background: 'linear-gradient(135deg, #FFE5CC, #FFB689)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon.Rocket size={42} />
                    </div>
                  )}
                  <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'grid', gap: 8, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>{s.title}</h3>
                      {s.hackathon_tracks?.name ? (
                        <Badge tone="cream">{s.hackathon_tracks.name}</Badge>
                      ) : null}
                    </div>
                    {s.teams?.name ? (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--color-text-muted)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        by {s.teams.name}
                      </p>
                    ) : null}
                    <p style={{ margin: '4px 0 0', color: 'var(--color-text)', lineHeight: 1.55 }}>
                      {s.ai_summary || s.description?.slice(0, 220) + (s.description && s.description.length > 220 ? '…' : '') || 'No description.'}
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {s.demo_url ? (
                        <a href={s.demo_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 'var(--font-size-caption)' }}>
                          Demo →
                        </a>
                      ) : null}
                      {s.github_url ? (
                        <a href={s.github_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 'var(--font-size-caption)' }}>
                          GitHub →
                        </a>
                      ) : null}
                      {s.video_url ? (
                        <a href={s.video_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 'var(--font-size-caption)' }}>
                          Video →
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </Container>

      <style>{`
        .project-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43, 43, 43, 0.08); }
      `}</style>
    </main>
  );
}
