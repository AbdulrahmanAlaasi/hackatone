import Link from 'next/link';
import { Badge, Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { SubmissionsFilters } from './SubmissionsFilters';

const TONES: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
  submitted: 'success',
  draft: 'info',
  locked: 'warning',
  withdrawn: 'neutral',
};

export default async function SubmissionsListPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { status?: string; track?: string };
}) {
  const { supabase } = await getCurrentUserOrRedirect();

  const { data: tracks } = await supabase
    .from('hackathon_tracks')
    .select('id, name')
    .eq('hackathon_id', params.id);

  let query = supabase
    .from('submissions')
    .select('id, title, status, submitted_at, updated_at, teams(name), hackathon_tracks(name, id)')
    .eq('hackathon_id', params.id)
    .order('updated_at', { ascending: false });

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }
  if (searchParams.track && searchParams.track !== 'all') {
    query = query.eq('track_id', searchParams.track);
  }

  const { data: submissions } = await query;
  const list = submissions ?? [];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone="soft">
        <strong>{list.length}</strong> submissions in view.
      </Card>

      <SubmissionsFilters
        tracks={tracks ?? []}
        status={searchParams.status ?? 'all'}
        track={searchParams.track ?? 'all'}
      />

      {list.length === 0 ? (
        <EmptyState title="No submissions" body="Teams will appear here once they submit from the mobile app." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Team</Th>
              <Th>Track</Th>
              <Th>Status</Th>
              <Th>Updated</Th>
            </Tr>
          </Thead>
          <Tbody>
            {list.map((s: any) => (
              <Tr key={s.id}>
                <Td>
                  <Link href={`/dashboard/hackathons/${params.id}/submissions/${s.id}`}>
                    <strong>{s.title}</strong>
                  </Link>
                </Td>
                <Td>{s.teams?.name ?? '—'}</Td>
                <Td>{s.hackathon_tracks?.name ?? '—'}</Td>
                <Td><Badge tone={TONES[s.status] ?? 'neutral'}>{s.status}</Badge></Td>
                <Td>{new Date(s.updated_at).toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
