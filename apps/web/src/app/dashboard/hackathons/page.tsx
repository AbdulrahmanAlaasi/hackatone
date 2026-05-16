import Link from 'next/link';
import { Button, Container, EmptyState, Table, Tbody, Td, Th, Thead, TopHeader, Tr } from '@/components/ui';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Full CRUD lands in Prompt 4. This shell renders the list view.
export default async function HackathonsListPage() {
  const supabase = await createSupabaseServerClient();
  const { data: hackathons } = await supabase
    .from('hackathons')
    .select('id, title, slug, status, starts_at, ends_at')
    .order('created_at', { ascending: false });

  return (
    <Container>
      <TopHeader
        title="Hackathons"
        subtitle="Create and manage your organization's events."
        actions={
          <Link href="/dashboard/hackathons/new">
            <Button>New hackathon</Button>
          </Link>
        }
      />
      {(hackathons?.length ?? 0) === 0 ? (
        <EmptyState
          title="No hackathons yet"
          body="Click ‘New hackathon’ to create one. (Form lands in Prompt 4.)"
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Slug</Th>
              <Th>Status</Th>
              <Th>Start</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {hackathons!.map((h) => (
              <Tr key={h.id}>
                <Td><strong>{h.title}</strong></Td>
                <Td><code>{h.slug}</code></Td>
                <Td>{h.status}</Td>
                <Td>{h.starts_at ? new Date(h.starts_at).toLocaleDateString() : '—'}</Td>
                <Td><Link href={`/dashboard/hackathons/${h.id}`}>Open</Link></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Container>
  );
}
