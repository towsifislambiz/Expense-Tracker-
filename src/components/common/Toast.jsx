import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, RotateCcw } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

export const Toast = () => {
  const { toastMessage, undoDelete, lastDeleted } = useExpenses();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 text-slate-100 shadow-2xl glow-purple"
      >
        <div>{icons[toastMessage.type] || icons.info}</div>
        <div className="text-sm font-medium pr-2">{toastMessage.message}</div>
        {lastDeleted && toastMessage.type === 'warning' && (
          <button
            onClick={undoDelete}
            className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
