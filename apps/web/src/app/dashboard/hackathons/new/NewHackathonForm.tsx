'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { createHackathon } from './actions';

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function NewHackathonForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [teamMode, setTeamMode] = useState<'organizer_assigns' | 'participant_creates' | 'team_code' | 'invite_link' | 'hybrid'>('participant_creates');
  const [soloAllowed, setSoloAllowed] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [fieldPreset, setFieldPreset] = useState('');
  const [fieldCustom, setFieldCustom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(() => {
          void (async () => {
            const res = await createHackathon({
              organization_id: organizationId,
              title,
              slug: slug || toSlug(title),
              description,
              location,
              starts_at: startsAt || null,
              ends_at: endsAt || null,
              registration_deadline: registrationDeadline || null,
              submission_deadline: submissionDeadline || null,
              min_team_size: minTeamSize,
              max_team_size: maxTeamSize,
              team_mode: teamMode,
              solo_allowed: soloAllowed,
              visibility,
              field: (fieldPreset === '__custom' ? fieldCustom : fieldPreset) || null,
            });
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.push(`/dashboard/hackathons/${res.id}`);
            router.refresh();
          })();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-4)' }}
    >
      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(toSlug(e.target.value));
          }}
        />
      </Field>
      <Field label="URL slug" htmlFor="slug" hint="Used in the public registration URL.">
        <Input
          id="slug"
          required
          pattern="[a-z0-9-]+"
          value={slug}
          onChange={(e) => setSlug(toSlug(e.target.value))}
        />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Location" htmlFor="location">
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </Field>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Field label="Starts at" htmlFor="starts_at">
          <Input id="starts_at" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Field>
        <Field label="Ends at" htmlFor="ends_at">
          <Input id="ends_at" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </Field>
        <Field label="Registration deadline" htmlFor="reg_deadline">
          <Input id="reg_deadline" type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} />
        </Field>
        <Field label="Submission deadline" htmlFor="sub_deadline">
          <Input id="sub_deadline" type="datetime-local" value={submissionDeadline} onChange={(e) => setSubmissionDeadline(e.target.value)} />
        </Field>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <Field label="Min team size" htmlFor="min">
          <Input id="min" type="number" min={1} value={minTeamSize} onChange={(e) => setMinTeamSize(+e.target.value)} />
        </Field>
        <Field label="Max team size" htmlFor="max">
          <Input id="max" type="number" min={1} value={maxTeamSize} onChange={(e) => setMaxTeamSize(+e.target.value)} />
        </Field>
        <Field label="Team formation" htmlFor="mode">
          <Select id="mode" value={teamMode} onChange={(e) => setTeamMode(e.target.value as any)}>
            <option value="organizer_assigns">Organizer assigns</option>
            <option value="participant_creates">Participants create teams</option>
            <option value="team_code">Join by team code</option>
            <option value="invite_link">Join by invite link</option>
            <option value="hybrid">Hybrid (any of the above)</option>
          </Select>
        </Field>
        <Field label="Solo participants" htmlFor="solo">
          <Select id="solo" value={String(soloAllowed)} onChange={(e) => setSoloAllowed(e.target.value === 'true')}>
            <option value="false">Not allowed</option>
            <option value="true">Allowed</option>
          </Select>
        </Field>
        <Field label="Visibility" htmlFor="vis" hint="Public hackathons show up in the participant app browse list.">
          <Select id="vis" value={visibility} onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}>
            <option value="private">Private (QR/link only)</option>
            <option value="public">Public (listed in app)</option>
          </Select>
        </Field>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: fieldPreset === '__custom' ? '1fr 1fr' : '1fr' }}>
        <Field label="Field / category" htmlFor="field">
          <Select id="field" value={fieldPreset} onChange={(e) => setFieldPreset(e.target.value)}>
            <option value="">No field</option>
            <option value="AI / Machine Learning">AI / Machine Learning</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Game Development">Game Development</option>
            <option value="Hardware / IoT">Hardware / IoT</option>
            <option value="Blockchain / Web3">Blockchain / Web3</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Sustainability / Climate">Sustainability / Climate</option>
            <option value="Education">Education</option>
            <option value="Open Innovation">Open Innovation</option>
            <option value="__custom">Custom…</option>
          </Select>
        </Field>
        {fieldPreset === '__custom' ? (
          <Field label="Custom field" htmlFor="field_custom">
            <Input id="field_custom" required value={fieldCustom} onChange={(e) => setFieldCustom(e.target.value)} placeholder="e.g. AR/VR" />
          </Field>
        ) : null}
      </div>

      {error ? <p style={{ color: 'var(--color-warning-text)', fontWeight: 700 }}>{error}</p> : null}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button type="submit" loading={pending}>
          Create hackathon
        </Button>
      </div>
      <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
        We&apos;ll seed the 5 default judging criteria automatically. Edit them on the next page.
      </p>
    </form>
  );
}
