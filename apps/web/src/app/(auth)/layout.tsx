import Link from 'next/link';
import { Container } from '@/components/ui';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', padding: '32px 0' }}>
      <Container size="form">
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: 'var(--space-6)',
            color: 'var(--color-primary-pressed)',
            fontWeight: 800,
          }}
        >
          ← Hackatone
        </Link>
        {children}
      </Container>
    </main>
  );
}
