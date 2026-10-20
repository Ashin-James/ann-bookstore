import React, { ReactNode } from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}

export default function Container({
  children,
  className = '',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  return (
    <Component className={`layout-container ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
