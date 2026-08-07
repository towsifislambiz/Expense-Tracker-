import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';

const CustomTooltip = ({ active, payload, label, formatMoney }) => {
  if (active && payload && payload.length) {
    const budgetVal = payload.find((p) => p.dataKey === 'budget')?.value || 0;
    const actualVal = payload.find((p) => p.dataKey === 'actual')?.value || 0;

    return (
      <div className="bg-[#1a1d2e] border border-white/15 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-36 z-50">
        <div className="font-bold text-slate-200 border-b border-white/10 pb-1">{label}</div>
        <div className="flex items-center justify-between space-x-3">
          <span className="text-indigo-400 font-medium">Budget Limit</span>
          <span className="font-bold text-white">{formatMoney(budgetVal)}</span>
        </div>
        <div className="flex items-center justify-between space-x-3">
          <span className="text-rose-400 font-medium">Actual Spent</span>
          <span className="font-bold text-white">{formatMoney(actualVal)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const BudgetComparisonChart = ({ budgets = [] }) => {
  const { categoryBreakdown = [] } = useExpenses();
  const { formatMoney } = useCurrency();

  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const safeCategories = Array.isArray(categoryBreakdown) ? categoryBreakdown : [];

  const comparisonData = safeCategories.map((cat) => {
    const matchedBudget = safeBudgets.find(
      (b) => b.type === 'category' && String(b.category || '').toLowerCase().trim() === String(cat.id || '').toLowerCase().trim()
    );
    const budgetLimit = matchedBudget ? Number(matchedBudget.amount) || 0 : 0;

    return {
      category: cat.name || cat.id,
      budget: budgetLimit,
      actual: Number(cat.spent) || 0,
    };
  });

  const hasBudgets = comparisonData.some((d) => d.budget > 0 || d.actual > 0);

  return (
    <div className="card-locked p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Budget vs Actual Spending</h3>
          <p className="text-xs text-slate-400">Category spending limits vs live transactions</p>
        </div>
      </div>

      <div className="w-full h-64 relative">
        {!hasBudgets ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <p className="text-xs font-semibold text-slate-300">No category comparison data</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Create category budgets to visualize your limits against actual expenses.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
              <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val === 0 ? '0' : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip wrapperStyle={{ zIndex: 100 }} content={<CustomTooltip formatMoney={formatMoney} />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="budget" name="Budget Limit" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="actual" name="Actual Spent" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
