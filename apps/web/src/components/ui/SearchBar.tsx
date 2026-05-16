'use client';

import * as React from 'react';
import styles from './SearchBar.module.css';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className={styles.wrap}>
      <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden>
        <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}
