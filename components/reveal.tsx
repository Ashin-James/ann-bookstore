'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView, type Variant } from 'motion/react';

type RevealVariant = 'fadeUp' | 'fadeIn' | 'scaleUp' | 'slideLeft' | 'slideRight' | 'fadeUpSlow';

const variants: Record<RevealVariant, { hidden: Variant; visible: Variant }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  },
  fadeUpSlow: {
    hidden: { opacity: 0, y: 64 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  },
  slideRight: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  },
};

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
  /** If true, uses stagger animation on direct children */
  stagger?: boolean;
  staggerDelay?: number;
  once?: boolean;
  threshold?: number;
}

export default function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  className = '',
  as = 'div',
  stagger = false,
  staggerDelay = 0.1,
  once = true,
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const v = variants[variant];
  const Component = motion[as] as typeof motion.div;

  if (stagger) {
    return (
      <Component
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: delay,
            },
          },
        }}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={ref}
      className={className}
      variants={v}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

/** Child item used inside a stagger Reveal parent */
export function RevealItem({
  children,
  className = '',
  variant = 'fadeUp',
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
}) {
  const v = variants[variant];
  return (
    <motion.div className={className} variants={v}>
      {children}
    </motion.div>
  );
}
