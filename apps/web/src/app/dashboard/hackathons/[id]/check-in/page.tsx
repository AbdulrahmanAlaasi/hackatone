import { Card, CardTitle } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { TokenForm, ManualList } from './CheckInPanel';

export default async function CheckInPage({ params }: { params: { id: string } }) {
  const { supabase } = await getCurrentUserOrRedirect();

  const { data: accepted } = await supabase
    .from('registrations')
    .select('id, full_name, email, organization_or_company, checked_in_at')
    .eq('hackathon_id', params.id)
    .eq('status', 'accepted')
    .order('full_name', { ascending: true });

  const total = accepted?.length ?? 0;
  const checkedIn = (accepted ?? []).filter((r) => r.checked_in_at).length;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card tone="soft">
        <strong>{checkedIn}</strong> of <strong>{total}</strong> accepted participants checked in.
      </Card>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
        <Card>
          <CardTitle>Scan / paste QR token</CardTitle>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Paste the participant's QR token (from their mobile app). A full camera scanner can be
            added later — the participant's app shows the token under their QR for easy testing.
          </p>
          <TokenForm hackathonId={params.id} />
        </Card>

        <Card>
          <CardTitle>Manual check-in</CardTitle>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Search by name, email, or company.
          </p>
          <ManualList hackathonId={params.id} accepted={accepted ?? []} />
        </Card>
      </div>
    </div>
  );
}
