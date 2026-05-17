'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@/components/ui';
import { regenerateSummary } from './actions';

export function RegenerateSummaryButton({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="text"
      loading={pending}
      onClick={() =>
        start(() => {
          void (async () => {
            await regenerateSummary(submissionId);
            router.refresh();
          })();
        })
      }
    >
      <Icon.Sparkles size={14} /> Regenerate
    </Button>
  );
}
