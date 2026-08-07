import React from 'react';
import { ShoppingBag, Utensils, Car, Zap, Film, HeartPulse, Tv, MoreHorizontal, Award } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getTopSpendingCategory } from '../../utils/calculations';

const ICON_MAP = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  bills: Zap,
  entertainment: Film,
  healthcare: HeartPulse,
  subscriptions: Tv,
  others: MoreHorizontal,
};

export const TopSpendingCategory = () => {
  const { currentMonthTransactions, categories } = useExpenses();
  const { formatMoney } = useCurrency();

  const topCategory = getTopSpendingCategory(currentMonthTransactions, categories);
  const IconComponent = topCategory ? (ICON_MAP[topCategory.id] || ShoppingBag) : Award;

  return (
    <div className="card-locked p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2 z-10">
        <span className="text-xs font-semibold text-slate-400">Top Spending Category (This Month)</span>
        <div className="p-1.5 rounded-lg bg-pink-500/15 text-pink-400 border border-pink-500/30">
          <Award className="w-3.5 h-3.5" />
        </div>
      </div>

      {topCategory ? (
        <div className="space-y-2 z-10 my-1">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border text-white shadow-md"
              style={{ backgroundColor: `${topCategory.color}25`, borderColor: `${topCategory.color}50` }}
            >
              <IconComponent className="w-5 h-5" style={{ color: topCategory.color }} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-tight">{topCategory.name}</h4>
              <p className="text-xs font-extrabold text-white mt-0.5">
                {formatMoney(topCategory.amount)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2 text-slate-400 z-10">
          <p className="text-xs font-semibold text-slate-300">No spending recorded this month</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Add expense transactions to view current month insights.</p>
        </div>
      )}

      <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-slate-400 font-medium z-10 flex justify-between">
        <span>Category Analysis</span>
        <span className="text-slate-300 font-bold">{topCategory ? 'Highest Spend' : 'Inactive'}</span>
      </div>
    </div>
  );
};
