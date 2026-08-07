import React from 'react';
import { Flame, PieChart, ShieldCheck, Hash } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';

export const BottomMetrics = () => {
  const { stats, transactions } = useExpenses();
  const { formatMoney } = useCurrency();

  const metrics = [
    {
      title: 'Average Daily Spending',
      value: formatMoney(stats.avgDailySpend),
      subtitle: 'Target: < $250.00 / day',
      icon: Flame,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Budget Remaining',
      value: formatMoney(stats.budgetRemaining),
      subtitle: `Out of ${formatMoney(stats.monthlyBudgetLimit)} limit`,
      icon: PieChart,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Savings Rate',
      value: `${stats.savingsRate.toFixed(1)}%`,
      subtitle: 'Financial Independence Goal: 50%',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Transactions',
      value: transactions.length,
      subtitle: '100% synchronized',
      icon: Hash,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div
            key={i}
            className="glass-panel-interactive rounded-2xl p-4 flex items-center space-x-3.5 border border-white/5"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${m.bgColor} flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {m.title}
              </span>
              <span className="text-lg font-extrabold text-white tracking-tight">
                {m.value}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {m.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
