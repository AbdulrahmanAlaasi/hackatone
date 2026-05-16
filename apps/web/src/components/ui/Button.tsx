import * as React from 'react';
import styles from './Button.module.css';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'text' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, fullWidth, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        styles.btn,
        styles[variant],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || loading}
      data-loading={loading ? 'true' : undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
      <span>{children}</span>
    </button>
  ),
);
Button.displayName = 'Button';
