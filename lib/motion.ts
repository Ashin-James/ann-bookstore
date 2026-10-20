/**
 * Design Tokens: Motion and Animation Presets
 * Used across the entire application for consistent transitions and springs.
 * Only transform and opacity are animated to prevent layout-thrashing.
 */

export const motionTokens = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.35,
    relaxed: 0.5,
    heroTotal: 1.4, // orchestrated hero entrance under 1.6s
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
    subtle: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  },
  spring: {
    gentle: { type: 'spring' as const, stiffness: 120, damping: 14, mass: 1 },
    snappy: { type: 'spring' as const, stiffness: 300, damping: 24, mass: 0.8 },
    drawer: { type: 'spring' as const, stiffness: 260, damping: 28, mass: 1 },
    modal: { type: 'spring' as const, stiffness: 340, damping: 30, mass: 1 },
  },
};

export const heroVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: motionTokens.duration.normal,
      ease: [0.2, 0.0, 0, 1.0],
    },
  }),
};

export const staggerGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const cardItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.normal,
      ease: [0.2, 0.0, 0, 1.0],
    },
  },
};

export const drawerVariants = {
  closed: { x: '100%', opacity: 0.5 },
  open: {
    x: '0%',
    opacity: 1,
    transition: motionTokens.spring.drawer,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: motionTokens.duration.fast, ease: [0.4, 0.0, 1.0, 1.0] },
  },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: motionTokens.spring.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: motionTokens.duration.fast },
  },
};

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.fast, ease: [0.2, 0.0, 0, 1.0] },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionTokens.duration.instant },
  },
};
