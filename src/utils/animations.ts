import { Variants } from 'framer-motion';

// Shake animation for incorrect answer feedback
export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  idle: {
    x: 0,
  }
};

// Smooth pop/scale for success feedback
export const popVariants: Variants = {
  pop: {
    scale: [1, 1.03, 1.02],
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  idle: {
    scale: 1,
  }
};

// Fade up animation for pages, question cards, and panels
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Micro-interactions for buttons and selectable cards
export const hoverScaleVariants = {
  hover: {
    y: -2,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
  },
};
