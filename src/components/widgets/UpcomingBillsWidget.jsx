import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Badge } from '../common/Badge';

export const UpcomingBillsWidget = () => {
  const { upcomingBills = [], addTransaction } = useExpenses();
  const { formatMoney } = useCurrency();

  const safeBills = Array.isArray(upcomingBills) ? upcomingBills : [];

  const handlePayBill = (bill) => {
    if (addTransaction) {
      addTransaction({
        title: `Payment: ${bill.title}`,
        amount: bill.amount,
        type: 'expense',
        category: 'bills',
        status: 'completed',
        notes: `Paid to ${bill.provider}`,
      });
    }
  };

  return (
    <div className="card-locked rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Upcoming Bills</h3>
            <p className="text-xs text-slate-400">Scheduled obligations</p>
          </div>
        </div>
        <Badge variant={safeBills.length > 0 ? 'warning' : 'success'}>
          {safeBills.length} Due Soon
        </Badge>
      </div>

      {safeBills.length === 0 ? (
        <div className="py-8 text-center text-slate-400 my-auto">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">No Upcoming Bills</p>
          <p className="text-xs text-slate-400 mt-0.5">All scheduled obligations are paid up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeBills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-amber-500/30 transition-all"
            >
              <div>
                <h4 className="text-xs font-semibold text-white">{bill.title}</h4>
                <p className="text-[11px] text-slate-400">
                  {bill.provider} • Due {bill.dueDate}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-amber-400">{formatMoney(bill.amount)}</span>
                <button
                  onClick={() => handlePayBill(bill)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer"
                >
                  Pay Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
