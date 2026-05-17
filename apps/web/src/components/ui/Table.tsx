import * as React from 'react';
import styles from './Table.module.css';
import { cn } from '@/lib/cn';

export function Table({ className, ...rest }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className={styles.scroll}>
      <table className={cn(styles.table, className)} {...rest} />
    </div>
  );
}

export const Thead = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const Tbody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export const Tr = (p: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...p} />;
export const Th = (p: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...p} />;
export const Td = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => <td {...p} />;

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyOrb} aria-hidden />
      <p className={styles.emptyTitle}>{title}</p>
      {body ? <p className={styles.emptyBody}>{body}</p> : null}
    </div>
  );
}
