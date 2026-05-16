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
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; track?: string }>;
}) {
  const { id } = await params;
  const filters = await searchParams;
  const { supabase } = await getCurrentUserOrRedirect();

  const { data: tracks } = await supabase
    .from('hackathon_tracks')
    .select('id, name')
    .eq('hackathon_id', id);

  let query = supabase
    .from('submissions')
    .select('id, title, status, submitted_at, updated_at, teams(name), hackathon_tracks(name, id)')
    .eq('hackathon_id', id)
    .order('updated_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.track && filters.track !== 'all') {
    query = query.eq('track_id', filters.track);
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
        status={filters.status ?? 'all'}
        track={filters.track ?? 'all'}
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
                  <Link href={`/dashboard/hackathons/${id}/submissions/${s.id}`}>
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
