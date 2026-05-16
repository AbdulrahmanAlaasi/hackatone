'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { updateHackathon } from './actions';

function dt(v: string | null) {
  if (!v) return '';
  const d = new Date(v);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditHackathonForm({ hackathon }: { hackathon: any }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: hackathon.title ?? '',
    description: hackathon.description ?? '',
    location: hackathon.location ?? '',
    starts_at: dt(hackathon.starts_at),
    ends_at: dt(hackathon.ends_at),
    registration_deadline: dt(hackathon.registration_deadline),
    submission_deadline: dt(hackathon.submission_deadline),
    min_team_size: hackathon.min_team_size ?? 1,
    max_team_size: hackathon.max_team_size ?? 5,
    team_mode: hackathon.team_mode,
    solo_allowed: !!hackathon.solo_allowed,
    status: hackathon.status,
    rules: hackathon.rules ?? '',
    prizes: hackathon.prizes ?? '',
    chat_enabled: !!hackathon.chat_enabled,
    public_gallery_enabled: !!hackathon.public_gallery_enabled,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
    setSaved(false);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        start(() => {
          void (async () => {
            const res = await updateHackathon(hackathon.id, {
              ...form,
              starts_at: form.starts_at || null,
              ends_at: form.ends_at || null,
              registration_deadline: form.registration_deadline || null,
              submission_deadline: form.submission_deadline || null,
            });
            if (!res.ok) setError(res.error);
            else {
              setSaved(true);
              router.refresh();
            }
          })();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}
    >
      <Field label="Title" htmlFor="title">
        <Input id="title" required value={form.title} onChange={(e) => set('title', e.target.value)} />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <Field label="Location" htmlFor="location">
        <Input id="location" value={form.location} onChange={(e) => set('location', e.target.value)} />
      </Field>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Field label="Starts at" htmlFor="starts_at">
          <Input id="starts_at" type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
        </Field>
        <Field label="Ends at" htmlFor="ends_at">
          <Input id="ends_at" type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} />
        </Field>
        <Field label="Registration deadline" htmlFor="reg">
          <Input id="reg" type="datetime-local" value={form.registration_deadline} onChange={(e) => set('registration_deadline', e.target.value)} />
        </Field>
        <Field label="Submission deadline" htmlFor="sub">
          <Input id="sub" type="datetime-local" value={form.submission_deadline} onChange={(e) => set('submission_deadline', e.target.value)} />
        </Field>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <Field label="Min team size" htmlFor="min">
          <Input id="min" type="number" min={1} value={form.min_team_size} onChange={(e) => set('min_team_size', +e.target.value)} />
        </Field>
        <Field label="Max team size" htmlFor="max">
          <Input id="max" type="number" min={1} value={form.max_team_size} onChange={(e) => set('max_team_size', +e.target.value)} />
        </Field>
        <Field label="Team formation" htmlFor="mode">
          <Select id="mode" value={form.team_mode} onChange={(e) => set('team_mode', e.target.value as any)}>
            <option value="organizer_assigns">Organizer assigns</option>
            <option value="participant_creates">Participants create teams</option>
            <option value="team_code">Join by team code</option>
            <option value="invite_link">Join by invite link</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </Field>
        <Field label="Solo allowed" htmlFor="solo">
          <Select id="solo" value={String(form.solo_allowed)} onChange={(e) => set('solo_allowed', e.target.value === 'true')}>
            <option value="false">Not allowed</option>
            <option value="true">Allowed</option>
          </Select>
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" value={form.status} onChange={(e) => set('status', e.target.value as any)}>
            <option value="draft">Draft</option>
            <option value="registration_open">Registration open</option>
            <option value="registration_closed">Registration closed</option>
            <option value="active">Active</option>
            <option value="judging">Judging</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        <Field label="Chat" htmlFor="chat">
          <Select id="chat" value={String(form.chat_enabled)} onChange={(e) => set('chat_enabled', e.target.value === 'true')}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </Select>
        </Field>
        <Field label="Public gallery" htmlFor="gallery">
          <Select id="gallery" value={String(form.public_gallery_enabled)} onChange={(e) => set('public_gallery_enabled', e.target.value === 'true')}>
            <option value="false">Hidden</option>
            <option value="true">Public</option>
          </Select>
        </Field>
      </div>

      <Field label="Rules" htmlFor="rules">
        <Textarea id="rules" value={form.rules} onChange={(e) => set('rules', e.target.value)} />
      </Field>
      <Field label="Prizes" htmlFor="prizes">
        <Textarea id="prizes" value={form.prizes} onChange={(e) => set('prizes', e.target.value)} />
      </Field>

      {error ? <p style={{ color: 'var(--color-warning-text)', fontWeight: 700 }}>{error}</p> : null}
      {saved ? (
        <p
          style={{
            background: 'var(--color-success)',
            color: 'var(--color-success-text)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            margin: 0,
          }}
        >
          Saved.
        </p>
      ) : null}

      <div>
        <Button type="submit" loading={pending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
