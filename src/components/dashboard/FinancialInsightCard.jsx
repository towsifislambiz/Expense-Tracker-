import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Info, ShieldCheck } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { calculateMonthlyComparison } from '../../utils/calculations';

export const FinancialInsightCard = () => {
  const { transactions, stats } = useExpenses();

  const isNewUser = !transactions || transactions.length === 0;
  const comparison = calculateMonthlyComparison(transactions);

  let icon = Sparkles;
  let title = 'Financial Insight';
  let message = 'Start adding transactions to see insights.';
  let badgeColor = 'bg-[#6366f1]/20 text-indigo-400 border-[#6366f1]/30';

  if (!isNewUser) {
    if (stats.monthlyExpenses > stats.monthlyIncome && stats.monthlyIncome > 0) {
      icon = TrendingDown;
      title = 'High Expense Alert';
      message = 'Your expenses increased compared to your income this month. Consider reviewing your top spending categories.';
      badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    } else if (stats.netSavings > 0) {
      icon = TrendingUp;
      title = 'Positive Savings Trend';
      message = 'Great job! You are saving money this month. Keep building your financial reserve.';
      badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    } else if (comparison.expenseChange < 0) {
      icon = ShieldCheck;
      title = 'Improved Habits';
      message = 'Your spending habits improved this month with reduced overall expenses.';
      badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    } else {
      icon = Info;
      title = 'Balanced Ledger';
      message = 'Your ledger is stable. Track your regular expenses to uncover savings opportunities.';
      badgeColor = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
  }

  const IconComponent = icon;

  return (
    <div className="card-locked p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Ambient Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 z-10">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl border ${badgeColor}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full tracking-wider">
          AI Smart
        </span>
      </div>

      {/* Body Message */}
      <p className="text-xs text-slate-300 leading-relaxed z-10 mt-1">
        {message}
      </p>

      {/* Footer Comparison Badge */}
      {!isNewUser && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium z-10">
          <span>Income: <strong className="text-emerald-400">{comparison.incomeChange >= 0 ? '+' : ''}{comparison.incomeChange.toFixed(1)}%</strong></span>
          <span>Expense: <strong className="text-rose-400">{comparison.expenseChange >= 0 ? '+' : ''}{comparison.expenseChange.toFixed(1)}%</strong></span>
        </div>
      )}
    </div>
  );
};
