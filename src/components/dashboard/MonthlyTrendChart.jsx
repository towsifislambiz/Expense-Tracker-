import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, BarChart2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateMonthlyData } from '../../utils/calculations';

const CustomTooltip = ({ active, payload, label, formatMoney }) => {
  if (active && payload && payload.length) {
    const incomeVal = payload.find((p) => p.dataKey === 'income')?.value || 0;
    const expenseVal = payload.find((p) => p.dataKey === 'expense')?.value || 0;

    return (
      <div className="bg-[#1a1d2e] border border-white/15 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-36">
        <div className="font-bold text-slate-200 border-b border-white/10 pb-1">{label}</div>
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Income</span>
          </div>
          <span className="font-semibold text-white">{formatMoney(incomeVal)}</span>
        </div>
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-400">Expense</span>
          </div>
          <span className="font-semibold text-white">{formatMoney(expenseVal)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyTrendChart = () => {
  const { transactions } = useExpenses();
  const { formatMoney } = useCurrency();
  const [filterYear, setFilterYear] = useState('This Year');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const monthlyData = useMemo(() => {
    return calculateMonthlyData(transactions);
  }, [transactions]);

  const isEmpty = monthlyData.every((m) => m.income === 0 && m.expense === 0);

  return (
    <div className="card-locked p-6 flex flex-col justify-between h-full relative">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Monthly Trend</h2>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Income</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Expense</span>
            </div>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-[#171928] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{filterYear}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-[#171928] border border-white/10 rounded-xl shadow-xl z-30 py-1">
              {['This Year', 'Last Year', '2-Year Trend'].map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setFilterYear(y);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      <div className="w-full h-64 sm:h-72 relative">
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-2 text-slate-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No monthly data available yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Start adding transactions to see your monthly income vs expense trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val === 0 ? '0' : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip content={<CustomTooltip formatMoney={formatMoney} />} />

              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#incomeGrad)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
