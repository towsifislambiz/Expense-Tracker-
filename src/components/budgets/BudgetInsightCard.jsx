import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

export const BudgetInsightCard = ({ budgets = [] }) => {
  const { categoryBreakdown, stats } = useExpenses();

  if (!budgets || budgets.length === 0) {
    return (
      <div className="card-locked p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">Smart Budget Assistant</h4>
        </div>
        <p className="text-xs text-slate-300 mt-2">
          Create a budget to manage your money and receive automated spending alerts.
        </p>
      </div>
    );
  }

  // Evaluate warnings & exceeded category budgets
  let exceededBudget = null;
  let warningBudget = null;

  budgets.forEach((b) => {
    if (b.type === 'category') {
      const matchedCat = categoryBreakdown.find(
        (c) => String(c.id).toLowerCase().trim() === String(b.category).toLowerCase().trim()
      );
      const spent = matchedCat ? matchedCat.spent : 0;
      const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      if (pct >= 100 && !exceededBudget) {
        exceededBudget = { name: b.name, catName: matchedCat?.name || b.category, pct };
      } else if (pct >= 80 && pct < 100 && !warningBudget) {
        warningBudget = { name: b.name, catName: matchedCat?.name || b.category, pct };
      }
    } else if (b.type === 'overall') {
      const spent = stats.monthlyExpenses;
      const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      if (pct >= 100 && !exceededBudget) {
        exceededBudget = { name: b.name, catName: 'Overall', pct };
      } else if (pct >= 80 && pct < 100 && !warningBudget) {
        warningBudget = { name: b.name, catName: 'Overall', pct };
      }
    }
  });

  let icon = ShieldCheck;
  let title = 'Budget Control';
  let message = 'Great control over your budget this month!';
  let badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

  if (exceededBudget) {
    icon = AlertCircle;
    title = 'Budget Exceeded Alert';
    message = `You exceeded your ${exceededBudget.catName} budget (${exceededBudget.pct.toFixed(0)}% used).`;
    badgeStyle = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  } else if (warningBudget) {
    icon = AlertTriangle;
    title = 'Budget Warning Alert';
    message = `Warning: ${warningBudget.pct.toFixed(0)}% of ${warningBudget.catName} budget used.`;
    badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }

  const IconComponent = icon;

  return (
    <div className="card-locked p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl border ${badgeStyle}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
          Live Alert
        </span>
      </div>

      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{message}</p>
    </div>
  );
};
