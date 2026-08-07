import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateIncomeBreakdown } from '../../utils/reportCalculations';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'];

const CustomIncomeTooltip = ({ active, payload, formatMoney }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const categoryName = data.name || data.payload?.category || 'Income';
    const amountVal = data.value;
    const itemColor = data.payload?.color || data.color || '#10b981';

    return (
      <div className="bg-[#141724] border border-white/20 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-36 z-50">
        <div className="font-bold text-white flex items-center space-x-2 border-b border-white/10 pb-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: itemColor }} />
          <span className="capitalize truncate">{categoryName}</span>
        </div>
        <div className="flex items-center justify-between space-x-3 text-slate-200">
          <span className="text-slate-400">Income:</span>
          <span className="font-extrabold text-emerald-400">{formatMoney(amountVal)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const IncomeAnalysis = () => {
  const { transactions } = useExpenses();
  const { formatMoney } = useCurrency();

  const data = calculateIncomeBreakdown(transactions);
  const hasIncome = data.some((d) => d.amount > 0);

  return (
    <div className="card-locked p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Income Source Distribution</h3>
          <p className="text-xs text-slate-400">Breakdown of revenue origins</p>
        </div>
      </div>

      <div className="w-full h-60 relative flex items-center justify-center">
        {!hasIncome ? (
          <div className="text-center p-4 text-slate-400">
            <p className="text-xs font-semibold text-slate-300">No income data recorded</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Add income transactions to visualize your revenue streams.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="amount"
                nameKey="category"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomIncomeTooltip formatMoney={formatMoney} />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Categories Breakdown List */}
      <div className="space-y-2 mt-4 pt-3 border-t border-white/5 text-xs">
        {data.map((item, idx) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="capitalize text-slate-300 font-medium">{item.category}</span>
            </div>
            <span className="font-bold text-white">{formatMoney(item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
