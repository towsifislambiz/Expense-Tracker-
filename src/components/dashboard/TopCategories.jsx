import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';

export const TopCategories = () => {
  const { categoryBreakdown } = useExpenses();
  const { formatMoney } = useCurrency();

  const sortedCategories = [...categoryBreakdown]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Top Spending Categories</h3>
          <p className="text-xs text-slate-400">Monthly budget utilization progress</p>
        </div>
        <Badge variant="purple">5 Active</Badge>
      </div>

      <div className="space-y-4">
        {sortedCategories.map((cat) => {
          const isOverbudget = cat.budgetUtilized > 100;
          return (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-md" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-slate-200">{cat.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">{formatMoney(cat.spent)}</span>
                  <span className="text-[11px] text-slate-400">
                    / {formatMoney(cat.monthlyBudget)}
                  </span>
                </div>
              </div>

              {/* Dynamic Gradient Progress Bar */}
              <ProgressBar
                progress={cat.budgetUtilized}
                color={isOverbudget ? '#F43F5E' : cat.color}
                height="h-2"
              />

              <div className="flex justify-end text-[10px] text-slate-400">
                <span className={isOverbudget ? 'text-rose-400 font-bold' : ''}>
                  {cat.budgetUtilized.toFixed(0)}% Utilized {isOverbudget && '(Over Budget)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
