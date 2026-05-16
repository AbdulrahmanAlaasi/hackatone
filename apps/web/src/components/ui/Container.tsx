import * as React from 'react';

type Size = 'default' | 'form' | 'detail';

const max: Record<Size, string> = {
  default: 'var(--container-max)',
  form: 'var(--form-max)',
  detail: 'var(--detail-max)',
};

export function Container({
  size = 'default',
  children,
}: {
  size?: Size;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        maxWidth: max[size],
        margin: '0 auto',
        padding: '0 var(--space-4)',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
