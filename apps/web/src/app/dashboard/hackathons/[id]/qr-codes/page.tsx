import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { Card } from '@/components/ui';
import { getCurrentUserOrRedirect } from '@/lib/auth';
import { CopyButton } from './CopyButton';

export default async function QrCodesPage({ params }: { params: { id: string } }) {
  const { supabase } = await getCurrentUserOrRedirect();
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, title, slug')
    .eq('id', params.id)
    .maybeSingle();
  if (!hackathon) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const registrationUrl = `${siteUrl}/register/${hackathon.slug}`;

  const qrDataUrl = await QRCode.toDataURL(registrationUrl, {
    width: 480,
    margin: 2,
    color: { dark: '#2B2B2B', light: '#FFFFFF' },
  });

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

      <Card>
        <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>QR code</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Print or display this for in-person registration.</p>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`Registration QR for ${hackathon.title}`}
            width={320}
            height={320}
            style={{ borderRadius: 'var(--radius-md)' }}
          />
        </div>
        <a href={qrDataUrl} download={`hackatone-${hackathon.slug}.png`}>
          Download PNG
        </a>
      </Card>
    </div>
  );
}
