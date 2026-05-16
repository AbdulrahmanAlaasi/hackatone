import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-size-h1)', margin: 0 }}>Page not found</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>This Hackatone page does not exist.</p>
        <Link href="/">Go home</Link>
      </div>
    </main>
  );
}
