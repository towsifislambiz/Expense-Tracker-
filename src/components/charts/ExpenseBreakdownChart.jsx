import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';

export const ExpenseBreakdownChart = () => {
  const { categoryBreakdown, stats } = useExpenses();
  const { formatMoney } = useCurrency();

  const chartData = categoryBreakdown
    .filter((c) => c.spent > 0)
    .map((c) => ({
      name: c.name,
      value: c.spent,
      color: c.color,
      percentage: c.percentage,
    }));

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#141724] border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50 pointer-events-none">
          <div className="font-bold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-slate-300 font-semibold">{formatMoney(data.value)}</div>
          <div className="text-[10px] text-purple-300 font-bold">{data.percentage.toFixed(1)}% of total</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Expense Breakdown</h3>
          <p className="text-xs text-slate-400">Distribution across active categories</p>
        </div>
      </div>

      {/* Doughnut Container */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip wrapperStyle={{ zIndex: 100 }} content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Display - set z-0 so Tooltip (zIndex: 100) floats cleanly above */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center z-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Spent
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-white">
            {formatMoney(stats.monthlyExpenses)}
          </span>
        </div>
      </div>

      {/* Categories Legend List */}
      <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-800/80">
        {categoryBreakdown.slice(0, 6).map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs font-medium text-slate-300 truncate">{cat.name}</span>
            </div>
            <span className="text-xs font-bold text-white pl-2">
              {formatMoney(cat.spent)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
