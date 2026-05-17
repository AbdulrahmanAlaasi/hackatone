import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SignOutButton } from './SignOutButton';
import { NotificationBell } from './NotificationBell';
import styles from './layout.module.css';

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/hackathons', label: 'Hackathons' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Link href="/" className={styles.brand}>
            Hackatone
          </Link>
          <NotificationBell />
        </div>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navItem}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.user}>
          <div>
            <p className={styles.userName}>{profile?.full_name ?? user.email}</p>
            <p className={styles.userEmail}>{profile?.email ?? user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
