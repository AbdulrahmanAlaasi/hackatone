'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const STATUSES = ['all', 'draft', 'submitted', 'locked', 'withdrawn'] as const;

export function SubmissionsFilters({
  tracks,
  status,
  track,
}: {
  tracks: Array<{ id: string; name: string }>;
  status: string;
  track: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(next: Partial<{ status: string; track: string }>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === 'all') sp.delete(k);
      else sp.set(k, v);
    });
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => (
          <Pill key={s} active={status === s} label={s} onClick={() => update({ status: s })} />
        ))}
      </div>
      {tracks.length > 0 ? (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Pill active={track === 'all'} label="All tracks" onClick={() => update({ track: 'all' })} />
          {tracks.map((t) => (
            <Pill
              key={t.id}
              active={track === t.id}
              label={t.name}
              onClick={() => update({ track: t.id })}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 12px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border)',
        background: active ? 'var(--color-primary)' : 'var(--color-surface)',
        color: active ? '#fff' : 'var(--color-text)',
        fontWeight: 800,
        fontSize: 'var(--font-size-label)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
