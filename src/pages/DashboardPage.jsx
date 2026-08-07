import React from 'react';
import { StatCardsGroup } from '../components/dashboard/StatCardsGroup';
import { ExpenseOverview } from '../components/dashboard/ExpenseOverview';
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { FinancialInsightCard } from '../components/dashboard/FinancialInsightCard';
import { TopSpendingCategory } from '../components/dashboard/TopSpendingCategory';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { useExpenses } from '../context/ExpenseContext';

export const DashboardPage = ({ onOpenAddModal, onEditTransaction }) => {
  const { loadingTransactions } = useExpenses();

  if (loadingTransactions) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Dynamic Statistic Summary Cards (Total Income, Total Spent This Month, Balance, Savings) */}
      <StatCardsGroup />

      {/* Row 2: Financial Insight & Top Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FinancialInsightCard />
        <TopSpendingCategory />
      </div>

      {/* Row 3: Category Expense Breakdown (5 cols) & Monthly Trend Area Chart (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <ExpenseOverview />
        </div>
        <div className="lg:col-span-7">
          <MonthlyTrendChart />
        </div>
      </div>

      {/* Row 4: Recent Financial Transactions & Daily Expense Ledger */}
      <div className="w-full">
        <RecentTransactionsTable onOpenAddModal={onOpenAddModal} onEditTransaction={onEditTransaction} />
      </div>
    </div>
  );
};
