import React, { ReactNode } from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  id?: string;
  padding?: 'sm' | 'md' | 'lg' | string;
}

export default function Section({
  children,
  className = '',
  id,
  padding,
  ...props
}: SectionProps) {
  const padCls = padding ? `section-pad-${padding}` : '';
  return (
    <section id={id} className={`layout-section ${padCls} ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
