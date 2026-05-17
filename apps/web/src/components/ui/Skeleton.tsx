import * as React from 'react';
import styles from './Skeleton.module.css';
import { cn } from '@/lib/cn';

export function Skeleton({
  width,
  height = 16,
  rounded = 8,
  className,
  style,
}: {
  width?: number | string;
  height?: number | string;
  rounded?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={cn(styles.shimmer, className)}
      style={{ width: width ?? '100%', height, borderRadius: rounded, ...style }}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className={styles.card}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="40%" style={{ marginTop: 10 }} />
      <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={12} width={`${85 - i * 12}%`} />
        ))}
      </div>
    </div>
  );
}
