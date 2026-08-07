import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useBudgets } from '../../context/BudgetContext';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

export const BudgetModal = ({ isOpen, onClose, editData = null }) => {
  const { createBudget, updateBudget } = useBudgets();

  const [name, setName] = useState('');
  const [type, setType] = useState('overall'); // 'overall' | 'category'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [period, setPeriod] = useState('monthly');
  const [rolloverEnabled, setRolloverEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editData) {
      setName(editData.name || '');
      setType(editData.type || 'overall');
      setAmount(editData.amount !== undefined ? String(editData.amount) : '');
      setCategory(editData.category || 'food');
      setPeriod(editData.period || 'monthly');
      setRolloverEnabled(Boolean(editData.rolloverEnabled));
    } else {
      setName('Monthly Expenses');
      setType('overall');
      setAmount('');
      setCategory('food');
      setPeriod('monthly');
      setRolloverEnabled(false);
    }
    setErrorMsg('');
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter a budget name.');
      return;
    }
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorMsg('Please enter a valid budget limit amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        amount: numAmt,
        category: type === 'category' ? category : 'all',
        period,
        rolloverEnabled,
      };

      if (editData && editData.id) {
        await updateBudget(editData.id, payload);
      } else {
        await createBudget(payload);
      }

      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#131524] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editData ? 'Edit Budget' : 'Create New Budget'}
              </h3>
              <p className="text-xs text-slate-400">Set spending targets and control your finances.</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Budget Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Budget Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly Overall Limit, Grocery Budget"
                className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            {/* Budget Type & Period */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Scope</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="overall">Overall Total Expense</option>
                  <option value="category">Category Specific</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recurrence Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Category Select (only if Category Scope) */}
            {type === 'category' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer capitalize"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Limit Amount */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Budget Limit Amount</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#171928] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Rollover Checkbox */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Enable Unused Rollover</span>
                <span className="text-[11px] text-slate-400">Carry over unused balance to next month</span>
              </div>
              <input
                type="checkbox"
                checked={rolloverEnabled}
                onChange={(e) => setRolloverEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editData ? 'Update Budget' : 'Create Budget'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
