'use client';

import { useState, useTransition } from 'react';
import { Badge, Button, Card, Field, Input, Textarea } from '@/components/ui';

type Submission = {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
  video_url: string | null;
  teams: { name: string } | null;
};

type Criterion = { id: string; name: string; description: string | null; weight: number };

type ExistingScore = {
  submission_id: string;
  criteria_id: string;
  score: number;
  comment: string | null;
  is_final: boolean;
};

type ScoreValue = { score: number | ''; comment: string };

function buildInitialValues(
  criteria: Criterion[],
  existing: ExistingScore[],
  submissionId: string,
): Record<string, ScoreValue> {
  const map: Record<string, ScoreValue> = {};
  for (const c of criteria) {
    const cur = existing.find((e) => e.submission_id === submissionId && e.criteria_id === c.id);
    map[c.id] = { score: cur ? cur.score : '', comment: cur?.comment ?? '' };
  }
  return map;
}

function isComplete(values: Record<string, ScoreValue>, criteria: Criterion[]): boolean {
  return criteria.length > 0 && criteria.every((c) => values[c.id]?.score !== '');
}

function SubmissionCard({
  sub,
  criteria,
  existing,
  assignmentId,
  scoreMin,
  scoreMax,
}: {
  sub: Submission;
  criteria: Criterion[];
  existing: ExistingScore[];
  assignmentId: string;
  scoreMin: number;
  scoreMax: number;
}) {
  const [values, setValues] = useState<Record<string, ScoreValue>>(() =>
    buildInitialValues(criteria, existing, sub.id),
  );
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const finalized = existing.some((e) => e.submission_id === sub.id && e.is_final);
  const complete = isComplete(values, criteria);

  function setValue(criteriaId: string, patch: Partial<ScoreValue>) {
    setValues((v) => ({ ...v, [criteriaId]: { ...(v[criteriaId] ?? { score: '', comment: '' }), ...patch } }));
  }

  function submit(isFinal: boolean) {
    setMsg(null);
    const payload = criteria
      .filter((c) => values[c.id]?.score !== '')
      .map((c) => ({
        criteriaId: c.id,
        score: Number(values[c.id]!.score),
        comment: values[c.id]!.comment || null,
        isFinal,
      }));
    if (payload.length === 0) {
      setMsg({ kind: 'err', text: 'Enter at least one score.' });
      return;
    }
    start(() => {
      void (async () => {
        const res = await fetch('/api/judges/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignmentId, submissionId: sub.id, scores: payload }),
        }).then((r) => r.json());
        if (!res.ok) setMsg({ kind: 'err', text: res.error });
        else setMsg({ kind: 'ok', text: isFinal ? 'Final scores submitted.' : 'Draft saved.' });
      })();
    });
  }

  return (
    <Card style={{ marginBottom: 'var(--space-5)' }}>
      {/* Submission info */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>{sub.title}</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontWeight: 700, fontSize: 14 }}>
              {sub.teams?.name ?? 'No team'}
            </p>
          </div>
          {finalized && <Badge tone="success">Scored</Badge>}
        </div>
        {sub.description && (
          <p style={{ marginTop: 12, whiteSpace: 'pre-wrap', color: 'var(--color-text)', lineHeight: 1.6, fontSize: 14 }}>
            {sub.description}
          </p>
        )}
        {(sub.github_url || sub.demo_url || sub.video_url) && (
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            {sub.github_url && <a href={sub.github_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary-pressed)' }}>GitHub ↗</a>}
            {sub.demo_url && <a href={sub.demo_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary-pressed)' }}>Live demo ↗</a>}
            {sub.video_url && <a href={sub.video_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary-pressed)' }}>Video ↗</a>}
          </div>
        )}
      </div>

      {/* Scoring criteria */}
      {criteria.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No judging criteria set for this hackathon.</p>
      ) : (
        <>
          <h3 style={{ margin: '0 0 var(--space-3)', fontSize: 15, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Scoring ({scoreMin}–{scoreMax})
          </h3>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {criteria.map((c) => (
              <div key={c.id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 120px 2fr',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                alignItems: 'end',
              }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{c.name}</strong>
                  {c.description && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {c.description}
                    </p>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>Weight: ×{c.weight}</p>
                </div>
                <Field label={`Score`} htmlFor={`score-${sub.id}-${c.id}`}>
                  <Input
                    id={`score-${sub.id}-${c.id}`}
                    type="number"
                    min={scoreMin}
                    max={scoreMax}
                    value={values[c.id]?.score ?? ''}
                    onChange={(e) => setValue(c.id, { score: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </Field>
                <Field label="Comment (optional)" htmlFor={`comment-${sub.id}-${c.id}`}>
                  <Textarea
                    id={`comment-${sub.id}-${c.id}`}
                    value={values[c.id]?.comment ?? ''}
                    onChange={(e) => setValue(c.id, { comment: e.target.value })}
                    style={{ minHeight: 56 }}
                  />
                </Field>
              </div>
            ))}
          </div>

          {msg && (
            <p style={{
              marginTop: 'var(--space-3)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: 13,
              background: msg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-warning)',
              color: msg.kind === 'ok' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
            }}>
              {msg.text}
            </p>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button variant="secondary" loading={pending} onClick={() => submit(false)}>
              Save draft
            </Button>
            <Button loading={pending} disabled={!complete} onClick={() => submit(true)}>
              Submit final scores
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

export function TokenScorePanel({
  assignmentId,
  submissions,
  criteria,
  existingScores,
  scoreMin,
  scoreMax,
}: {
  assignmentId: string;
  submissions: Submission[];
  criteria: Criterion[];
  existingScores: ExistingScore[];
  scoreMin: number;
  scoreMax: number;
}) {
  const finalizedCount = submissions.filter((s) =>
    criteria.length > 0 &&
    criteria.every((c) => existingScores.some((e) => e.submission_id === s.id && e.criteria_id === c.id && e.is_final)),
  ).length;

  return (
    <div>
      <div style={{
        background: 'var(--color-surface-soft)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: 'var(--space-5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {submissions.length} project{submissions.length === 1 ? '' : 's'} to score · {criteria.length} criteria each
        </span>
        <Badge tone={finalizedCount === submissions.length && submissions.length > 0 ? 'success' : 'info'}>
          {finalizedCount} / {submissions.length} finalized
        </Badge>
      </div>

      {submissions.map((sub) => (
        <SubmissionCard
          key={sub.id}
          sub={sub}
          criteria={criteria}
          existing={existingScores}
          assignmentId={assignmentId}
          scoreMin={scoreMin}
          scoreMax={scoreMax}
        />
      ))}
    </div>
  );
}
