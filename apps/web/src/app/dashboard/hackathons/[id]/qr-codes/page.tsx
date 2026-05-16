import { notFound } from 'next/navigation';
import { PUBLIC_WEB_URL } from '@hackatone/shared';
import { Card } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { CopyButton } from './CopyButton';
import { QrCodeCard } from './QrCodeCard';

export default async function QrCodesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, title, slug')
    .eq('id', id)
    .maybeSingle();
  if (!hackathon) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? PUBLIC_WEB_URL;
  const registrationUrl = `${siteUrl}/register/${hackathon.slug}`;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
      <Card>
        <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>Public registration link</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Share this URL or the QR code. It opens the public registration page for{' '}
          <strong>{hackathon.title}</strong>.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
            background: 'var(--color-surface-soft)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            wordBreak: 'break-all',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {registrationUrl}
        </div>
        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
          <CopyButton text={registrationUrl} />
          <a href={registrationUrl} target="_blank" rel="noreferrer" style={{ alignSelf: 'center' }}>
            Open ↗
          </a>
        </div>
      </Card>

      <QrCodeCard
        registrationUrl={registrationUrl}
        hackathonTitle={hackathon.title}
        hackathonSlug={hackathon.slug}
      />
    </div>
  );
}
