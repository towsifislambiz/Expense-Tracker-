/**
 * Framer Motion Animation Variants & Transition Tokens
 */

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: 15, transition: { duration: 0.2 } },
};

export const slideInLeft = {
  initial: { x: '-100%' },
  animate: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 250 } },
  exit: { x: '-100%', transition: { duration: 0.25 } },
};

export const scaleUp = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01, transition: { duration: 0.2, ease: 'easeOut' } },
  tap: { scale: 0.98 },
};
