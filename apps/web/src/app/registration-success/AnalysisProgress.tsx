'use client';

import { useEffect, useState } from 'react';
import { Badge, Card } from '@/components/ui';
import { getAnalysisStatus } from '../register/[hackathonSlug]/actions';

type Status =
  | { state: 'loading' }
  | { state: 'pending' }
  | { state: 'no_cv' }
  | { state: 'missing' }
  | { state: 'done'; level: string | null; skills: string[] | null; summary: string | null };

export function AnalysisProgress({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>({ state: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      while (!cancelled && attempts < 30) {
        attempts++;
        try {
          const res = await getAnalysisStatus(email);
          if (cancelled) return;
          setStatus(res as Status);
          if (res.state === 'done' || res.state === 'no_cv' || res.state === 'missing') return;
        } catch {
          /* ignore, will retry */
        }
        // 5s between polls
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [email]);

  return (
    <Card style={{ marginTop: 'var(--space-4)' }}>
      <h3 style={{ marginTop: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>
        AI is analyzing your CV
      </h3>
      {status.state === 'loading' || status.state === 'pending' ? (
        <div>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Hang on a moment — Claude is reading your CV to help organizers build balanced teams.
            This usually takes 10–20 seconds.
          </p>
          <BreathingDots />
        </div>
      ) : status.state === 'done' ? (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <p style={{ color: 'var(--color-text)', margin: 0 }}>
            <strong>Done.</strong> Here&apos;s what we extracted:
          </p>
          {status.level ? (
            <div>
              <span style={{ fontWeight: 700, marginRight: 8 }}>Level:</span>
              <Badge tone={status.level === 'expert' || status.level === 'advanced' ? 'success' : 'info'}>
                {status.level}
              </Badge>
            </div>
          ) : null}
          {status.summary ? (
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{status.summary}</p>
          ) : null}
          {status.skills && status.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {status.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    background: 'var(--color-surface-soft)',
                    color: 'var(--color-primary-pressed)',
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}
          <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
            Organizers see this when building teams. You can update your CV later from your profile.
          </p>
        </div>
      ) : status.state === 'no_cv' ? (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No CV on file yet — that&apos;s fine, you can add one later from your profile.
        </p>
      ) : (
        <p style={{ color: 'var(--color-text-muted)' }}>
          Couldn&apos;t find your account yet. Refresh in a moment.
        </p>
      )}
    </Card>
  );
}

function BreathingDots() {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'var(--color-primary)',
            animation: `breathe 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
