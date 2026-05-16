import * as React from 'react';
import type { ReactNode } from 'react';
import styles from './Hero.module.css';
import { cn } from '@/lib/cn';

type HeroTone = 'sunrise' | 'peach' | 'cream' | 'sky' | 'mint';

export function Hero({
  tone = 'sunrise',
  children,
  className,
}: {
  tone?: HeroTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(styles.hero, styles[`tone_${tone}`], className)}>
      <div className={styles.inner}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className, light }: { children: ReactNode; className?: string; light?: boolean }) {
  return (
    <p className={cn(styles.eyebrow, light && styles.eyebrowLight, className)}>{children}</p>
  );
}

export function Display({
  children,
  className,
  light,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return <h1 className={cn(styles.display, light && styles.displayLight, className)}>{children}</h1>;
}
