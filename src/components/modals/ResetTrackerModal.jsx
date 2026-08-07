import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { countFinancialRecords } from '../../services/firestore/resetTrackerService';
import { useAuth } from '../../context/AuthContext';

export const ResetTrackerModal = ({ isOpen, onClose, onConfirmReset }) => {
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const [counts, setCounts] = useState({ transactions: 0, budgets: 0, dailyExpenses: 0, goals: 0, reports: 0, total: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch pre-deletion document counts when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setIsLoadingCounts(true);
      setErrorMsg('');
      setInputText('');
      setIsExecuting(false);
      setProgressMsg('');

      countFinancialRecords(currentUser.uid)
        .then((res) => {
          setCounts(res);
        })
        .catch(() => {
          setCounts({ transactions: 0, budgets: 0, dailyExpenses: 0, goals: 0, reports: 0, total: 0 });
        })
        .finally(() => {
          setIsLoadingCounts(false);
        });
    }
  }, [isOpen, currentUser]);

  // Suppress Escape key during execution
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isExecuting && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, isExecuting]);

  if (!isOpen) return null;

  const isConfirmed = inputText.trim() === 'RESET';

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!isConfirmed || isExecuting) return;

    setErrorMsg('');
    setIsExecuting(true);
    setProgressMsg('Pausing Firestore Listeners...');

    try {
      await onConfirmReset((stepText) => {
        setProgressMsg(stepText);
      });
      // Context reset and navigation complete
    } catch (err) {
      console.error('Reset Tracker Modal Error:', err);
      setErrorMsg(err.message || 'Failed to complete tracker reset. Please try again.');
      setIsExecuting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        onClick={(e) => {
          // Block backdrop clicks during execution
          if (!isExecuting && onClose) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#131524] border border-rose-500/30 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Reset All Financial Data?</h3>
                <p className="text-xs text-rose-400 font-semibold">Irreversible Action • Keep Account Active</p>
              </div>
            </div>

            {!isExecuting && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="py-4 space-y-4 text-xs">
            {/* Warning Box */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-200 space-y-1.5 leading-relaxed">
              <p className="font-bold text-rose-300">
                This action will permanently remove every financial record from your Expense Tracker.
              </p>
              <p className="text-slate-400 text-[11px]">
                Your account, email, password, profile photo, and login session will remain completely active.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 flex items-center space-x-2 font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Stage 1: Document Impact Summary */}
            {!isExecuting && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#171928] border border-white/10 space-y-2">
                  <span className="font-semibold text-slate-300 block border-b border-white/5 pb-1">
                    Financial Records To Be Deleted ({isLoadingCounts ? '...' : counts.total}):
                  </span>
                  {isLoadingCounts ? (
                    <div className="flex items-center space-x-2 text-slate-400 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Counting financial documents...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-300">
                      <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
                        <span>Transactions:</span>
                        <strong className="text-rose-400">{counts.transactions}</strong>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
                        <span>Budgets:</span>
                        <strong className="text-rose-400">{counts.budgets}</strong>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
                        <span>Daily Expense Entries:</span>
                        <strong className="text-rose-400">{counts.dailyExpenses}</strong>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
                        <span>Goals & Reports:</span>
                        <strong className="text-rose-400">{counts.goals + counts.reports}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Confirmation Box */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    To confirm reset, type <span className="text-rose-400 font-bold uppercase">RESET</span> below:
                  </label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type RESET"
                    disabled={isExecuting}
                    className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold tracking-widest placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors uppercase"
                  />
                </div>
              </div>
            )}

            {/* Stage 2: Execution & Progress Lock */}
            {isExecuting && (
              <div className="p-6 rounded-xl bg-slate-900/90 border border-rose-500/30 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
                <div>
                  <p className="text-sm font-bold text-white tracking-wide">Resetting Your Tracker...</p>
                  <p className="text-xs text-rose-300 font-semibold mt-1">{progressMsg}</p>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Action locked. Please do not close the application.</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              disabled={isExecuting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!isConfirmed || isExecuting || isLoadingCounts}
              onClick={handleResetSubmit}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors shadow-lg shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Everything</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
