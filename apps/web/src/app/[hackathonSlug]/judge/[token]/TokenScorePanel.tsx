'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui';

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

const linkPill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: 'rgba(255,138,61,0.10)',
  color: 'var(--color-primary-pressed)',
  padding: '5px 14px',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
  transition: 'background 0.15s',
};

function SubmissionCard({
  sub,
  criteria,
  existing,
  assignmentId,
  scoreMin,
  scoreMax,
  index,
  total,
}: {
  sub: Submission;
  criteria: Criterion[];
  existing: ExistingScore[];
  assignmentId: string;
  scoreMin: number;
  scoreMax: number;
  index: number;
  total: number;
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
        else setMsg({ kind: 'ok', text: isFinal ? 'Final scores submitted!' : 'Draft saved.' });
      })();
    });
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 24,
      boxShadow: '0 2px 24px rgba(43,43,43,0.07)',
      marginBottom: 28,
      overflow: 'hidden',
    }}>
      {/* Submission header */}
      <div style={{ padding: '28px 32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', marginBottom: 6 }}>
              Project {index + 1} of {total}
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2 }}>
              {sub.title}
            </h2>
            <p style={{ margin: '5px 0 0', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 14 }}>
              {sub.teams?.name ?? 'No team'}
            </p>
          </div>
          {finalized && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#e8f7ef', color: '#1a6b3c',
              padding: '7px 16px', borderRadius: 999,
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#1a6b3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Scored
            </div>
          )}
        </div>

        {sub.description && (
          <p style={{
            margin: '16px 0 0',
            fontSize: 14, lineHeight: 1.7,
            color: '#4a4540',
            whiteSpace: 'pre-wrap',
            background: 'var(--color-bg)',
            padding: '14px 18px',
            borderRadius: 12,
          }}>
            {sub.description}
          </p>
        )}

        {(sub.github_url || sub.demo_url || sub.video_url) && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {sub.github_url && (
              <a href={sub.github_url} target="_blank" rel="noreferrer" style={linkPill}>
                GitHub ↗
              </a>
            )}
            {sub.demo_url && (
              <a href={sub.demo_url} target="_blank" rel="noreferrer" style={linkPill}>
                Live demo ↗
              </a>
            )}
            {sub.video_url && (
              <a href={sub.video_url} target="_blank" rel="noreferrer" style={linkPill}>
                Video ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* Scoring section */}
      {criteria.length === 0 ? (
        <div style={{ padding: '0 32px 28px', color: 'var(--color-text-muted)', fontSize: 14 }}>
          No judging criteria set for this hackathon.
        </div>
      ) : (
        <>
          {/* Section header */}
          <div style={{
            borderTop: '1.5px solid var(--color-border)',
            padding: '18px 32px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{
              margin: 0, fontSize: 11, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
            }}>
              Score each criterion &nbsp;({scoreMin}–{scoreMax})
            </h3>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: complete ? '#1a6b3c' : 'var(--color-text-muted)',
            }}>
              {criteria.filter((c) => values[c.id]?.score !== '').length} / {criteria.length} filled
            </span>
          </div>

          {/* Criteria rows */}
          <div style={{ padding: '12px 32px 0' }}>
            {criteria.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 88px 1fr',
                  gap: 16,
                  padding: '16px 18px',
                  background: i % 2 === 0 ? 'var(--color-bg)' : '#fff',
                  borderRadius: 14,
                  alignItems: 'start',
                  marginBottom: 8,
                }}
              >
                {/* Criterion info */}
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{c.name}</div>
                  {c.description && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                      {c.description}
                    </p>
                  )}
                  <div style={{
                    marginTop: 8, display: 'inline-block',
                    background: 'rgba(255,138,61,0.12)', color: 'var(--color-primary-pressed)',
                    padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  }}>
                    ×{c.weight} weight
                  </div>
                </div>

                {/* Score input */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    Score
                  </div>
                  <input
                    type="number"
                    min={scoreMin}
                    max={scoreMax}
                    value={values[c.id]?.score ?? ''}
                    onChange={(e) => setValue(c.id, { score: e.target.value === '' ? '' : Number(e.target.value) })}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: 26,
                      fontWeight: 800,
                      color: values[c.id]?.score !== '' ? 'var(--color-primary-pressed)' : '#ccc',
                      border: '2px solid',
                      borderColor: values[c.id]?.score !== '' ? 'var(--color-primary)' : 'var(--color-border)',
                      borderRadius: 14,
                      padding: '10px 4px',
                      background: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, color 0.15s',
                      MozAppearance: 'textfield',
                    } as React.CSSProperties}
                  />
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 5 }}>
                    {scoreMin}–{scoreMax}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    Comment (optional)
                  </div>
                  <textarea
                    value={values[c.id]?.comment ?? ''}
                    onChange={(e) => setValue(c.id, { comment: e.target.value })}
                    placeholder="Add a note…"
                    style={{
                      width: '100%',
                      minHeight: 70,
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 12,
                      padding: '10px 12px',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      color: 'var(--color-text)',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#fff',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Feedback + buttons */}
          <div style={{ padding: '12px 32px 28px' }}>
            {msg && (
              <div style={{
                padding: '11px 18px',
                borderRadius: 12,
                background: msg.kind === 'ok' ? '#e8f7ef' : '#fff4e0',
                color: msg.kind === 'ok' ? '#1a6b3c' : '#92400e',
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                {msg.kind === 'ok' ? '✓' : '!'} {msg.text}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="secondary" loading={pending} onClick={() => submit(false)}>
                Save draft
              </Button>
              <Button loading={pending} disabled={!complete} onClick={() => submit(true)}>
                Submit final scores
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
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

  const allDone = finalizedCount === submissions.length && submissions.length > 0;

  return (
    <div>
      {/* Progress summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 22px',
        background: allDone ? '#e8f7ef' : 'rgba(255,138,61,0.09)',
        borderRadius: 16,
        marginBottom: 32,
        flexWrap: 'wrap',
        gap: 10,
        border: `1.5px solid ${allDone ? '#a7dfc0' : 'rgba(255,138,61,0.18)'}`,
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: allDone ? '#1a6b3c' : 'var(--color-text)' }}>
          {submissions.length} project{submissions.length === 1 ? '' : 's'} to score &nbsp;·&nbsp; {criteria.length} criteria each
        </span>
        <span style={{
          background: allDone ? '#1a6b3c' : '#fff',
          color: allDone ? '#fff' : 'var(--color-text-muted)',
          border: '1.5px solid',
          borderColor: allDone ? '#1a6b3c' : 'var(--color-border)',
          padding: '4px 14px',
          borderRadius: 999,
          fontWeight: 800,
          fontSize: 13,
        }}>
          {finalizedCount} / {submissions.length} finalized
        </span>
      </div>

      {submissions.map((sub, i) => (
        <SubmissionCard
          key={sub.id}
          sub={sub}
          criteria={criteria}
          existing={existingScores}
          assignmentId={assignmentId}
          scoreMin={scoreMin}
          scoreMax={scoreMax}
          index={i}
          total={submissions.length}
        />
      ))}
    </div>
  );
}
