import { Card, Icon } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { ChatPanel } from './ChatPanel';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await getCurrentUserOrRedirect();

  // Load channels for this hackathon (organizer can see all)
  const { data: channels } = await supabase
    .from('chat_channels')
    .select('id, name, scope, team_id')
    .eq('hackathon_id', id)
    .order('scope', { ascending: true })
    .order('name', { ascending: true });

  const list = (channels ?? []) as Array<{
    id: string;
    name: string;
    scope: 'team' | 'hackathon' | 'judge' | 'announcement';
    team_id: string | null;
  }>;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone="info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.MessageCircle size={18} />
          <strong>Organizer chat</strong>
        </div>
        <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)' }}>
          The General channel reaches every accepted participant&apos;s mobile app.
          Team channels let you respond inside a specific team.
        </p>
      </Card>

      {list.length === 0 ? (
        <Card>No chat channels yet. Channels are created automatically when teams form.</Card>
      ) : (
        <ChatPanel hackathonId={id} channels={list} myUserId={user.id} />
      )}
    </div>
  );
}
