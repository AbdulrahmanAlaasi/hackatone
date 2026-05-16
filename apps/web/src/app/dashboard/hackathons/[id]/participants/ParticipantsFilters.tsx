'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SearchBar } from '@/components/ui';

const STATUSES = ['all', 'pending', 'accepted', 'rejected', 'waitlisted'] as const;

export function ParticipantsFilters({ status, q }: { status: string; q: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(next: Partial<{ status: string; q: string }>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === 'all') sp.delete(k);
      else sp.set(k, v);
    });
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => update({ status: s })}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: status === s ? 'var(--color-primary)' : 'var(--color-surface)',
              color: status === s ? '#fff' : 'var(--color-text)',
              fontWeight: 800,
              fontSize: 'var(--font-size-label)',
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <SearchBar value={q} onChange={(v) => update({ q: v })} placeholder="Search name, email, org…" />
      </div>
    </div>
  );
}
