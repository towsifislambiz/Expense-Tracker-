import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useBudgets } from '../../context/BudgetContext';
import { useCurrency } from '../../context/CurrencyContext';

export const ExpenseCalendar = ({ onSelectDate }) => {
  const { transactions } = useExpenses();
  const { budgets } = useBudgets();
  const { formatMoney } = useCurrency();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Filter ONLY actual financial transactions (Never count budget documents as expenses)
  const dailyData = {};
  (transactions || []).forEach((t) => {
    if (!t.date) return;
    const d = new Date(t.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!dailyData[dayNum]) {
        dailyData[dayNum] = { totalExpense: 0, totalIncome: 0, items: [], hasDailyEntry: false };
      }
      const amt = Number(t.amount) || 0;
      const type = String(t.type || '').toLowerCase().trim();
      if (type === 'income') {
        dailyData[dayNum].totalIncome += amt;
      } else if (type === 'expense') {
        dailyData[dayNum].totalExpense += amt;
      }
      if (t.isDailyEntry) {
        dailyData[dayNum].hasDailyEntry = true;
      }
      dailyData[dayNum].items.push(t);
    }
  });

  // Determine Overall Daily Expense Limit Baseline
  const overallBudgetObj = (budgets || []).find((b) => b.type === 'overall');
  const monthlyBudgetLimit = overallBudgetObj ? Number(overallBudgetObj.amount) : 0;
  const avgDailyBudgetLimit = monthlyBudgetLimit > 0 ? monthlyBudgetLimit / daysInMonth : 0;

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const handleCellClick = (day) => {
    if (!day) return;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    if (onSelectDate) {
      onSelectDate(dateStr);
    }
  };

  return (
    <div className="card-locked p-6 space-y-4">
      {/* Calendar Header & Status Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-400">Click any day cell to edit daily itemized expenses.</p>
          </div>
        </div>

        {/* Status Colors Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-300 flex-wrap gap-y-1">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Green (All Updated)
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Yellow (Partial)
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Gray (No Entry)
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Red (Budget Exceeded)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Grid Table */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2 text-slate-400 font-bold uppercase text-[10px]">
            {d}
          </div>
        ))}

        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-900/20" />;
          }

          const dayInfo = dailyData[day];
          const hasTx = Boolean(dayInfo && dayInfo.items.length > 0);
          const totalExpense = dayInfo ? dayInfo.totalExpense : 0;
          const totalIncome = dayInfo ? dayInfo.totalIncome : 0;
          const netBalance = totalIncome - totalExpense;

          // Status Color Evaluation:
          // Green: Expenses updated & within budget limit
          // Yellow: Partial entries recorded
          // Gray: No entry recorded
          // Red: Exceeded daily/overall budget limit
          let statusBorder = 'border-white/5 bg-slate-900/30 opacity-60';

          if (hasTx) {
            if (avgDailyBudgetLimit > 0 && totalExpense > avgDailyBudgetLimit) {
              statusBorder = 'border-rose-500/40 bg-rose-500/10';
            } else if (dayInfo.hasDailyEntry) {
              statusBorder = 'border-emerald-500/40 bg-emerald-500/10';
            } else {
              statusBorder = 'border-amber-500/40 bg-amber-500/10';
            }
          }

          return (
            <div
              key={`day-${day}`}
              onClick={() => handleCellClick(day)}
              className={`h-20 sm:h-24 p-2 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer hover:scale-[1.02] hover:border-indigo-400 ${statusBorder}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{day}</span>
                {hasTx && (
                  <span className={`w-2 h-2 rounded-full ${
                    statusBorder.includes('rose')
                      ? 'bg-rose-500'
                      : statusBorder.includes('emerald')
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`} />
                )}
              </div>

              {/* Cell Breakdown: Income, Expense, and Net Balance */}
              {hasTx ? (
                <div className="space-y-0.5 text-[10px] font-bold">
                  {totalIncome > 0 && (
                    <div className="text-emerald-400 truncate">
                      +{formatMoney(totalIncome)}
                    </div>
                  )}
                  {totalExpense > 0 && (
                    <div className="text-rose-400 truncate">
                      -{formatMoney(totalExpense)}
                    </div>
                  )}
                  <div className={`border-t border-white/10 pt-0.5 text-[9px] ${netBalance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    Net: {formatMoney(netBalance)}
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">No entry</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
