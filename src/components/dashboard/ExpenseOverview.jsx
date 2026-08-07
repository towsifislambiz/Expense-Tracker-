import React, { useState, useMemo } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { filterTransactionsByDateRange, calculateCategoryExpense, calculateTotalExpense } from '../../utils/calculations';

const CustomPieTooltip = ({ active, payload, formatMoney }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const categoryName = data.name;
    const amountVal = data.value;
    const catColor = data.payload?.color || data.color || '#3b82f6';
    const percentage = data.payload?.percentage || '';

    return (
      <div className="bg-[#141724] border border-white/20 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-40 z-50 pointer-events-none">
        <div className="font-bold text-white flex items-center space-x-2 border-b border-white/10 pb-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
          <span className="truncate">{categoryName}</span>
        </div>
        <div className="flex items-center justify-between space-x-3 text-slate-200">
          <span className="text-slate-400">Amount:</span>
          <span className="font-extrabold text-emerald-400">{formatMoney(amountVal)}</span>
        </div>
        {percentage && (
          <div className="flex items-center justify-between space-x-3 text-[11px]">
            <span className="text-slate-400">Share:</span>
            <span className="font-bold text-purple-300">{percentage}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ExpenseOverview = () => {
  const { transactions, categories } = useExpenses();
  const { formatMoney } = useCurrency();
  const [filterPeriod, setFilterPeriod] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Period filtering
  const periodFilteredTransactions = useMemo(() => {
    if (filterPeriod === 'Last Month') {
      return filterTransactionsByDateRange(transactions, 'last-month');
    }
    if (filterPeriod === 'This Year') {
      return filterTransactionsByDateRange(transactions, 'this-year');
    }
    return filterTransactionsByDateRange(transactions, 'this-month');
  }, [transactions, filterPeriod]);

  // Compute breakdown for selected period
  const periodCategoryBreakdown = useMemo(() => {
    return calculateCategoryExpense(periodFilteredTransactions, categories);
  }, [periodFilteredTransactions, categories]);

  const periodTotalExpenses = useMemo(() => {
    return calculateTotalExpense(periodFilteredTransactions);
  }, [periodFilteredTransactions]);

  const activeData = periodCategoryBreakdown
    .filter((cat) => cat.spent > 0)
    .map((cat) => ({
      name: cat.name,
      value: cat.spent,
      percentage: `${cat.percentage.toFixed(1)}%`,
      color: cat.color || '#64748b',
    }));

  const fallbackData = [
    { name: 'No Expenses Recorded', value: 1, color: '#334155' }
  ];

  const pieData = activeData.length > 0 ? activeData : fallbackData;

  return (
    <div className="card-locked p-6 flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white tracking-tight">Expense Overview</h2>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-[#171928] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{filterPeriod}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-[#171928] border border-white/10 rounded-xl shadow-xl z-30 py-1">
              {['This Month', 'Last Month', 'This Year'].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setFilterPeriod(p);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout (Chart + Legend) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center flex-1">
        {/* Left Donut Chart Column */}
        <div className="sm:col-span-5 relative flex items-center justify-center h-52 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={activeData.length > 0 ? 4 : 0}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {activeData.length > 0 && (
                <Tooltip
                  wrapperStyle={{ zIndex: 100 }}
                  content={<CustomPieTooltip formatMoney={formatMoney} />}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>

          {/* Donut Center Label - set z-0 so Tooltip (zIndex: 100) floats cleanly above */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <span className="text-xl font-bold text-white tracking-tight">
              {formatMoney(periodTotalExpenses)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5">Total Expense</span>
          </div>
        </div>

        {/* Right Category Breakdown Legend Table */}
        <div className="sm:col-span-7 space-y-2.5">
          {periodCategoryBreakdown.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs py-0.5 hover:bg-white/5 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 truncate font-medium">{item.name}</span>
              </div>
              <div className="flex items-center space-x-3 text-right">
                <span className="font-semibold text-white">{formatMoney(item.spent)}</span>
                <span className="text-slate-400 w-11 text-right font-normal">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
