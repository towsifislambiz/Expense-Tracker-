import React from 'react';

export const Skeleton = ({ className = '', height = 'h-4', width = 'w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-xl border border-white/5 ${height} ${width} ${className}`}
    />
  );
};
