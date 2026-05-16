import Link from 'next/link';
import { Badge, Card, EmptyState, SearchBar, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { ParticipantsFilters } from './ParticipantsFilters';
import { RowActions } from './RowActions';

const TONES: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  accepted: 'success',
  pending: 'info',
  waitlisted: 'info',
  rejected: 'warning',
  withdrawn: 'neutral',
};

export default async function ParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { id } = await params;
  const filters = await searchParams;
  const { supabase } = await getCurrentUserOrRedirect();

  let query = supabase
    .from('registrations')
    .select(
      'id, full_name, email, status, created_at, checked_in_at, organization_or_company',
    )
    .eq('hackathon_id', id)
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.q) {
    const q = `%${filters.q}%`;
    query = query.or(`full_name.ilike.${q},email.ilike.${q},organization_or_company.ilike.${q}`);
  }

  const { data: registrations } = await query;
  const list = registrations ?? [];

  // counts (ignoring filter) for the summary strip
  const { data: all } = await supabase
    .from('registrations')
    .select('status')
    .eq('hackathon_id', id);
  const counts = (all ?? []).reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone="soft">
        <strong>{all?.length ?? 0}</strong> total · <strong>{counts.pending ?? 0}</strong> pending ·{' '}
        <strong>{counts.accepted ?? 0}</strong> accepted · <strong>{counts.rejected ?? 0}</strong>{' '}
        rejected
      </Card>

      <ParticipantsFilters status={filters.status ?? 'all'} q={filters.q ?? ''} />

      {list.length === 0 ? (
        <EmptyState title="No matches" body="Try clearing the filters or share the public registration link." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Org / company</Th>
              <Th>Status</Th>
              <Th>Checked in</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {list.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <Link href={`/dashboard/hackathons/${id}/participants/${r.id}`}>
                    <strong>{r.full_name}</strong>
                  </Link>
                </Td>
                <Td>{r.email}</Td>
                <Td>{r.organization_or_company ?? '—'}</Td>
                <Td>
                  <Badge tone={TONES[r.status] ?? 'neutral'}>{r.status}</Badge>
                </Td>
                <Td>{r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '—'}</Td>
                <Td>
                  <RowActions
                    hackathonId={id}
                    registrationId={r.id}
                    status={r.status as any}
                    checkedIn={!!r.checked_in_at}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
