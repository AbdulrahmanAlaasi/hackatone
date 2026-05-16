'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui';

export function QrCodeCard({
  registrationUrl,
  hackathonTitle,
  hackathonSlug,
}: {
  registrationUrl: string;
  hackathonTitle: string;
  hackathonSlug: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(registrationUrl, {
      width: 480,
      margin: 2,
      color: { dark: '#2B2B2B', light: '#FFFFFF' },
    })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [registrationUrl]);

  return (
    <Card>
      <h2 style={{ marginTop: 0, fontSize: 'var(--font-size-h2)', fontWeight: 800 }}>QR code</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>Print or display this for in-person registration.</p>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)', minHeight: 352 }}>
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`Registration QR for ${hackathonTitle}`}
            width={320}
            height={320}
            style={{ borderRadius: 'var(--radius-md)' }}
          />
        ) : (
          <div style={{ alignSelf: 'center', color: 'var(--color-text-muted)' }}>Generating QR code...</div>
        )}
      </div>
      {qrDataUrl ? (
        <a href={qrDataUrl} download={`hackatone-${hackathonSlug}.png`}>
          Download PNG
        </a>
      ) : null}
    </Card>
  );
}
