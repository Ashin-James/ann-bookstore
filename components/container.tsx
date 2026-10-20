import React, { ReactNode } from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  size?: 'sm' | 'md' | 'lg' | string;
}

export default function Container({
  children,
  className = '',
  as: Component = 'div',
  size,
  ...props
}: ContainerProps) {
  const sizeCls = size ? `container-${size}` : '';
  return (
    <Component className={`layout-container ${sizeCls} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
