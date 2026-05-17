import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Container, Icon } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SignOutButton } from '../dashboard/SignOutButton';
import styles from './layout.module.css';

export default async function JudgeLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Confirm judge assignment exists
  const { data: judging } = await supabase
    .from('judge_assignments')
    .select('id')
    .eq('judge_id', user.id)
    .limit(1)
    .maybeSingle();
  if (!judging) {
    // Not a judge — check if they're an organizer
    const { data: org } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    redirect(org ? '/dashboard' : '/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Container>
          <div className={styles.barInner}>
            <Link href="/judge" className={styles.brand}>
              <BrandMark />
              <div>
                <span className={styles.brandTop}>Hackatone</span>
                <span className={styles.brandSub}>Judging</span>
              </div>
            </Link>
            <div className={styles.user}>
              <div style={{ textAlign: 'right' }}>
                <p className={styles.userName}>{profile?.full_name ?? user.email}</p>
                <p className={styles.userEmail}>Judge</p>
              </div>
              <SignOutButton />
            </div>
          </div>
        </Container>
      </header>
      <Container>
        <div className={styles.body}>{children}</div>
      </Container>
    </div>
  );
}

function BrandMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="judge-og" x1="120" y1="120" x2="390" y2="395" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF9D4D" />
          <stop offset="1" stopColor="#E96F26" />
        </linearGradient>
      </defs>
      <path d="M142 172C142 147.147 162.147 127 187 127C211.853 127 232 147.147 232 172V337C232 361.853 211.853 382 187 382C162.147 382 142 361.853 142 337V172Z" fill="url(#judge-og)" />
      <path d="M280 172C280 147.147 300.147 127 325 127C349.853 127 370 147.147 370 172V337C370 361.853 349.853 382 325 382C300.147 382 280 361.853 280 337V172Z" fill="url(#judge-og)" />
      <path d="M187 170C211 190 232 214 256 239C280 264 301 287 325 307" stroke="url(#judge-og)" strokeWidth="68" strokeLinecap="round" />
    </svg>
  );
}
