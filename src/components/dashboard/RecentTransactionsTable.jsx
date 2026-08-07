import React, { useState } from 'react';
import {
  ShoppingBag,
  Briefcase,
  Zap,
  Car,
  Laptop,
  ArrowDownRight,
  ArrowUpRight,
  MoreVertical,
  Edit2,
  Trash2,
  Utensils,
  Film,
  HeartPulse,
  Tv,
  TrendingUp,
  Building,
  Gift,
  MoreHorizontal
} from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';

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

const CATEGORY_BADGES = {
  food: { label: 'Food & Dining', className: 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' },
  shopping: { label: 'Shopping', className: 'bg-pink-600/15 text-pink-400 border border-pink-500/20' },
  transport: { label: 'Transport', className: 'bg-blue-600/15 text-blue-400 border border-blue-500/20' },
  bills: { label: 'Bills & Utilities', className: 'bg-amber-600/15 text-amber-400 border border-amber-500/20' },
  entertainment: { label: 'Entertainment', className: 'bg-cyan-600/15 text-cyan-400 border border-cyan-500/20' },
  healthcare: { label: 'Healthcare', className: 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20' },
  subscriptions: { label: 'Subscriptions', className: 'bg-purple-600/15 text-purple-400 border border-purple-500/20' },
  others: { label: 'Others', className: 'bg-slate-600/15 text-slate-400 border border-slate-500/20' },
  salary: { label: 'Salary', className: 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20' },
  freelance: { label: 'Freelance', className: 'bg-blue-600/15 text-blue-400 border border-blue-500/20' },
  investments: { label: 'Investments', className: 'bg-purple-600/15 text-purple-400 border border-purple-500/20' },
  business: { label: 'Business', className: 'bg-amber-600/15 text-amber-400 border border-amber-500/20' },
  gifts: { label: 'Gifts & Rewards', className: 'bg-pink-600/15 text-pink-400 border border-pink-500/20' },
};

export const RecentTransactionsTable = ({ onOpenAddModal, onEditTransaction }) => {
  const { currentMonthTransactions, setActiveTab, deleteTransaction } = useExpenses();
  const { formatMoney } = useCurrency();
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Strictly display current month transactions on Dashboard
  const displayTransactions = (currentMonthTransactions || []).slice(0, 5);

  return (
    <div className="card-locked p-5 sm:p-6 flex flex-col justify-between h-full relative">
      {/* Table Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Recent Transactions <span className="text-slate-400 font-normal text-xs sm:text-sm">(This Month)</span>
        </h2>
        <button
          onClick={() => setActiveTab('transactions')}
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          View All History
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto scroller-style">
        <table className="w-full text-left border-collapse min-w-[500px]" aria-label="Recent financial transactions">
          <thead>
            <tr className="border-b border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-4 font-semibold">Date</th>
              <th className="pb-3 px-4 font-semibold">Description</th>
              <th className="pb-3 px-4 font-semibold">Category</th>
              <th className="pb-3 px-4 font-semibold">Type</th>
              <th className="pb-3 px-4 font-semibold text-right">Amount</th>
              <th className="pb-3 pl-4 text-center font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {displayTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  No transactions recorded for the current month. Click "+ Add Transaction" to record one.
                </td>
              </tr>
            ) : (
              displayTransactions.map((tx) => {
                const IconComponent = ICON_MAP[tx.category] || MoreHorizontal;
                const isExpense = tx.type === 'expense';
                const badgeStyle = CATEGORY_BADGES[tx.category] || {
                  label: tx.category || 'Deleted Category',
                  className: 'bg-slate-600/15 text-slate-400 border border-slate-500/20'
                };

                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Date Column */}
                    <td className="py-3.5 pr-4 text-slate-300 whitespace-nowrap font-medium">
                      {tx.date}
                    </td>

                    {/* Description Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
                          !isExpense
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-[#171928] border-white/10 text-purple-400'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-white">{tx.title}</span>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[11px] font-medium ${badgeStyle.className}`}>
                        {badgeStyle.label}
                      </span>
                    </td>

                    {/* Type Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 font-medium">
                        {isExpense ? (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-rose-400">Expense</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-400">Income</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Amount Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                      <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
                        {isExpense ? `-${formatMoney(tx.amount)}` : `+${formatMoney(tx.amount)}`}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 pl-4 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === tx.id ? null : tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label={`Actions for ${tx.title}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Popover Menu */}
                      {activeMenuId === tx.id && (
                        <div className="absolute right-0 top-10 w-32 bg-[#171928] border border-white/10 rounded-xl shadow-xl z-40 py-1 text-left">
                          <button
                            onClick={() => {
                              if (onEditTransaction) onEditTransaction(tx);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteTransaction(tx.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
