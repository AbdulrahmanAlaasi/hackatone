'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, useToast } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface Track {
  id: string;
  name: string;
  description: string | null;
}

export function TracksEditor({ hackathonId }: { hackathonId: string }) {
  const router = useRouter();
  const toast = useToast();
  const supabase = useState(() => createSupabaseBrowserClient())[0];
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    const { error: insertErr } = await supabase
      .from('hackathon_tracks')
      .insert({ hackathon_id: hackathonId, name: trimmed, description: description.trim() || null });
    setLoading(false);
    if (insertErr) {
      setError(insertErr.message);
      toast.error(`Track not added: ${insertErr.message}`);
      return;
    }
    toast.success(`Added "${trimmed}"`);
    setName('');
    setDescription('');
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'grid',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-3)',
        gridTemplateColumns: '1fr 2fr auto',
        alignItems: 'end',
      }}
    >
      <Field label="Name" htmlFor="t-name">
        <Input
          id="t-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AI for Good"
        />
      </Field>
      <Field label="Description" htmlFor="t-desc">
        <Input
          id="t-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional context for participants"
        />
      </Field>
      <Button type="submit" loading={loading}>
        Add track
      </Button>
      {error ? (
        <p
          style={{
            gridColumn: '1 / -1',
            margin: 0,
            color: 'var(--color-warning-text)',
            fontWeight: 700,
          }}
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function DeleteTrackButton({
  hackathonId,
  trackId,
}: {
  hackathonId: string;
  trackId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const supabase = useState(() => createSupabaseBrowserClient())[0];
  const [, start] = useTransition();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!confirm('Delete this track?')) return;
    setPending(true);
    const { error } = await supabase.from('hackathon_tracks').delete().eq('id', trackId);
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Track removed');
    start(() => router.refresh());
  }

  return (
    <Button variant="text" loading={pending} onClick={remove}>
      Remove
    </Button>
  );
}
