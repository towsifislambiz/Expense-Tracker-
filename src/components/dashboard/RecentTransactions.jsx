import React from 'react';
import { motion } from 'framer-motion';
import {
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
  Edit2,
  Trash2,
} from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';

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

export const RecentTransactions = ({ onOpenAddModal, onEditTransaction }) => {
  const { transactions, deleteTransaction, searchQuery, setActiveTab } = useExpenses();
  const { formatMoney } = useCurrency();

  const filteredTransactions = transactions
    .filter((t) =>
      searchQuery
        ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .slice(0, 6);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-400">Latest financial ledger activity</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            View All ({transactions.length})
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs text-slate-500 mt-1">Add a transaction to see your ledger activity.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const IconComponent = ICON_MAP[tx.category] || MoreHorizontal;
            const isIncome = tx.type === 'income';

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 hover:bg-slate-800/60 transition-all"
              >
                {/* Icon & Details */}
                <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-200 transition-colors">
                      {tx.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="capitalize font-medium text-slate-300">{tx.category}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Amount, Status & Actions */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-bold tracking-tight ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} className="mt-0.5">
                      {tx.status}
                    </Badge>
                  </div>

                  {/* Action Menu (Mobile & Touch Friendly) */}
                  <div className="flex items-center space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTransaction && onEditTransaction(tx)}
                      title="Edit transaction"
                      aria-label={`Edit ${tx.title}`}
                      className="p-1.5 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Delete transaction"
                      aria-label={`Delete ${tx.title}`}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
