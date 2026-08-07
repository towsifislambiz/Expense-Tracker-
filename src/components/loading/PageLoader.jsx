import React from 'react';

export const PageLoader = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400">Loading views...</span>
    </div>
  );
};
