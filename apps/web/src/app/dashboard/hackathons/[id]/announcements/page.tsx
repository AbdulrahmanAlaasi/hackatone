import { Badge, Card, EmptyState } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { AnnouncementForm } from './AnnouncementForm';
import { AnnouncementActions } from './AnnouncementActions';

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body, created_at, hidden')
    .eq('hackathon_id', id)
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
        <AnnouncementForm hackathonId={id} />
      </Card>

      {(announcements?.length ?? 0) === 0 ? (
        <EmptyState title="No announcements yet" body="Send your first update to participants." />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {announcements!.map((a) => (
            <Card key={a.id} style={a.hidden ? { opacity: 0.6 } : undefined}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
                      {a.title}
                    </h3>
                    {a.hidden ? <Badge tone="neutral">Hidden</Badge> : null}
                  </div>
                  <p
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--font-size-caption)',
                      margin: '4px 0',
                    }}
                  >
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: 'var(--space-2)' }}>{a.body}</p>
                </div>
                <AnnouncementActions
                  hackathonId={id}
                  announcementId={a.id}
                  hidden={a.hidden}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
