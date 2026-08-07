import React from 'react';

export const BackgroundOrbs = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Left Radial Purple Glow */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse-glow" />

      {/* Top Right Cyan Glow */}
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] animate-float-orb" />

      {/* Center Bottom Indigo Glow */}
      <div className="absolute top-[40%] left-[30%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[160px] pointer-events-none" />

      {/* Subtle Mesh Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
      />
    </div>
  );
};
