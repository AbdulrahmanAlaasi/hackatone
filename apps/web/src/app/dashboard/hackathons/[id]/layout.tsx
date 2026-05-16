import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge, Container, Display, Eyebrow } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import styles from './layout.module.css';

const TABS = [
  { href: '', label: 'Overview' },
  { href: '/participants', label: 'Participants' },
  { href: '/check-in', label: 'Check-in' },
  { href: '/submissions', label: 'Submissions' },
  { href: '/judges', label: 'Judges' },
  { href: '/scoring', label: 'Scoring' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/tracks', label: 'Tracks' },
  { href: '/criteria', label: 'Judging criteria' },
  { href: '/qr-codes', label: 'QR & registration' },
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
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, title, slug, status, starts_at, ends_at, location')
    .eq('id', id)
    .maybeSingle();

  if (!hackathon) notFound();

  return (
    <>
      <section className={styles.hero}>
        <Container>
          <Eyebrow>Hackathon</Eyebrow>
          <Display>{hackathon.title}</Display>
          <div className={styles.heroMeta}>
            <Badge tone={hackathon.status === 'active' ? 'success' : 'info'}>{hackathon.status}</Badge>
            {hackathon.location ? <Badge tone="neutral">📍 {hackathon.location}</Badge> : null}
            {hackathon.starts_at ? (
              <Badge tone="neutral">📅 {new Date(hackathon.starts_at).toLocaleDateString()}</Badge>
            ) : null}
            <code className={styles.slug}>/{hackathon.slug}</code>
          </div>
        </Container>
      </section>

      <Container>
        <nav className={styles.tabs}>
          {TABS.map((t) => (
            <Link key={t.href} href={`/dashboard/hackathons/${id}${t.href}`} className={styles.tab}>
              {t.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'var(--space-6)' }}>{children}</div>
      </Container>
    </>
  );
}
