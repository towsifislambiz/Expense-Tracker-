import React from 'react';
import { Utensils, ShoppingBag, Car, Zap, Film, HeartPulse, Tv, MoreHorizontal, Plus } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useBudgets } from '../../context/BudgetContext';
import { useCurrency } from '../../context/CurrencyContext';

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

export const BudgetOverview = ({ onOpenAddBudgetModal }) => {
  const { categoryBreakdown, stats, setActiveTab } = useExpenses();
  const { budgets } = useBudgets();
  const { formatMoney } = useCurrency();

  const activeBudgets = budgets.slice(0, 4);

  return (
    <div className="card-locked p-6 flex flex-col justify-between h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Budget Overview</h2>
        <button
          onClick={() => setActiveTab('budgets')}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
        >
          View All ({budgets.length})
        </button>
      </div>

      {/* Progress Bars List */}
      <div className="space-y-4 flex-1 justify-center flex flex-col">
        {activeBudgets.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-xs font-semibold text-slate-300">No budgets created yet</p>
            <p className="text-[11px] text-slate-500 mt-1">Add a budget target to monitor your spending limits.</p>
          </div>
        ) : (
          activeBudgets.map((b) => {
            let spent = 0;
            let catName = b.name;
            let IconComponent = MoreHorizontal;

            if (b.type === 'category') {
              const matchedCat = categoryBreakdown.find(
                (c) => String(c.id).toLowerCase().trim() === String(b.category).toLowerCase().trim()
              );
              spent = matchedCat ? matchedCat.spent : 0;
              catName = matchedCat ? matchedCat.name : b.name;
              IconComponent = ICON_MAP[b.category] || MoreHorizontal;
            } else {
              spent = stats.monthlyExpenses;
            }

            const target = Number(b.amount) || 0;
            const pct = target > 0 ? Math.min(100, (spent / target) * 100) : 0;
            const actualPct = target > 0 ? (spent / target) * 100 : 0;

            let barGrad = 'from-emerald-500 to-teal-500';
            let iconStyle = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

            if (actualPct >= 100) {
              barGrad = 'from-rose-500 to-pink-500';
              iconStyle = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            } else if (actualPct >= 85) {
              barGrad = 'from-orange-500 to-amber-500';
              iconStyle = 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
            } else if (actualPct >= 60) {
              barGrad = 'from-amber-500 to-yellow-500';
              iconStyle = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            }

            return (
              <div key={b.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconStyle}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-white truncate max-w-32">{b.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-medium text-[11px]">
                      {formatMoney(spent)} / <span className="text-slate-400">{formatMoney(target)}</span>
                    </span>
                    <span className={`font-bold w-9 text-right text-[11px] ${actualPct >= 100 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {actualPct.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full bg-[#171928] rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className={`bg-gradient-to-r ${barGrad} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom CTA Button */}
      <div className="pt-4 mt-2">
        <button
          onClick={onOpenAddBudgetModal}
          className="w-full py-2.5 rounded-xl bg-[#232740] hover:bg-[#2d3254] text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-2 border border-indigo-500/20 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Budget</span>
        </button>
      </div>
    </div>
  );
};
