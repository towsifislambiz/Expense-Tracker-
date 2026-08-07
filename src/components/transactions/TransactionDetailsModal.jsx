import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Tag,
  FileText,
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  HeartPulse,
  Tv,
  Briefcase,
  Laptop,
  TrendingUp,
  Building,
  Gift,
  MoreHorizontal,
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { formatDate } from '../../utils/formatters';

const ICON_MAP = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  bills: Zap,
  entertainment: Film,
  healthcare: HeartPulse,
  subscriptions: Tv,
  salary: Briefcase,
  freelance: Laptop,
  investments: TrendingUp,
  business: Building,
  gifts: Gift,
  others: MoreHorizontal,
};

export const TransactionDetailsModal = ({ transaction, onClose, onEdit, onDelete }) => {
  const { formatMoney } = useCurrency();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!transaction) return null;

  const isIncome = String(transaction.type || '').toLowerCase().trim() === 'income';
  const IconComponent = ICON_MAP[transaction.category] || MoreHorizontal;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#131524] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isIncome
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{transaction.title}</h3>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Transaction Details
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-5 space-y-4">
            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Amount</span>
              <div className={`text-xl sm:text-2xl font-extrabold ${isIncome ? 'text-emerald-400' : 'text-white'}`}>
                {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
              </div>
            </div>

            {/* Field Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" /> Category
                </span>
                <p className="text-white font-semibold capitalize">{transaction.category}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date
                </span>
                <p className="text-white font-semibold">{formatDate(transaction.date)}</p>
              </div>
            </div>

            {/* Note / Memo */}
            {(transaction.notes || transaction.note) && (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> Notes
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {transaction.notes || transaction.note}
                </p>
              </div>
            )}

            {/* Timestamps */}
            {transaction.createdAt && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1 px-1">
                <Clock className="w-3 h-3 text-slate-400" /> Created: {new Date(transaction.createdAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
            <button
              onClick={() => {
                onDelete(transaction.id);
                onClose();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onEdit(transaction);
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 border border-purple-500 text-white hover:bg-purple-500 text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
