'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { checkInById, decideRegistration, undoCheckIn } from './actions';

export function RowActions({
  hackathonId,
  registrationId,
  status,
  checkedIn,
}: {
  hackathonId: string;
  registrationId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn';
  checkedIn: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      {status === 'pending' || status === 'waitlisted' ? (
        <>
          <Button variant="secondary" loading={pending} onClick={() => run(() => decideRegistration(hackathonId, registrationId, 'accepted'))}>
            Accept
          </Button>
          <Button variant="text" loading={pending} onClick={() => run(() => decideRegistration(hackathonId, registrationId, 'rejected'))}>
            Reject
          </Button>
        </>
      ) : status === 'accepted' ? (
        checkedIn ? (
          <Button variant="text" loading={pending} onClick={() => run(() => undoCheckIn(hackathonId, registrationId))}>
            Undo check-in
          </Button>
        ) : (
          <Button variant="secondary" loading={pending} onClick={() => run(() => checkInById(hackathonId, registrationId))}>
            Check in
          </Button>
        )
      ) : (
        <Button variant="text" loading={pending} onClick={() => run(() => decideRegistration(hackathonId, registrationId, 'pending'))}>
          Reopen
        </Button>
      )}
    </div>
  );
}
