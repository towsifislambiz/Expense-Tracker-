import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Activity,
  PieChart as PieChartIcon,
  Calendar as CalendarIcon,
  FileText,
  Download,
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { FinancialHealthCard } from '../components/analytics/FinancialHealthCard';
import { FinancialInsightCard } from '../components/dashboard/FinancialInsightCard';
import { IncomeAnalysis } from '../components/analytics/IncomeAnalysis';
import { ExpenseOverview } from '../components/dashboard/ExpenseOverview';
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart';
import { ExpenseCalendar } from '../components/analytics/ExpenseCalendar';
import { ReportHistory } from '../components/analytics/ReportHistory';
import { exportFinancialReportPDF, exportFinancialReportCSV } from '../utils/exportTransactions';

export const AnalyticsPage = ({ initialTab = 'overview' }) => {
  const { transactions } = useExpenses();
  const { formatMoney } = useCurrency();

  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab === 'calendar') return 'calendar';
    if (initialTab === 'reports') return 'reports';
    return 'overview';
  });

  useEffect(() => {
    if (initialTab === 'calendar') setActiveTab('calendar');
    else if (initialTab === 'reports') setActiveTab('reports');
    else if (initialTab === 'analytics' || initialTab === 'overview') setActiveTab('overview');
  }, [initialTab]);

  const TABS = [
    { id: 'overview', label: 'Overview & Health', icon: Activity },
    { id: 'income-spending', label: 'Income & Spending', icon: PieChartIcon },
    { id: 'calendar', label: 'Calendar View', icon: CalendarIcon },
    { id: 'reports', label: 'Historical Reports', icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="card-locked p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Financial Intelligence & Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Solvency health scoring, revenue streams, spending distribution, and executive reports.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => exportFinancialReportCSV(transactions || [])}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-slate-200 text-xs font-semibold cursor-pointer transition-all"
          >
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportFinancialReportPDF(transactions || [])}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-4 h-4" />
            <span>PDF Executive Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Health */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5">
              <FinancialHealthCard />
            </div>
            <div className="lg:col-span-7">
              <FinancialInsightCard />
            </div>
          </div>

          <MonthlyTrendChart />
        </div>
      )}

      {/* Tab 2: Income & Spending */}
      {activeTab === 'income-spending' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5">
            <IncomeAnalysis />
          </div>
          <div className="lg:col-span-7">
            <ExpenseOverview />
          </div>
        </div>
      )}

      {/* Tab 3: Calendar View */}
      {activeTab === 'calendar' && <ExpenseCalendar />}

      {/* Tab 4: Historical Reports */}
      {activeTab === 'reports' && <ReportHistory />}
    </div>
  );
};
