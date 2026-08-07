import React, { useMemo } from 'react';
import { Sparkles, AlertTriangle, AlertCircle, TrendingUp, Calendar, ShieldCheck, DollarSign } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useBudgets } from '../../context/BudgetContext';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateCategoryForecast } from '../../utils/forecastHelpers';

export const SmartInsightsWidget = () => {
  const { currentMonthTransactions, categoryBreakdown, stats } = useExpenses();
  const { budgets } = useBudgets();
  const { formatMoney } = useCurrency();

  const insights = useMemo(() => {
    const list = [];
    const safeTxs = Array.isArray(currentMonthTransactions) ? currentMonthTransactions : [];
    const safeBudgets = Array.isArray(budgets) ? budgets : [];
    const safeCategories = Array.isArray(categoryBreakdown) ? categoryBreakdown : [];

    const now = new Date();
    const daysPassed = Math.max(1, now.getDate());
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // 1. Evaluate Budget Warnings & Over Budget Categories
    safeBudgets.forEach((b) => {
      let spent = 0;
      let catName = b.name;
      let catTxs = [];

      if (b.type === 'category') {
        const catKey = String(b.category || '').toLowerCase().trim();
        catTxs = safeTxs.filter(
          (t) => String(t.type || '').toLowerCase().trim() === 'expense' && String(t.category || '').toLowerCase().trim() === catKey
        );
        spent = catTxs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const matched = safeCategories.find((c) => String(c.id || '').toLowerCase().trim() === catKey);
        catName = matched ? matched.name : b.name;
      } else {
        catTxs = safeTxs.filter((t) => String(t.type || '').toLowerCase().trim() === 'expense');
        spent = Number(stats?.monthlyExpenses) || 0;
        catName = 'Overall';
      }

      const target = Number(b.amount) || 0;
      if (target > 0) {
        const pct = (spent / target) * 100;
        const remaining = target - spent;

        // Realistic Weighted Forecast
        const forecast = calculateCategoryForecast(catTxs, target, daysPassed, totalDaysInMonth);
        const projectedOverspend = forecast.projectedMonthEnd - target;

        if (pct >= 100) {
          list.push({
            id: `overbudget-${b.id}`,
            type: 'danger',
            title: `Critical Alert: ${catName} Budget Exceeded!`,
            message: `You have spent ${pct.toFixed(0)}% of your ${catName} budget (${formatMoney(spent)} spent vs ${formatMoney(target)} limit). Over budget by ${formatMoney(Math.abs(remaining))}.`,
            icon: AlertCircle,
          });
        } else if (forecast.statusType === 'overspend' && projectedOverspend > 0) {
          list.push({
            id: `projected-${b.id}`,
            type: 'warning',
            title: `Trend Warning: ${catName} Projected Overspend`,
            message: `Weighted daily burn projects a month-end total of ${formatMoney(forecast.projectedMonthEnd)}. Estimated over budget by ${formatMoney(projectedOverspend)}.`,
            icon: AlertTriangle,
          });
        } else if (pct >= 80) {
          list.push({
            id: `warning-${b.id}`,
            type: 'warning',
            title: `Warning: ${catName} Budget Near Ceiling`,
            message: `You have spent ${pct.toFixed(0)}% of your ${catName} budget. You only have ${formatMoney(remaining)} remaining.`,
            icon: AlertTriangle,
          });
        }
      }
    });

    // 2. Daily Spending Analytics (Highest & Lowest Spending Days)
    const dailySpendMap = {};
    safeTxs.forEach((t) => {
      if (String(t.type || '').toLowerCase().trim() === 'expense' && t.date) {
        const dStr = String(t.date).split('T')[0];
        dailySpendMap[dStr] = (dailySpendMap[dStr] || 0) + (Number(t.amount) || 0);
      }
    });

    const dailySpendEntries = Object.entries(dailySpendMap);
    if (dailySpendEntries.length > 0) {
      dailySpendEntries.sort((a, b) => b[1] - a[1]);
      const highest = dailySpendEntries[0];
      const lowest = dailySpendEntries[dailySpendEntries.length - 1];

      const formatDate = (isoStr) => {
        if (!isoStr) return 'None';
        try {
          const cleanStr = String(isoStr).split('T')[0];
          const parts = cleanStr.split('-').map(Number);
          if (parts.length === 3 && !parts.some(isNaN)) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = months[parts[1] - 1] || '';
            return `${monthName} ${parts[2]}`;
          }
          return cleanStr;
        } catch (e) {
          return String(isoStr);
        }
      };

      list.push({
        id: 'highest-day',
        type: 'info',
        title: 'Highest Spending Day',
        message: `Your peak spending occurred on ${formatDate(highest[0])} (${formatMoney(highest[1])}).`,
        icon: TrendingUp,
      });

      if (dailySpendEntries.length > 1) {
        list.push({
          id: 'lowest-day',
          type: 'success',
          title: 'Lowest Spending Day',
          message: `Your lowest spending occurred on ${formatDate(lowest[0])} (${formatMoney(lowest[1])}).`,
          icon: Calendar,
        });
      }
    }

    // 3. Daily Burn Rate (Strictly Actual Expenses / Days Passed)
    const totalExpenses = Number(stats?.monthlyExpenses) || 0;
    const avgDaily = totalExpenses / daysPassed;
    list.push({
      id: 'avg-daily',
      type: 'info',
      title: 'Daily Burn Rate',
      message: `Average daily spending this month is ${formatMoney(avgDaily)} per day (${daysPassed} days elapsed).`,
      icon: DollarSign,
    });

    if (list.length === 0) {
      list.push({
        id: 'healthy',
        type: 'success',
        title: 'Optimal Solvency Status',
        message: 'Your spending is well within budget targets. Great job maintaining financial health!',
        icon: ShieldCheck,
      });
    }

    return list;
  }, [currentMonthTransactions, categoryBreakdown, budgets, stats, formatMoney]);

  return (
    <div className="card-locked p-6 space-y-4">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white tracking-tight truncate">Smart Solvency & Forecast Insights</h3>
          <p className="text-xs text-slate-400 truncate">Automated budget warnings & month-end spending velocity projections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((item) => {
          const IconComp = item.icon;
          let styleClass = 'bg-slate-900/50 border-white/10 text-slate-300';
          let iconColor = 'text-indigo-400';

          if (item.type === 'danger') {
            styleClass = 'bg-rose-500/10 border-rose-500/30 text-rose-300';
            iconColor = 'text-rose-400';
          } else if (item.type === 'warning') {
            styleClass = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
            iconColor = 'text-amber-400';
          } else if (item.type === 'success') {
            styleClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
            iconColor = 'text-emerald-400';
          }

          return (
            <div key={item.id} className={`p-4 rounded-xl border flex items-start space-x-3 min-w-0 ${styleClass}`}>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                <IconComp className={`w-4 h-4 ${iconColor}`} />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                <p className="text-[11px] leading-relaxed opacity-90">{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
