'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { SKILL_LEVELS, registrationFormSchema } from '@hackatone/shared';

interface Props {
  hackathonId: string;
  hackathonSlug: string;
  hackathonTitle: string;
  tracks: Array<{ id: string; name: string; description: string | null }>;
}

export function RegistrationForm({ hackathonId, hackathonSlug, hackathonTitle, tracks }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    university_or_company: '',
    major_or_job_title: '',
    skill_level: '' as '' | (typeof SKILL_LEVELS)[number],
    skills: '',
    preferred_track_id: '',
    github_url: '',
    team_preference: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registrationFormSchema.safeParse({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || undefined,
      university_or_company: form.university_or_company || undefined,
      major_or_job_title: form.major_or_job_title || undefined,
      skill_level: form.skill_level || undefined,
      skills: form.skills
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      github_url: form.github_url || undefined,
      team_preference: form.team_preference || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your inputs.');
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: insertError } = await supabase.from('registrations').insert({
      hackathon_id: hackathonId,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      organization_or_company: form.university_or_company || null,
      major_or_job_title: form.major_or_job_title || null,
      skill_level: form.skill_level || null,
      skills: form.skills
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      preferred_track_id: form.preferred_track_id || null,
      github_url: form.github_url || null,
      team_preference: form.team_preference || null,
      status: 'pending',
    });
    setLoading(false);

    if (insertError) {
      if (insertError.code === '23505') {
        setError('This email is already registered for this hackathon.');
      } else {
        setError(insertError.message);
      }
      return;
    }

    router.push(
      `/registration-success?hackathon=${encodeURIComponent(hackathonTitle)}&slug=${hackathonSlug}`,
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
      <Field label="Full name" htmlFor="r-name">
        <Input id="r-name" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
      </Field>
      <Field label="Email" htmlFor="r-email" hint="Use this same email to sign into the Hackatone mobile app.">
        <Input id="r-email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
      </Field>
      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Field label="Phone (optional)" htmlFor="r-phone">
          <Input id="r-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="University / company" htmlFor="r-univ">
          <Input id="r-univ" value={form.university_or_company} onChange={(e) => set('university_or_company', e.target.value)} />
        </Field>
        <Field label="Major / job title" htmlFor="r-major">
          <Input id="r-major" value={form.major_or_job_title} onChange={(e) => set('major_or_job_title', e.target.value)} />
        </Field>
        <Field label="Skill level" htmlFor="r-skill">
          <Select id="r-skill" value={form.skill_level} onChange={(e) => set('skill_level', e.target.value as any)}>
            <option value="">Prefer not to say</option>
            {SKILL_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Skills" htmlFor="r-skills" hint="Comma-separated. e.g. React, Python, design">
        <Input id="r-skills" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
      </Field>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Field label="Preferred track" htmlFor="r-track">
          <Select id="r-track" value={form.preferred_track_id} onChange={(e) => set('preferred_track_id', e.target.value)}>
            <option value="">No preference</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="GitHub / portfolio URL" htmlFor="r-gh">
          <Input id="r-gh" type="url" placeholder="https://github.com/you" value={form.github_url} onChange={(e) => set('github_url', e.target.value)} />
        </Field>
      </div>

      <Field
        label="Team preference"
        htmlFor="r-team"
        hint="Looking for a team? Already have one? Tell the organizers."
      >
        <Textarea id="r-team" value={form.team_preference} onChange={(e) => set('team_preference', e.target.value)} />
      </Field>

      {error ? (
        <p
          role="alert"
          style={{
            background: 'var(--color-warning)',
            color: 'var(--color-warning-text)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            margin: 0,
          }}
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" fullWidth loading={loading}>
        Submit registration
      </Button>
      <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
        Your registration starts as <strong>pending</strong>. Organizers will accept or decline it.
      </p>
    </form>
  );
}
