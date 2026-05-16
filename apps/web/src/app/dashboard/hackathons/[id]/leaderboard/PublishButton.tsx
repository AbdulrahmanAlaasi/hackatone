'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { recomputeAndPublish, unpublish } from './actions';

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

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button
        loading={pending}
        onClick={() =>
          start(async () => {
            setMsg(null);
            const res = await recomputeAndPublish(hackathonId);
            setMsg(res.ok ? `Recomputed and published (${res.count} entries).` : res.error);
            router.refresh();
          })
        }
      >
        Recompute & publish
      </Button>
      {published ? (
        <>
          <Button
            variant="secondary"
            loading={pending}
            onClick={() =>
              start(async () => {
                await unpublish(hackathonId);
                setMsg('Leaderboard unpublished.');
                router.refresh();
              })
            }
          >
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
