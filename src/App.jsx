import React, { useState, lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { SettingsProvider } from './context/SettingsContext';
import { TransactionProvider } from './context/TransactionContext';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { BudgetProvider } from './context/BudgetContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BackgroundOrbs } from './components/layout/BackgroundOrbs';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Toast } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/loading/PageLoader';
import { TransactionModal } from './components/modals/TransactionModal';
import { AlertTriangle } from 'lucide-react';

import { DashboardPage } from './pages/DashboardPage';

// Lazy-loaded pages for performance code-splitting
const TransactionsPage = lazy(() =>
  import('./pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage }))
);
const DailyExpenseTrackerPage = lazy(() =>
  import('./pages/DailyExpenseTrackerPage').then((m) => ({ default: m.DailyExpenseTrackerPage }))
);
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const BudgetsGoalsPage = lazy(() =>
  import('./pages/BudgetsGoalsPage').then((m) => ({ default: m.BudgetsGoalsPage }))
);
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const DashboardShell = () => {
  const { activeTab } = useExpenses();
  const { currentUser, resendVerification } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleResendEmail = async () => {
    try {
      await resendVerification();
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 4000);
    } catch (err) {
      console.error("Resend error:", err);
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'daily-tracker':
        return <DailyExpenseTrackerPage onEditTransaction={handleEditTransaction} />;
      case 'transactions':
      case 'income':
      case 'expenses':
        return <TransactionsPage onOpenAddModal={handleOpenAdd} onEditTransaction={handleEditTransaction} />;
      case 'analytics':
      case 'reports':
      case 'calendar':
        return <AnalyticsPage initialTab={activeTab} />;
      case 'budgets':
      case 'goals':
        return <BudgetsGoalsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'settings':
      case 'profile':
      case 'help':
        return <SettingsPage initialTab={activeTab} />;
      case 'dashboard':
      default:
        return (
          <DashboardPage
            onOpenAddModal={handleOpenAdd}
            onEditTransaction={handleEditTransaction}
            onOpenAddBudgetModal={handleOpenAdd}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-[#0b0d14] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden pb-16 md:pb-0">
      {/* Background Radial Glow Layer */}
      <BackgroundOrbs />

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenAddModal={handleOpenAdd}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Email Verification Alert Banner */}
        {currentUser && !currentUser.emailVerified && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between flex-wrap gap-2 z-20">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Your email address (<strong>{currentUser.email}</strong>) is unverified. Please check your inbox.</span>
            </div>
            <button
              onClick={handleResendEmail}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-lg font-semibold cursor-pointer transition-colors"
            >
              {verificationSent ? 'Verification Link Sent!' : 'Resend Verification Email'}
            </button>
          </div>
        )}

        {/* Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddModal={handleOpenAdd}
        />

        {/* Page View Container with Suspense Fallback */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Suspense fallback={<PageLoader />}>
            {renderActivePage()}
          </Suspense>
        </main>
      </div>

      {/* Touch-Friendly Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Toast Notification Container */}
      <Toast />

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editData={editingTransaction}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <SettingsProvider>
              <TransactionProvider>
                <BudgetProvider>
                  <ExpenseProvider>
                    <ProtectedRoute>
                      <DashboardShell />
                    </ProtectedRoute>
                  </ExpenseProvider>
                </BudgetProvider>
              </TransactionProvider>
            </SettingsProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
