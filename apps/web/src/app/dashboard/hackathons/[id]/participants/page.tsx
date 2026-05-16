import { Badge, Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';

const TONES: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  accepted: 'success',
  pending: 'info',
  waitlisted: 'info',
  rejected: 'warning',
  withdrawn: 'neutral',
};

export default async function ParticipantsPage({ params }: { params: { id: string } }) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: registrations } = await supabase
    .from('registrations')
    .select('id, full_name, email, status, created_at, checked_in_at, organization_or_company')
    .eq('hackathon_id', params.id)
    .order('created_at', { ascending: false });

  const list = registrations ?? [];
  const counts = list.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone="soft">
        <strong>{list.length}</strong> total ·{' '}
        <strong>{counts.pending ?? 0}</strong> pending ·{' '}
        <strong>{counts.accepted ?? 0}</strong> accepted ·{' '}
        <strong>{counts.rejected ?? 0}</strong> rejected
      </Card>

      {list.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          body="Share the public registration link or QR code to get started."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Org / company</Th>
              <Th>Status</Th>
              <Th>Checked in</Th>
              <Th>Registered</Th>
            </Tr>
          </Thead>
          <Tbody>
            {list.map((r) => (
              <Tr key={r.id}>
                <Td><strong>{r.full_name}</strong></Td>
                <Td>{r.email}</Td>
                <Td>{r.organization_or_company ?? '—'}</Td>
                <Td><Badge tone={TONES[r.status] ?? 'neutral'}>{r.status}</Badge></Td>
                <Td>{r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '—'}</Td>
                <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>
        Accept / reject actions and the participant detail drawer land in Prompt 6.
      </p>
    </div>
  );
}
