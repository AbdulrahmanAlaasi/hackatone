import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SignOutButton } from './SignOutButton';
import { NotificationBell } from './NotificationBell';
import { HackathonsDropdown } from './HackathonsDropdown';
import styles from './layout.module.css';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Role-based access: if user has no organization membership but has judge
  // assignments, push them to the judge area.
  const [{ data: profile }, { data: orgMember }, { data: judgeAssigned }] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', user.id).maybeSingle(),
    supabase.from('organization_members').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
    supabase.from('judge_assignments').select('id').eq('judge_id', user.id).limit(1).maybeSingle(),
  ]);

  // Role gate: /dashboard is for organization members only.
  //  - No org but judge assignment → /judge
  //  - No org, no judge → /welcome (participant — they use the mobile app)
  if (!orgMember) {
    if (judgeAssigned) redirect('/judge');
    redirect('/welcome');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          Hackatone
        </Link>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navItem}>
            Overview
          </Link>
          <HackathonsDropdown />
          <Link href="/dashboard/settings" className={styles.navItem}>
            Settings
          </Link>
          {judgeAssigned ? (
            <Link href="/judge" className={styles.navItem} style={{ color: 'var(--color-primary-pressed)' }}>
              Judge view →
            </Link>
          ) : null}
        </nav>
        <div className={styles.user}>
          <div>
            <p className={styles.userName}>{profile?.full_name ?? user.email}</p>
            <p className={styles.userEmail}>{profile?.email ?? user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.bellSlot}>
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
