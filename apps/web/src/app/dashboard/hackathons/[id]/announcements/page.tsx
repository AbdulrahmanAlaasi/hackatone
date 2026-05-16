import { Card, EmptyState } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { AnnouncementForm } from './AnnouncementForm';

export default async function AnnouncementsPage({ params }: { params: { id: string } }) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body, created_at')
    .eq('hackathon_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <h3 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
          New announcement
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Visible to accepted participants in the mobile app.
        </p>
        <AnnouncementForm hackathonId={params.id} />
      </Card>

      {(announcements?.length ?? 0) === 0 ? (
        <EmptyState title="No announcements yet" body="Send your first update to participants." />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {announcements!.map((a) => (
            <Card key={a.id}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>{a.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)', margin: '4px 0' }}>
                {new Date(a.created_at).toLocaleString()}
              </p>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: 'var(--space-2)' }}>{a.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
