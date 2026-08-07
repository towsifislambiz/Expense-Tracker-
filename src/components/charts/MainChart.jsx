import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const WEEKLY_DATA = [
  { label: 'Mon', income: 1200, expense: 450 },
  { label: 'Tue', income: 1800, expense: 620 },
  { label: 'Wed', income: 1500, expense: 380 },
  { label: 'Thu', income: 2400, expense: 890 },
  { label: 'Fri', income: 3100, expense: 1200 },
  { label: 'Sat', income: 2100, expense: 1450 },
  { label: 'Sun', income: 2400, expense: 1250 },
];

const MONTHLY_DATA = [
  { label: 'Jan', income: 12400, expense: 5800 },
  { label: 'Feb', income: 11800, expense: 6100 },
  { label: 'Mar', income: 13500, expense: 5400 },
  { label: 'Apr', income: 14200, expense: 6900 },
  { label: 'May', income: 12900, expense: 5900 },
  { label: 'Jun', income: 15800, expense: 7100 },
  { label: 'Jul', income: 14500, expense: 6240 },
  { label: 'Aug', income: 16200, expense: 6800 },
];

const YEARLY_DATA = [
  { label: '2023', income: 145000, expense: 72000 },
  { label: '2024', income: 168000, expense: 78000 },
  { label: '2025', income: 182000, expense: 84000 },
  { label: '2026', income: 195000, expense: 89000 },
];

export const MainChart = () => {
  const { formatMoney } = useCurrency();
  const [period, setPeriod] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'

  const chartData = period === 'weekly' ? WEEKLY_DATA : period === 'yearly' ? YEARLY_DATA : MONTHLY_DATA;

  // Custom Glass Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-white/20 shadow-2xl space-y-1 text-xs">
          <div className="font-bold text-white pb-1 border-b border-slate-700">{label} Summary</div>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Income: {formatMoney(payload[0].value)}</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Expense: {formatMoney(payload[1].value)}</span>
          </div>
          <div className="pt-1 text-[11px] text-slate-400">
            Net: <span className="text-white font-bold">{formatMoney(payload[0].value - payload[1].value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Chart Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Income vs Expense Overview</span>
          </h3>
          <p className="text-xs text-slate-400">Real-time cash flow cash flow trajectory & comparison</p>
        </div>

        {/* Filter Period Tabs */}
        <div className="flex items-center bg-slate-900/90 border border-white/10 p-1 rounded-xl">
          {['weekly', 'monthly', 'yearly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setPeriod(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                period === tab
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Income Emerald Gradient */}
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              {/* Expense Purple Gradient */}
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#incomeGrad)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#8B5CF6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#expenseGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center space-x-6 pt-4 border-t border-slate-800/80 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-slate-300">Income</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          <span className="text-slate-300">Expense</span>
        </div>
      </div>
    </div>
  );
};
