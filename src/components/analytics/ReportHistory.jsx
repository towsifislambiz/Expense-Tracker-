import React from 'react';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { exportFinancialReportCSV, exportFinancialReportPDF } from '../../utils/exportTransactions';

export const ReportHistory = () => {
  const { transactions } = useExpenses();

  const reportsList = [
    { id: 'r-1', title: 'Monthly Executive Report - Current Ledger', date: 'August 2026', itemsCount: transactions.length },
    { id: 'r-2', title: 'Monthly Executive Report - July 2026', date: 'July 2026', itemsCount: Math.max(0, transactions.length - 2) },
    { id: 'r-3', title: 'Quarterly Solvency Audit - Q2 2026', date: 'June 2026', itemsCount: Math.max(0, transactions.length - 5) },
  ];

  return (
    <div className="card-locked p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Report History Archives</h3>
          <p className="text-xs text-slate-400">Download past financial reports and solvency summaries</p>
        </div>
      </div>

      <div className="space-y-3">
        {reportsList.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{r.title}</h4>
                <span className="text-xs text-slate-400">
                  {r.date} • {r.itemsCount} Records
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportFinancialReportCSV(transactions)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => exportFinancialReportPDF(transactions)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
