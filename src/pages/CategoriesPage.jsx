import React from 'react';
import { Grid, Heart } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useBudgets } from '../context/BudgetContext';
import { useCurrency } from '../context/CurrencyContext';
import { ProgressBar } from '../components/common/ProgressBar';

export const CategoriesPage = () => {
  const { categoryBreakdown } = useExpenses();
  const { budgets } = useBudgets();
  const { formatMoney } = useCurrency();

  const safeCategoryList = (categoryBreakdown || []).map((cat) => {
    const matchedBudget = (budgets || []).find(
      (b) => b.type === 'category' && String(b.category || '').toLowerCase().trim() === String(cat.id || '').toLowerCase().trim()
    );
    const monthlyBudget = matchedBudget ? Number(matchedBudget.amount) || 10000 : 10000;
    const spent = Number(cat.spent) || 0;
    const remaining = monthlyBudget - spent;
    const budgetUtilized = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;

    return {
      ...cat,
      spent,
      remaining,
      monthlyBudget,
      budgetUtilized,
    };
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="card-locked p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Grid className="w-5 h-5 text-indigo-400" />
          <span>Category Directory & Budget Limits</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage monthly budget ceilings and monitor real-time category expenditure.
        </p>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeCategoryList.map((cat) => (
          <div
            key={cat.id || cat.name}
            className="card-locked p-5 space-y-3 relative overflow-hidden border border-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                <h3 className="text-sm font-bold text-white capitalize">{cat.name}</h3>
              </div>
              {cat.isFavorite && <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />}
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400">Total Spent:</span>
              <span className="text-sm font-extrabold text-white">{formatMoney(cat.spent)}</span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400">Monthly Budget:</span>
              <span className="text-slate-300 font-semibold">{formatMoney(cat.monthlyBudget)}</span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400">Remaining Budget:</span>
              <span className={`font-bold ${cat.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatMoney(cat.remaining)}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <ProgressBar progress={Math.min(100, cat.budgetUtilized)} color={cat.color || '#3b82f6'} height="h-2" />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Utilization</span>
                <span className={cat.budgetUtilized >= 100 ? 'text-rose-400 font-bold' : 'text-indigo-300 font-bold'}>
                  {(cat.budgetUtilized || 0).toFixed(0)}% Used
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
