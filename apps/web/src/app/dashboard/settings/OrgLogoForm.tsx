'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input } from '@/components/ui';
import { updateOrgLogo } from './actions';

export function OrgLogoForm({
  orgId,
  orgName,
  initialLogoUrl,
}: {
  orgId: string;
  orgName: string;
  initialLogoUrl: string | null;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialLogoUrl ?? '');
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = url.trim();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        start(() => {
          void (async () => {
            const res = await updateOrgLogo(orgId, preview || null);
            if (!res.ok) setError(res.error);
            else {
              setSaved(true);
              router.refresh();
            }
          })();
        });
      }}
      style={{ display: 'grid', gap: 'var(--space-3)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={orgName}
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              objectFit: 'cover',
              background: '#fff',
              border: '1px solid var(--color-border)',
            }}
          />
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'var(--color-primary)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {orgName.slice(0, 1)}
          </div>
        )}
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-caption)' }}>
          Hosted image URL. (Upload-from-disk lands in the next batch — for now point at any public
          image.)
        </p>
      </div>
      <Field label="Logo URL" htmlFor="logo">
        <Input
          id="logo"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </Field>
      {error ? <p style={{ color: 'var(--color-warning-text)', fontWeight: 700, margin: 0 }}>{error}</p> : null}
      {saved ? <p style={{ color: 'var(--color-success-text)', fontWeight: 700, margin: 0 }}>Saved.</p> : null}
      <div>
        <Button type="submit" loading={pending}>Save logo</Button>
      </div>
    </form>
  );
}
