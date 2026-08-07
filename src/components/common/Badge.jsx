import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const baseStyles =
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md border transition-all';

  const variants = {
    default: 'bg-slate-800/60 text-slate-300 border-slate-700/50',
    primary: 'bg-purple-500/15 text-purple-300 border-purple-500/30 glow-primary',
    secondary: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 glow-success',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30 glow-warning',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30 glow-danger',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};
