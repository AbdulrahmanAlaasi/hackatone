import * as React from 'react';
import styles from './Card.module.css';
import { cn } from '@/lib/cn';

type Tone = 'surface' | 'soft' | 'info';

export function Card({
  tone = 'surface',
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn(styles.card, styles[tone], className)} {...rest} />;
}

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.header, className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(styles.title, className)} {...rest} />;
}

export function CardBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.body, className)} {...rest} />;
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      {hint ? <span className={styles.statHint}>{hint}</span> : null}
    </Card>
  );
}
