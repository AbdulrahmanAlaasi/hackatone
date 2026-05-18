import Link from 'next/link';

const TEAM_COLORS = ['#FF8A3D', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export function JudgeHeader({
  judgeNumber, judgeLabel,
}: {
  judgeNumber: number;
  judgeLabel: string;
}) {
  return (
    <header style={{
      background: '#fff',
      borderBottom: '1.5px solid var(--color-border)',
      padding: '0 32px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, #FF9D4D 0%, #E96F26 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 512 512" fill="none" aria-hidden>
            <path d="M142 172C142 147.147 162.147 127 187 127C211.853 127 232 147.147 232 172V337C232 361.853 211.853 382 187 382C162.147 382 142 361.853 142 337V172Z" fill="#fff" />
            <path d="M280 172C280 147.147 300.147 127 325 127C349.853 127 370 147.147 370 172V337C370 361.853 349.853 382 325 382C300.147 382 280 361.853 280 337V172Z" fill="#fff" />
            <path d="M187 170C211 190 232 214 256 239C280 264 301 287 325 307" stroke="#fff" strokeWidth="68" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>Hackatone</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Judging</div>
        </div>
      </div>
      <div style={{
        background: 'rgba(255,138,61,0.10)',
        color: 'var(--color-primary-pressed)',
        borderRadius: 999,
        padding: '5px 14px',
        fontSize: 12,
        fontWeight: 800,
      }}>
        Judge {judgeNumber} · {judgeLabel}
      </div>
    </header>
  );
}

export function JudgePanelLayout({
  orgName, hackathonTitle, judgeLabel, judgeNumber, firstName,
  teams, subByTeam, totalCriteria, scoresBySubmission, basePath,
}: {
  orgName: string | null;
  hackathonTitle: string;
  judgeLabel: string;
  judgeNumber: number;
  firstName: string;
  teams: Array<{ id: string; name: string }>;
  subByTeam: Map<string, any>;
  totalCriteria: number;
  scoresBySubmission: Map<string, { count: number; finalized: boolean }>;
  basePath: string;
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <JudgeHeader judgeNumber={judgeNumber} judgeLabel={judgeLabel} />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '52px 24px 100px' }}>
        {/* Welcome hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-primary)', marginBottom: 10 }}>
            Welcome
          </div>
          <h1 style={{ margin: '0 0 12px', fontSize: 40, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
            Judging panel
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: 500 }}>
            Hi {firstName}! Score each team&apos;s submission below. The AI gives you a project summary so you can focus on the rubric.
          </p>
        </div>

        {/* Hackathon + team cards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
            {orgName && (
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                {orgName} ·
              </span>
            )}
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)' }}>
              {hackathonTitle}
            </span>
          </div>

          {teams.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 20, padding: '48px 32px',
              textAlign: 'center', boxShadow: '0 2px 16px rgba(43,43,43,0.06)',
            }}>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>No teams yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {teams.map((team, idx) => {
                const sub = subByTeam.get(team.id);
                const hasSubmitted = sub && ['submitted', 'locked'].includes(sub.status);
                const scores = sub ? (scoresBySubmission.get(sub.id) ?? null) : null;
                const finalized = scores?.finalized ?? false;
                const scoredCount = scores?.count ?? 0;
                const color = TEAM_COLORS[idx % TEAM_COLORS.length]!;
                const initial = team.name.charAt(0).toUpperCase();

                return (
                  <div
                    key={team.id}
                    style={{
                      background: '#fff',
                      borderRadius: 20,
                      padding: '24px',
                      boxShadow: '0 2px 16px rgba(43,43,43,0.06)',
                      border: `1.5px solid ${finalized ? '#a7dfc0' : 'transparent'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                  >
                    {/* Team icon + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: `${color}20`,
                        color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 800, flexShrink: 0,
                        letterSpacing: '-0.5px',
                      }}>
                        {initial}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text)', lineHeight: 1.2 }}>
                          {team.name}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          {orgName ?? hackathonTitle}
                        </div>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {hasSubmitted ? (
                        <>
                          <span style={{ background: '#e8f7ef', color: '#1a6b3c', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                            submitted
                          </span>
                          {totalCriteria > 0 && (
                            <span style={{
                              background: finalized ? '#e8f7ef' : 'rgba(255,138,61,0.12)',
                              color: finalized ? '#1a6b3c' : 'var(--color-primary-pressed)',
                              padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                            }}>
                              {finalized ? '✓ scored' : `${scoredCount} / ${totalCriteria} scored`}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          awaiting submission
                        </span>
                      )}
                    </div>

                    {/* Action link */}
                    {hasSubmitted ? (
                      <Link
                        href={`${basePath}/score/${sub.id}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontWeight: 800, fontSize: 13,
                          color: finalized ? '#1a6b3c' : 'var(--color-primary-pressed)',
                          textDecoration: 'none',
                          marginTop: 'auto',
                        }}
                      >
                        {finalized ? 'Review scores →' : 'Start scoring →'}
                      </Link>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', marginTop: 'auto' }}>
                        Not available yet
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
