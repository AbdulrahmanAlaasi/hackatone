'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@/components/ui';
import { deleteAnnouncement, toggleAnnouncementHidden } from './actions';

export function AnnouncementActions({
  hackathonId,
  announcementId,
  hidden,
}: {
  hackathonId: string;
  announcementId: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
      <Button
        variant="text"
        loading={pending}
        aria-label={hidden ? 'Unhide' : 'Hide'}
        onClick={() =>
          start(() => {
            void (async () => {
              await toggleAnnouncementHidden(hackathonId, announcementId, !hidden);
              router.refresh();
            })();
          })
        }
      >
        {hidden ? <Icon.Eye size={18} /> : <Icon.EyeOff size={18} />}
      </Button>
      <Button
        variant="text"
        loading={pending}
        aria-label="Delete"
        onClick={() =>
          start(() => {
            void (async () => {
              if (!confirm('Delete this announcement? This cannot be undone.')) return;
              await deleteAnnouncement(hackathonId, announcementId);
              router.refresh();
            })();
          })
        }
      >
        <Icon.Trash size={18} />
      </Button>
    </div>
  );
}
