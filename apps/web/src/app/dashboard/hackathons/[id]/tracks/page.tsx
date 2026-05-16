import { Card, EmptyState, Table, Tbody, Td, Th, Thead, Tr } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { TracksEditor, DeleteTrackButton } from './TracksEditor';

export default async function TracksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: tracks } = await supabase
    .from('hackathon_tracks')
    .select('id, name, description, created_at')
    .eq('hackathon_id', id)
    .order('created_at', { ascending: true });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <Card>
        <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>Add a track</h2>
        <TracksEditor hackathonId={id} />
      </Card>

      {(tracks?.length ?? 0) === 0 ? (
        <EmptyState title="No tracks yet" body="Tracks let participants choose a category for their project." />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {tracks!.map((t) => (
              <Tr key={t.id}>
                <Td><strong>{t.name}</strong></Td>
                <Td>{t.description ?? '—'}</Td>
                <Td>
                  <DeleteTrackButton hackathonId={id} trackId={t.id} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
