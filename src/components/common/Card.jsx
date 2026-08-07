import React from 'react';
import { motion } from 'framer-motion';
import { slideUp } from '../../utils/animations';

export const Card = ({
  children,
  className = '',
  interactive = false,
  glow = false,
  ...props
}) => {
  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      className={`rounded-2xl p-6 relative overflow-hidden ${
        interactive ? 'glass-card-interactive' : 'glass-card'
      } ${glow ? 'glow-primary' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
