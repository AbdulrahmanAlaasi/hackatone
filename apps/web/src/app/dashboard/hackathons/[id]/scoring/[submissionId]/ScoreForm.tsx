'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Field, Input, Textarea } from '@/components/ui';
import { saveScores } from './actions';

type Criterion = { id: string; name: string; description: string | null; weight: number };
type Existing = { criteria_id: string; score: number; comment: string | null; is_final: boolean };
type ScoreValue = { score: number | ''; comment: string };

export function ScoreForm({
  hackathonId,
  submissionId,
  criteria,
  existing,
  scoreMin,
  scoreMax,
}: {
  hackathonId: string;
  submissionId: string;
  criteria: Criterion[];
  existing: Existing[];
  scoreMin: number;
  scoreMax: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, ScoreValue>>(() => {
    const map: Record<string, ScoreValue> = {};
    criteria.forEach((c) => {
      const cur = existing.find((e) => e.criteria_id === c.id);
      map[c.id] = { score: cur ? cur.score : '', comment: cur?.comment ?? '' };
    });
    return map;
  });
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function valueFor(criteriaId: string): ScoreValue {
    return values[criteriaId] ?? { score: '', comment: '' };
  }

  function set(criteriaId: string, patch: Partial<ScoreValue>) {
    setValues((v) => ({ ...v, [criteriaId]: { ...(v[criteriaId] ?? { score: '', comment: '' }), ...patch } }));
  }

  function submit(isFinal: boolean) {
    setMsg(null);
    const payload = criteria
      .filter((c) => valueFor(c.id).score !== '')
      .map((c) => ({
        criteriaId: c.id,
        score: Number(valueFor(c.id).score),
        comment: valueFor(c.id).comment || null,
        isFinal,
      }));
    if (payload.length === 0) {
      setMsg({ kind: 'err', text: 'Score at least one criterion.' });
      return;
    }
    start(() => {
      void (async () => {
        const res = await saveScores(hackathonId, submissionId, payload);
        if (!res.ok) setMsg({ kind: 'err', text: res.error });
        else {
          setMsg({ kind: 'ok', text: isFinal ? 'Final scores submitted.' : 'Draft saved.' });
          router.refresh();
        }
      })();
    });
  }

  return (
    <Card>
      <h3 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>Your scores</h3>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Score range {scoreMin}–{scoreMax}. Save a draft anytime; submit finals when ready.
      </p>
      <div style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        {criteria.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 3fr',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              alignItems: 'end',
            }}
          >
            <div>
              <strong>{c.name}</strong>
              {c.description ? (
                <p style={{ margin: 4, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>
                  {c.description}
                </p>
              ) : null}
              <p style={{ margin: 4, fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}>
                Weight: ×{c.weight}
              </p>
            </div>
            <Field label={`Score (${scoreMin}-${scoreMax})`} htmlFor={`s-${c.id}`}>
              <Input
                id={`s-${c.id}`}
                type="number"
                min={scoreMin}
                max={scoreMax}
                value={valueFor(c.id).score}
                onChange={(e) => set(c.id, { score: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </Field>
            <Field label="Comment (optional)" htmlFor={`c-${c.id}`}>
              <Textarea
                id={`c-${c.id}`}
                value={valueFor(c.id).comment}
                onChange={(e) => set(c.id, { comment: e.target.value })}
                style={{ minHeight: 60 }}
              />
            </Field>
          </div>
        ))}
      </div>

      {msg ? (
        <p
          role="status"
          style={{
            background: msg.kind === 'ok' ? 'var(--color-success)' : 'var(--color-warning)',
            color: msg.kind === 'ok' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            marginTop: 'var(--space-4)',
          }}
        >
          {msg.text}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
        <Button variant="secondary" loading={pending} onClick={() => submit(false)}>
          Save draft
        </Button>
        <Button loading={pending} onClick={() => submit(true)}>
          Submit final scores
        </Button>
      </div>
    </Card>
  );
}
