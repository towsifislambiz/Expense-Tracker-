import React from 'react';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useBudgets } from '../../context/BudgetContext';
import { calculateFinancialHealthScore } from '../../utils/reportCalculations';
import { Badge } from '../common/Badge';

export const FinancialHealthCard = () => {
  const { transactions } = useExpenses();
  const { budgets } = useBudgets();

  const health = calculateFinancialHealthScore(transactions, budgets);
  const { score, rating, breakdown } = health;

  let badgeVariant = 'success';
  let gaugeColor = '#10b981';

  if (score < 60) {
    badgeVariant = 'danger';
    gaugeColor = '#f43f5e';
  } else if (score < 80) {
    badgeVariant = 'warning';
    gaugeColor = '#f59e0b';
  }

  return (
    <div className="card-locked p-6 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Financial Health Score</h3>
            <span className="text-[11px] text-slate-400">Algorithmic solvency index</span>
          </div>
        </div>
        <Badge variant={badgeVariant}>{rating}</Badge>
      </div>

      {/* Main Score Display */}
      <div className="flex items-center justify-between my-2 p-4 rounded-xl bg-slate-900/60 border border-white/5 z-10">
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {score}<span className="text-base font-medium text-slate-400">/100</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Based on real ledger performance</p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="w-16 h-16 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              strokeWidth="3.5"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
              stroke={gaugeColor}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-bold text-white">{score}%</span>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-2 z-10 text-xs mt-1">
        <div className="flex items-center justify-between text-slate-300">
          <span>Savings Rate Margin (40 pts)</span>
          <span className="font-bold text-emerald-400">{breakdown.savingsScore}/40</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Budget Threshold Adherence (30 pts)</span>
          <span className="font-bold text-indigo-400">{breakdown.budgetScore}/30</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Expense-to-Income Ratio (20 pts)</span>
          <span className="font-bold text-sky-400">{breakdown.expenseScore}/20</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Ledger Active Consistency (10 pts)</span>
          <span className="font-bold text-amber-400">{breakdown.consistencyScore}/10</span>
        </div>
      </div>
    </div>
  );
};
