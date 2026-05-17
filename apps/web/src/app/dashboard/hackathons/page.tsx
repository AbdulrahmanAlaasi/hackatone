import Link from 'next/link';
import {
  Badge,
  Button,
  Container,
  EmptyState,
  Icon,
  TopHeader,
} from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import styles from './page.module.css';

const STATUS_TONE: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
  active: 'success',
  registration_open: 'success',
  registration_closed: 'info',
  judging: 'info',
  completed: 'neutral',
  archived: 'neutral',
  draft: 'warning',
};

export default async function HackathonsListPage() {
  const supabase = await createSupabaseServerClient();
  const { data: hackathons } = await supabase
    .from('hackathons')
    .select('*, organizations(name, logo_url)')
    .order('created_at', { ascending: false });

  const list = (hackathons ?? []) as unknown as Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    starts_at: string | null;
    location: string | null;
    field: string | null;
    visibility: 'public' | 'private' | null;
    organizations: { name: string; logo_url: string | null } | null;
  }>;

  return (
    <Container>
      <TopHeader
        title="Hackathons"
        subtitle="Create and manage your organization's events."
        actions={
          <Link href="/dashboard/hackathons/new">
            <Button>
              <Icon.Plus size={16} /> New hackathon
            </Button>
          </Link>
        }
      />
      {list.length === 0 ? (
        <EmptyState
          title="No hackathons yet"
          body="Click ‘New hackathon’ to spin up your first event."
        />
      ) : (
        <div className={styles.grid}>
          {list.map((h) => (
            <Link
              key={h.id}
              href={`/dashboard/hackathons/${h.id}`}
              className={styles.card}
              style={{ ['--anim-delay' as any]: `${Math.random() * 200}ms` }}
            >
              <div className={styles.cardTop}>
                {h.organizations?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.organizations.logo_url}
                    alt={h.organizations.name}
                    className={styles.logo}
                  />
                ) : (
                  <div className={styles.logoFallback}>
                    {(h.organizations?.name ?? '?').slice(0, 1)}
                  </div>
                )}
                <Badge tone={STATUS_TONE[h.status] ?? 'neutral'}>
                  {h.status.replace('_', ' ')}
                </Badge>
              </div>

              <h3 className={styles.title}>{h.title}</h3>
              <p className={styles.org}>{h.organizations?.name ?? '—'}</p>

              <div className={styles.meta}>
                {h.starts_at ? (
                  <span className={styles.metaItem}>
                    <Icon.Calendar size={14} />
                    {new Date(h.starts_at).toLocaleDateString()}
                  </span>
                ) : null}
                {h.location ? (
                  <span className={styles.metaItem}>
                    <Icon.Pin size={14} />
                    {h.location}
                  </span>
                ) : null}
              </div>

              <div className={styles.tags}>
                {h.field ? <Badge tone="cream">{h.field}</Badge> : null}
                {h.visibility ? (
                  <Badge tone={h.visibility === 'public' ? 'success' : 'neutral'}>
                    {h.visibility === 'public' ? 'Public' : 'Private'}
                  </Badge>
                ) : null}
                <span className={styles.slug}>/{h.slug}</span>
              </div>

              <div className={styles.cta}>
                Open <Icon.ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
