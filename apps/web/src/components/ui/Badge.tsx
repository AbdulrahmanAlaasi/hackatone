import * as React from 'react';
import styles from './Badge.module.css';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'success' | 'warning' | 'info' | 'primary' | 'secondary';

export function Badge({
  tone = 'neutral',
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn(styles.badge, styles[tone], className)} {...rest} />;
}
