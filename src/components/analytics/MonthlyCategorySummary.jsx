import React, { useMemo } from 'react';
import { Grid, Clock, CheckCircle2, ShieldAlert, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useBudgets } from '../../context/BudgetContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ProgressBar } from '../common/ProgressBar';
import {
  calculateCategoryForecast,
  calculateCategoryDayPeaks,
  getOverspendSeverity,
} from '../../utils/forecastHelpers';

export const MonthlyCategorySummary = () => {
  const { currentMonthDailyExpenses, categoryBreakdown } = useExpenses();
  const { budgets } = useBudgets();
  const { formatMoney } = useCurrency();

  const now = new Date();
  const daysPassed = Math.max(1, now.getDate());
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const categoryMetrics = useMemo(() => {
    const safeTxs = Array.isArray(currentMonthDailyExpenses) ? currentMonthDailyExpenses : [];
    const safeCategories = Array.isArray(categoryBreakdown) ? categoryBreakdown : [];
    const safeBudgets = Array.isArray(budgets) ? budgets : [];

    return safeCategories.map((cat) => {
      const catKey = String(cat.id || '').toLowerCase().trim();

      // Find matching category budget limit
      const matchedBudget = safeBudgets.find(
        (b) => b.type === 'category' && String(b.category || '').toLowerCase().trim() === catKey
      );

      const budgetLimit = matchedBudget ? Number(matchedBudget.amount) || 0 : 10000;

      // Filter ONLY actual expense transactions for this specific category
      const catTxs = safeTxs.filter(
        (t) => String(t.type || '').toLowerCase().trim() === 'expense' && String(t.category || '').toLowerCase().trim() === catKey
      );

      // Total spent derived strictly from actual daily transactions
      const spent = catTxs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const remaining = budgetLimit - spent;

      // Utilization Formula: (Spent / Budget) * 100
      const pctUsed = budgetLimit > 0 ? (spent / budgetLimit) * 100 : 0;
      const itemCount = catTxs.length;

      // Average Daily Burn: Spent / Actual Elapsed Days
      const avgDaily = spent / daysPassed;

      // Realistic Weighted Month-End Forecast
      const forecast = calculateCategoryForecast(catTxs, budgetLimit, daysPassed, totalDaysInMonth);

      // Per-Category Highest & Lowest Spending Day
      const peaks = calculateCategoryDayPeaks(catTxs);

      // 5-Tier Overspend Severity Status
      const severity = getOverspendSeverity(pctUsed);

      const formattedLastExpense = peaks.lastExpenseItem
        ? `${peaks.lastExpenseItem.title} (${formatMoney(peaks.lastExpenseItem.amount)})`
        : 'No expense recorded';

      return {
        ...cat,
        budgetLimit,
        spent,
        remaining,
        pctUsed,
        itemCount,
        avgDaily,
        forecast,
        highestDay: peaks.highestDay,
        lowestDay: peaks.lowestDay,
        formattedLastExpense,
        severity,
      };
    });
  }, [currentMonthDailyExpenses, categoryBreakdown, budgets, daysPassed, totalDaysInMonth, formatMoney]);

  return (
    <div className="card-locked p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white tracking-tight truncate">Monthly Category Summary & Forecast</h3>
            <p className="text-xs text-slate-400 truncate">Category spending limits, burn rates, and weighted month-end projections</p>
          </div>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryMetrics.map((cat) => (
          <div key={cat.id} className="card-locked p-5 space-y-3 relative overflow-hidden border border-white/5 flex flex-col justify-between">
            {/* Header: Category Name, Badge & Item Count */}
            <div className="flex items-center justify-between space-x-2 min-w-0">
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#6366f1' }} />
                <h4 className="text-sm font-bold text-white capitalize truncate" title={cat.name}>
                  {cat.name}
                </h4>
              </div>

              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.severity.badgeStyle}`}>
                  {cat.severity.label}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 whitespace-nowrap">
                  {cat.itemCount} {cat.itemCount === 1 ? 'Entry' : 'Entries'}
                </span>
              </div>
            </div>

            {/* Spent / Budget Limit */}
            <div className="flex items-baseline justify-between text-xs min-w-0">
              <span className="text-slate-400 flex-shrink-0">Spent / Budget Limit:</span>
              <span className="font-extrabold text-white truncate text-right ml-2">
                {formatMoney(cat.spent)} / <span className="text-slate-400">{formatMoney(cat.budgetLimit)}</span>
              </span>
            </div>

            {/* Remaining Budget */}
            <div className="flex items-baseline justify-between text-xs min-w-0">
              <span className="text-slate-400 flex-shrink-0">Remaining Budget:</span>
              <span className={`font-extrabold truncate text-right ml-2 ${cat.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatMoney(cat.remaining)}
              </span>
            </div>

            {/* Progress Bar & Utilized Percentage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-400 font-medium">Budget Utilized</span>
                <span className={cat.pctUsed >= 100 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {cat.pctUsed.toFixed(0)}%
                </span>
              </div>
              <ProgressBar progress={Math.min(100, cat.pctUsed)} color={cat.color || '#6366f1'} height="h-2" />
            </div>

            {/* Smart Weighted Spend Forecast Banner */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-[11px] min-w-0">
              <span className="text-slate-400 font-medium flex-shrink-0">Forecast:</span>
              <div className="min-w-0 text-right">
                {cat.forecast.statusType === 'empty' ? (
                  <span className="text-slate-500 font-semibold flex items-center justify-end gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-500" /> No Spending History
                  </span>
                ) : cat.forecast.statusType === 'gathering' ? (
                  <span className="text-amber-300 font-semibold flex items-center justify-end gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" /> Gathering Data (≈{formatMoney(cat.forecast.projectedMonthEnd)})
                  </span>
                ) : cat.forecast.isProjectedOver ? (
                  <span className="text-rose-400 font-bold flex items-center justify-end gap-1 truncate" title={`Projected Overspend ≈ ${formatMoney(cat.forecast.projectedMonthEnd)}`}>
                    <ShieldAlert className="w-3 h-3 text-rose-400 flex-shrink-0" />
                    <span className="truncate">Overspend ≈ {formatMoney(cat.forecast.projectedMonthEnd)}</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center justify-end gap-1 truncate" title={`On Track ≈ ${formatMoney(cat.forecast.projectedMonthEnd)}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">On Track ≈ {formatMoney(cat.forecast.projectedMonthEnd)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Category Peak Metrics: Avg Daily Burn, Highest & Lowest Spending Day */}
            <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] min-w-0">
              <div className="min-w-0">
                <span className="text-slate-500 block truncate">Avg Daily Burn</span>
                <span className="font-bold text-indigo-300 truncate block">
                  {cat.itemCount > 0 ? `${formatMoney(cat.avgDaily)}/day` : '৳0/day'}
                </span>
              </div>

              <div className="min-w-0">
                <span className="text-slate-500 block truncate">Highest Day</span>
                <span className="font-bold text-amber-300 truncate block" title={cat.highestDay.date !== 'None' ? `${cat.highestDay.date} (${formatMoney(cat.highestDay.amount)})` : 'None'}>
                  {cat.highestDay.date !== 'None' ? `${cat.highestDay.date} (${formatMoney(cat.highestDay.amount)})` : 'None'}
                </span>
              </div>
            </div>

            {/* Meaningful Last Expense Banner with Overflow Tooltip */}
            <div className="pt-2 flex items-center justify-between text-[10px] border-t border-white/5 min-w-0">
              <span className="flex items-center gap-1 text-slate-400 font-semibold flex-shrink-0">
                <Clock className="w-3 h-3 text-indigo-400" /> Last Expense:
              </span>
              <span className="font-bold text-white truncate ml-2 min-w-0 flex-1 text-right" title={cat.formattedLastExpense}>
                {cat.formattedLastExpense}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
