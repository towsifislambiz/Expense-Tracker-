export const cardVariants = {
  initial: {
    opacity: 0,
    y: 15,
    scale: 0.98,
  },
  animate: (index = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      delay: index * 0.06,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
  },
};
