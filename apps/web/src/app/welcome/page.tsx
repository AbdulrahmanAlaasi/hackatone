import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, Container, Display, Eyebrow, Hero, Icon } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SignOutButton } from '../dashboard/SignOutButton';

/**
 * Participant landing page on the WEB.
 *
 * The web app is for organizers and judges only — participants do everything from
 * the mobile app. If a participant signs in to the web by accident, the dashboard
 * layout redirects them here so they know what to do.
 *
 * If someone with org access lands here directly we bounce them to the right place.
 */
export default async function WelcomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: orgMember }, { data: judgeAssigned }] = await Promise.all([
    supabase.from('organization_members').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
    supabase.from('judge_assignments').select('id').eq('judge_id', user.id).limit(1).maybeSingle(),
  ]);

  if (orgMember) redirect('/dashboard');
  if (judgeAssigned) redirect('/judge');

  const { data: regs } = await supabase
    .from('registrations')
    .select('hackathons(title, slug)')
    .eq('email', user.email!)
    .limit(5);

  return (
    <main>
      <Hero tone="sunrise">
        <Eyebrow light>Welcome</Eyebrow>
        <Display light>The web is for organizers.</Display>
        <p style={{ color: 'rgba(255,255,255,0.95)', maxWidth: 540, marginTop: 'var(--space-3)' }}>
          You signed in successfully — but participant tools (check-in QR, team chat, project
          submission) live in the Hackatone mobile app.
        </p>
      </Hero>

      <Container size="form">
        <Card tone="cream" style={{ marginTop: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Icon.Sparkles size={20} />
            <strong style={{ fontSize: 'var(--font-size-h3)' }}>Open Hackatone mobile</strong>
          </div>
          <ol style={{ paddingLeft: '1.2em', margin: '8px 0 0', lineHeight: 1.7, color: 'var(--color-text)' }}>
            <li>Install <strong>Expo Go</strong> on iOS or Android (free, App Store / Play Store).</li>
            <li>Open it and sign in with the same email — <code>{user.email}</code></li>
            <li>Your accepted hackathons appear immediately, with your QR check-in code.</li>
          </ol>
        </Card>

        {regs && regs.length > 0 ? (
          <Card style={{ marginTop: 'var(--space-4)' }}>
            <strong>Your registrations</strong>
            <ul style={{ marginTop: 8, paddingLeft: '1.2em' }}>
              {regs.map((r: any, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {r.hackathons?.title}{' '}
                  <Link href={`/register/${r.hackathons?.slug}`} style={{ fontSize: 12 }}>
                    (view page)
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>
            Run hackathons yourself? <Link href="/signup">Create an organization →</Link>
          </p>
          <SignOutButton />
        </div>
      </Container>
    </main>
  );
}
