import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const STATUS_STEPS = [
  'Connecting Firebase',
  'Restoring Secure Session',
  'Loading User Profile',
  'Syncing Dashboard',
  'Finalizing Workspace',
];

export const PremiumLoader = ({ isDone = false, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STATUS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + Math.floor(Math.random() * 12) + 5;
        }
        return 95;
      });
    }, 300);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (isDone) {
      setProgress(100);
      setCurrentStepIndex(STATUS_STEPS.length - 1);
    }
  }, [isDone]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0d14] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden"
      >
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Center Glassmorphic Luxury Card */}
        <motion.div
          initial={{ scale: 0.94, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: -10, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative w-full max-w-sm mx-4 bg-[#141724]/90 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center text-center overflow-hidden"
        >
          {/* Subtle Top Inner Edge Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* Animated Logo Container */}
          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="relative mb-6"
          >
            {/* Pulsing Backlight */}
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-lg animate-pulse" />

            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 flex items-center justify-center border border-indigo-300/30 shadow-xl shadow-indigo-600/30">
              <Wallet className="w-8 h-8 text-white stroke-[2.2]" />
            </div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#141724] border border-amber-400/40 text-amber-400"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
          </motion.div>

          {/* Main Title & Animated Text */}
          <h3 className="text-lg font-bold text-white tracking-tight mb-1">
            LuxeExpense
          </h3>

          <div className="h-6 flex items-center justify-center mb-6">
            <motion.p
              key={currentStepIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className="text-xs font-semibold text-indigo-400 flex items-center gap-1"
            >
              <span>{STATUS_STEPS[currentStepIndex]}</span>
              <span className="inline-flex">
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                >
                  .
                </motion.span>
              </span>
            </motion.p>
          </div>

          {/* Luxury Progress Bar with Shimmer Effect */}
          <div className="w-full bg-[#171928] rounded-full h-2 p-0.5 overflow-hidden border border-white/5 mb-6 relative">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 relative overflow-hidden"
              initial={{ width: '10%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Shimmer Sweep overlay */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
            </motion.div>
          </div>

          {/* Micro Status Indicators */}
          <div className="w-full space-y-1.5 text-left border-t border-white/5 pt-4">
            {STATUS_STEPS.slice(0, currentStepIndex + 1).map((step, idx) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2 text-[11px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">{step}</span>
              </motion.div>
            ))}
          </div>

          {/* Footer Security Badge */}
          <div className="mt-5 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>256-Bit Encrypted Session</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
