'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function PublishButton({
  hackathonId,
  published,
  slug,
}: {
  hackathonId: string;
  published: boolean;
  slug: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function recompute() {
    start(() => {
      void (async () => {
        setMsg(null);
        const res = await fetch('/api/leaderboard/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hackathonId }),
        }).then((r) => r.json());
        setMsg(res.ok ? `Recomputed and published (${res.count} entries).` : (res.error ?? 'Error'));
        router.refresh();
      })();
    });
  }

  function doUnpublish() {
    start(() => {
      void (async () => {
        setMsg(null);
        const res = await fetch('/api/leaderboard/unpublish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hackathonId }),
        }).then((r) => r.json());
        setMsg(res.ok ? 'Leaderboard unpublished.' : (res.error ?? 'Error'));
        router.refresh();
      })();
    });
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button loading={pending} onClick={recompute}>
        Recompute &amp; publish
      </Button>
      {published ? (
        <>
          <Button variant="secondary" loading={pending} onClick={doUnpublish}>
            Unpublish
          </Button>
          <Link href={`/leaderboard/${slug}`} target="_blank" style={{ alignSelf: 'center' }}>
            View public leaderboard ↗
          </Link>
        </>
      ) : null}
      {msg ? <span style={{ color: 'var(--color-text-muted)' }}>{msg}</span> : null}
    </div>
  );
}
