import * as React from 'react';
import Link from 'next/link';
import styles from './ActionTile.module.css';
import { cn } from '@/lib/cn';

type Tone = 'sunrise' | 'peach' | 'cream' | 'sky' | 'mint' | 'plain';

export function ActionTile({
  href,
  icon,
  title,
  subtitle,
  tone = 'sunrise',
}: {
  href: string;
  icon: string;
  title: string;
  subtitle?: string;
  tone?: Tone;
}) {
  return (
    <Link href={href} className={cn(styles.tile, styles[`tone_${tone}`])}>
      <span className={styles.icon} aria-hidden>{icon}</span>
      <span className={styles.title}>{title}</span>
      {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
    </Link>
  );
}
