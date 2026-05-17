'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { SKILL_LEVELS, registrationFormSchema } from '@hackatone/shared';
import { registerExistingUser, submitRegistration } from './actions';

interface Props {
  hackathonId: string;
  hackathonSlug: string;
  hackathonTitle: string;
  tracks: Array<{ id: string; name: string; description: string | null }>;
}

const MAX_CV_BYTES = 5 * 1024 * 1024;

export function RegistrationForm({ hackathonId, hackathonSlug, hackathonTitle, tracks }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    university_or_company: '',
    major_or_job_title: '',
    skill_level: '' as '' | (typeof SKILL_LEVELS)[number],
    skills: '',
    preferred_track_id: '',
    github_url: '',
    team_preference: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function fileToDataUrl(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // -------------------- existing-account path --------------------
    if (mode === 'existing') {
      if (!form.full_name.trim() || !form.email.trim()) {
        setError('Please enter your name and email.');
        return;
      }
      setLoading(true);
      const res = await registerExistingUser({
        hackathonId,
        email: form.email.trim().toLowerCase(),
        fullName: form.full_name,
        phone: form.phone || null,
        organizationOrCompany: form.university_or_company || null,
        majorOrJobTitle: form.major_or_job_title || null,
        preferredTrackId: form.preferred_track_id || null,
        teamPreference: form.team_preference || null,
      });
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const successEmail = encodeURIComponent(form.email.trim().toLowerCase());
      router.push(
        `/registration-success?hackathon=${encodeURIComponent(hackathonTitle)}&slug=${hackathonSlug}&email=${successEmail}`,
      );
      return;
    }

    // -------------------- new-account path (CV + password) --------------------
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

    if (!cvFile) {
      setError('Please upload your CV (PDF).');
      return;
    }
    if (cvFile.type !== 'application/pdf') {
      setError('CV must be a PDF.');
      return;
    }
    if (cvFile.size > MAX_CV_BYTES) {
      setError('CV is too large. Max 5 MB.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const cvDataUrl = await fileToDataUrl(cvFile);
    const res = await submitRegistration(
      {
        hackathonId,
        hackathonSlug,
        fullName: form.full_name,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone || null,
        organizationOrCompany: form.university_or_company || null,
        majorOrJobTitle: form.major_or_job_title || null,
        skillLevel: form.skill_level || null,
        skills: form.skills
          ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        preferredTrackId: form.preferred_track_id || null,
        githubUrl: form.github_url || null,
        teamPreference: form.team_preference || null,
      },
      cvDataUrl,
    );
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    const successEmail = encodeURIComponent(form.email.trim().toLowerCase());
    router.push(
      `/registration-success?hackathon=${encodeURIComponent(hackathonTitle)}&slug=${hackathonSlug}&email=${successEmail}`,
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
      {/* Mode toggle */}
      <div
        role="tablist"
        aria-label="Account mode"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: 4,
          background: 'var(--color-surface-soft)',
          borderRadius: 999,
          gap: 4,
        }}
      >
        {(['new', 'existing'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            style={{
              padding: '12px 16px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 'var(--font-size-body)',
              background: mode === m ? 'var(--color-primary)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--color-text)',
              transition: 'background-color 150ms ease',
            }}
          >
            {m === 'new' ? "I'm new here" : 'I already have an account'}
          </button>
        ))}
      </div>

      <Field label="Full name" htmlFor="r-name">
        <Input id="r-name" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
      </Field>
      <Field
        label="Email"
        htmlFor="r-email"
        hint={
          mode === 'existing'
            ? "We'll find your Hackatone account by this email."
            : "We'll create your Hackatone account with this email."
        }
      >
        <Input
          id="r-email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
      </Field>

      {/* New-account-only fields */}
      {mode === 'new' ? (
        <>
          <Field label="Password" htmlFor="r-pw" hint="At least 8 characters. You'll use this to sign into the mobile app.">
            <Input
              id="r-pw"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
          </Field>

          <Field
            label="CV (PDF, required)"
            htmlFor="r-cv"
            hint="We use AI to extract your skills so organizers can build balanced teams. Max 5 MB."
          >
            <input
              ref={fileRef}
              id="r-cv"
              type="file"
              accept="application/pdf"
              onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              required
              style={{
                display: 'block',
                width: '100%',
                padding: 12,
                background: 'var(--color-surface)',
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
                fontSize: 'var(--font-size-body)',
                cursor: 'pointer',
              }}
            />
            {cvFile ? (
              <p style={{ marginTop: 6, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>
                Selected: <strong>{cvFile.name}</strong> ({(cvFile.size / 1024).toFixed(0)} KB)
              </p>
            ) : null}
          </Field>
        </>
      ) : null}

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
        {mode === 'new' ? (
          <Field label="Self-reported skill level" htmlFor="r-skill">
            <Select id="r-skill" value={form.skill_level} onChange={(e) => set('skill_level', e.target.value as any)}>
              <option value="">Prefer not to say</option>
              {SKILL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </Select>
          </Field>
        ) : null}
      </div>

      {mode === 'new' ? (
        <Field label="Skills" htmlFor="r-skills" hint="Comma-separated. e.g. React, Python, design">
          <Input id="r-skills" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
        </Field>
      ) : null}

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Field label="Preferred track" htmlFor="r-track">
          <Select id="r-track" value={form.preferred_track_id} onChange={(e) => set('preferred_track_id', e.target.value)}>
            <option value="">No preference</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </Field>
        {mode === 'new' ? (
          <Field label="GitHub / portfolio URL" htmlFor="r-gh">
            <Input id="r-gh" type="url" placeholder="https://github.com/you" value={form.github_url} onChange={(e) => set('github_url', e.target.value)} />
          </Field>
        ) : null}
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
        {loading ? 'Submitting…' : mode === 'existing' ? 'Register with existing account' : 'Submit registration'}
      </Button>
      <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)', margin: 0 }}>
        Your registration starts as <strong>pending</strong>. Organizers will accept or decline it.
      </p>
    </form>
  );
}
