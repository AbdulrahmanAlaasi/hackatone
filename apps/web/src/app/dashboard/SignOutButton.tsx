'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="text"
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.replace('/login');
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
