'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

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

  function decide(decision: 'accepted' | 'rejected' | 'pending') {
    start(async () => {
      await fetch('/api/participants/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackathonId, registrationId, decision }),
      });
      router.refresh();
    });
  }

  function checkIn(undo = false) {
    start(async () => {
      await fetch('/api/participants/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackathonId, registrationId, undo }),
      });
      router.refresh();
    });
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      {status === 'pending' || status === 'waitlisted' ? (
        <>
          <Button variant="secondary" loading={pending} onClick={() => decide('accepted')}>
            Accept
          </Button>
          <Button variant="text" loading={pending} onClick={() => decide('rejected')}>
            Reject
          </Button>
        </>
      ) : status === 'accepted' ? (
        checkedIn ? (
          <Button variant="text" loading={pending} onClick={() => checkIn(true)}>
            Undo check-in
          </Button>
        ) : (
          <Button variant="secondary" loading={pending} onClick={() => checkIn()}>
            Check in
          </Button>
        )
      ) : (
        <Button variant="text" loading={pending} onClick={() => decide('pending')}>
          Reopen
        </Button>
      )}
    </div>
  );
}
