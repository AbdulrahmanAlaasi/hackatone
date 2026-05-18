import { Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { CopyLinkButton, InviteJudgeForm, RemoveJudgeButton } from './client';

export default async function JudgesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getCurrentUserOrRedirect();
  const svc = createSupabaseServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hackatone.alaasi.dev';

  const { data: hackathon } = await svc
    .from('hackathons')
    .select('slug')
    .eq('id', id)
    .maybeSingle();

  const { data: assignments } = await svc
    .from('judge_assignments')
    .select('id, profiles(id, full_name, email)')
    .eq('hackathon_id', id)
    .is('submission_id', null)
    .order('created_at', { ascending: true });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <h3 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
          Invite a judge
        </h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>
          Enter the judge&apos;s email and click <strong>Send invite</strong>. A unique link is generated
          — send it to the judge however you like (email, chat, etc). The judge opens the link directly,
          no account or login required. Each judge gets their own private link.
        </p>
        <InviteJudgeForm hackathonId={id} />
      </Card>

      {(assignments?.length ?? 0) === 0 ? (
        <EmptyState title="No judges yet" body="Invite a judge above to enable scoring." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Access link</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {assignments!.map((a: any, idx: number) => {
              const link = hackathon?.slug
                ? `${siteUrl}/${hackathon.slug}/judge${idx + 1}`
                : null;
              return (
                <Tr key={a.id}>
                  <Td><strong>{a.profiles?.full_name ?? '—'}</strong></Td>
                  <Td>{a.profiles?.email ?? '—'}</Td>
                  <Td>
                    {link ? <CopyLinkButton link={link} /> : '—'}
                  </Td>
                  <Td><RemoveJudgeButton hackathonId={id} assignmentId={a.id} /></Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
