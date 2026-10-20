import React, { ReactNode } from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Section({
  children,
  className = '',
  id,
  ...props
}: SectionProps) {
  return (
    <section id={id} className={`layout-section ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
