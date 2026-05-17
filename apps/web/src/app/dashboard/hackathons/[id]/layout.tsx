import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge, Container, Display, Eyebrow, Icon } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import styles from './layout.module.css';

type NavItem = { href: string; label: string; icon: keyof typeof Icon };
type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { href: '', label: 'Overview', icon: 'Home' },
      { href: '/qr-codes', label: 'QR & registration', icon: 'QrCode' },
    ],
  },
  {
    title: 'People',
    items: [
      { href: '/participants', label: 'Participants', icon: 'Users' },
      { href: '/check-in', label: 'Check-in', icon: 'Check' },
      { href: '/teams-ai', label: 'AI team balancer', icon: 'Sparkles' },
      { href: '/judges', label: 'Judges', icon: 'User' },
    ],
  },
  {
    title: 'Projects & judging',
    items: [
      { href: '/submissions', label: 'Submissions', icon: 'Rocket' },
      { href: '/scoring', label: 'Scoring', icon: 'Sparkles' },
      { href: '/leaderboard', label: 'Leaderboard', icon: 'Trophy' },
    ],
  },
  {
    title: 'Configure',
    items: [
      { href: '/tracks', label: 'Tracks', icon: 'ChevronRight' },
      { href: '/criteria', label: 'Judging criteria', icon: 'ChevronRight' },
      { href: '/announcements', label: 'Announcements', icon: 'MessageCircle' },
    ],
  },
];

export default async function HackathonLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await getCurrentUserOrRedirect();
  // `select('*')` is tolerant if migration 0010 hasn't been applied yet —
  // missing columns just come back undefined instead of failing the query.
  const { data: raw, error } = await supabase
    .from('hackathons')
    .select('*, organizations(name, logo_url)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    // Don't 404 on a real DB error — show a friendly message so the user knows what to do.
    return (
      <Container>
        <div style={{ padding: '64px 0' }}>
          <h1 style={{ margin: 0 }}>Couldn&apos;t load hackathon</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{error.message}</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>
            If you just ran migration 0010, also run{' '}
            <code>notify pgrst, &apos;reload schema&apos;;</code> in the Supabase SQL editor to
            refresh the schema cache.
          </p>
        </div>
      </Container>
    );
  }
  if (!raw) notFound();

  // Supabase's generated types don't yet include the columns added in migration 0010,
  // so we cast here. All new columns are optional — gracefully degrades if migration not run.
  const hackathon = raw as unknown as {
    id: string;
    title: string;
    slug: string;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    location: string | null;
    field?: string | null;
    visibility?: 'public' | 'private';
    organizations: { name: string; logo_url: string | null } | null;
  };
  const org = hackathon.organizations;
  const visibility = hackathon.visibility ?? 'private';
  const field = hackathon.field ?? null;

  return (
    <>
      <section className={styles.hero}>
        <Container>
          {org ? (
            <div className={styles.org}>
              {org.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.logo_url} alt={org.name} className={styles.orgLogo} />
              ) : (
                <div className={styles.orgLogoFallback}>{org.name.slice(0, 1)}</div>
              )}
              <span className={styles.orgName}>{org.name}</span>
            </div>
          ) : null}
          <Eyebrow>Hackathon</Eyebrow>
          <Display>{hackathon.title}</Display>
          <div className={styles.heroMeta}>
            <Badge tone={hackathon.status === 'active' ? 'success' : 'info'}>{hackathon.status}</Badge>
            <Badge tone={visibility === 'public' ? 'success' : 'neutral'}>
              {visibility === 'public' ? 'Public' : 'Private'}
            </Badge>
            {field ? <Badge tone="cream">{field}</Badge> : null}
            {hackathon.location ? (
              <span className={styles.metaChip}>
                <Icon.Pin size={14} /> {hackathon.location}
              </span>
            ) : null}
            {hackathon.starts_at ? (
              <span className={styles.metaChip}>
                <Icon.Calendar size={14} /> {new Date(hackathon.starts_at).toLocaleDateString()}
              </span>
            ) : null}
            <code className={styles.slug}>/{hackathon.slug}</code>
          </div>
        </Container>
      </section>

      <Container>
        <div className={styles.shell}>
          <aside className={styles.sidebar}>
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className={styles.group}>
                <p className={styles.groupTitle}>{group.title}</p>
                {group.items.map((item) => {
                  const IconCmp = Icon[item.icon];
                  return (
                    <Link
                      key={item.href || 'root'}
                      href={`/dashboard/hackathons/${id}${item.href}`}
                      className={styles.link}
                    >
                      <IconCmp size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </aside>
          <main className={styles.main}>{children}</main>
        </div>
      </Container>
    </>
  );
}
