import { Card, EmptyState } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { CriteriaEditor } from './CriteriaEditor';

export default async function CriteriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: criteria } = await supabase
    .from('judging_criteria')
    .select('id, name, description, weight, sort_order')
    .eq('hackathon_id', id)
    .order('sort_order', { ascending: true });

  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('score_min, score_max')
    .eq('id', id)
    .maybeSingle();

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <Card tone="info">
        Score range: <strong>{hackathon?.score_min ?? 1}</strong>–<strong>{hackathon?.score_max ?? 5}</strong> per criterion.
        Total score = sum of (score × weight).
      </Card>

      {(criteria?.length ?? 0) === 0 ? (
        <EmptyState title="No criteria yet" body="Add at least one criterion before judging starts." />
      ) : null}

      <CriteriaEditor hackathonId={id} criteria={criteria ?? []} />
    </div>
  );
}
