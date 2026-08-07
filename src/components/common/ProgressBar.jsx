import React from 'react';

export const ProgressBar = ({ progress = 0, color = '#8B5CF6', height = 'h-2' }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${height} border border-white/5`}>
      <div
        className="h-full transition-all duration-500 rounded-full"
        style={{
          width: `${clampedProgress}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
          boxShadow: `0 0 10px ${color}80`,
        }}
      />
    </div>
  );
};
