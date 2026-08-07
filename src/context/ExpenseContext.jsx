import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useTransactions } from './TransactionContext';
import { useAuth } from './AuthContext';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { parseAuthError } from '../utils/firebaseErrors';
import { useBudgets } from './BudgetContext';
import {
  calculateTotalIncome,
  calculateTotalExpense,
  calculateBalance,
  calculateSavings,
  calculateCategoryExpense,
  filterTransactionsByDateRange,
} from '../utils/calculations';

import { resetAllFinancialData, verifyFinancialCollectionsEmpty } from '../services/firestore/resetTrackerService';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { budgets = [], clearBudgetsState } = useBudgets();
  const {
    transactions,
    dailyExpenseEntries = [],
    loading: loadingTransactions,
    addTransaction: addTx,
    updateTransaction: updateTx,
    deleteTransaction: deleteTx,
    bulkDeleteTransactions: bulkDeleteTx,
    deleteAllTransactions: deleteAllTx,
    clearTransactionsState,
    error: transactionsError
  } = useTransactions();

  const [categories, setCategories] = useState(EXPENSE_CATEGORIES);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('this-month');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Financial Wealth Goals State (With LocalStorage Persistence)
  const [goals, setGoalsState] = useState(() => {
    const saved = localStorage.getItem('luxe_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      { id: '1', title: 'Emergency Fund', targetAmount: 50000, currentAmount: 32500, category: 'Savings', color: '#10b981' },
      { id: '2', title: 'New Tech Setup', targetAmount: 250000, currentAmount: 180000, category: 'Tech', color: '#8b5cf6' },
      { id: '3', title: 'Vacation Trip', targetAmount: 120000, currentAmount: 45000, category: 'Travel', color: '#3b82f6' }
    ];
  });

  // Upcoming Bills State
  const [upcomingBills] = useState([
    { id: '1', title: 'Fiber Internet Subscription', provider: 'Starlink / ISP', amount: 1500, dueDate: 'Tomorrow' },
    { id: '2', title: 'Cloud Infrastructure Service', provider: 'Firebase / Google Cloud', amount: 3500, dueDate: 'In 4 days' },
  ]);

  const addGoal = (newGoal) => {
    const item = {
      id: Date.now().toString(),
      title: newGoal.title || 'New Goal',
      targetAmount: Number(newGoal.targetAmount) || 1000,
      currentAmount: 0,
      category: newGoal.category || 'Savings',
      color: newGoal.color || '#8b5cf6',
    };
    const updated = [...goals, item];
    setGoalsState(updated);
    localStorage.setItem('luxe_goals', JSON.stringify(updated));
    showToast(`Financial Goal "${item.title}" created!`, 'success');
  };

  const updateGoalProgress = (goalId, depositAmount) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: Math.min(g.targetAmount, g.currentAmount + (Number(depositAmount) || 0)),
        };
      }
      return g;
    });
    setGoalsState(updated);
    localStorage.setItem('luxe_goals', JSON.stringify(updated));
    showToast(`Deposited $${depositAmount} towards goal!`, 'success');
  };

  // Online / Offline status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper Toast
  const showToast = (message, type = 'info') => {
    setToastMessage({ id: Date.now(), message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add Transaction Handler (For Income & Monthly Ledger)
  const addTransaction = async (newTx) => {
    if (!currentUser) {
      showToast('You must be logged in to create transactions.', 'error');
      return;
    }

    try {
      await addTx(newTx);
      showToast('Transaction saved to Firestore successfully.', 'success');
    } catch (err) {
      console.error("Create Transaction Error:", err);
      showToast(parseAuthError(err), 'error');
      throw err;
    }
  };

  // Edit Transaction Handler
  const editTransaction = async (id, updatedFields) => {
    if (!currentUser) return;

    try {
      await updateTx(id, updatedFields);
      showToast('Transaction updated in Firestore!', 'success');
    } catch (err) {
      console.error("Update Transaction Error:", err);
      showToast(parseAuthError(err), 'error');
      throw err;
    }
  };

  // Delete Transaction Handler
  const deleteTransaction = async (id) => {
    if (!currentUser) return;

    const target = transactions.find((t) => t.id === id);
    const confirmed = window.confirm(`Are you sure you want to delete "${target?.title || 'this transaction'}"?`);
    if (!confirmed) return;

    try {
      await deleteTx(id);
      showToast('Transaction removed from Firestore.', 'warning');
    } catch (err) {
      console.error("Delete Transaction Error:", err);
      showToast(parseAuthError(err), 'error');
      throw err;
    }
  };

  // Bulk Delete Handler
  const bulkDeleteTransactions = async (ids = []) => {
    if (!currentUser || !ids || ids.length === 0) return;

    const confirmed = window.confirm(`Are you sure you want to delete ${ids.length} selected transaction(s)?`);
    if (!confirmed) return;

    try {
      await bulkDeleteTx(ids);
      showToast(`${ids.length} transaction(s) deleted from Firestore.`, 'warning');
    } catch (err) {
      console.error("Bulk Delete Error:", err);
      showToast(parseAuthError(err), 'error');
      throw err;
    }
  };

  // Delete ALL Transactions Handler
  const deleteAllTransactions = async () => {
    if (!currentUser) return;

    try {
      await deleteAllTx();
      showToast('All transactions permanently deleted from Firestore.', 'warning');
    } catch (err) {
      console.error("Delete All Transactions Error:", err);
      showToast(parseAuthError(err), 'error');
      throw err;
    }
  };

  // 1. DASHBOARD MODULE READ: Filter Monthly Transaction Ledger strictly for current month
  const currentMonthTransactions = useMemo(() => {
    return filterTransactionsByDateRange(transactions || [], 'this-month');
  }, [transactions]);

  // DASHBOARD FINANCIAL METRICS: Computed STRICTLY from Monthly Transaction Ledger (users/{uid}/transactions). Zero daily_expenses aggregation!
  const stats = useMemo(() => {
    const income = calculateTotalIncome(currentMonthTransactions);
    const expenses = calculateTotalExpense(currentMonthTransactions);
    const totalBalance = calculateBalance(currentMonthTransactions);
    const netSavings = calculateSavings(currentMonthTransactions);
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
    const currentDay = new Date().getDate() || 1;
    const avgDailySpend = expenses / currentDay;

    return {
      totalBalance,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      netSavings,
      savingsRate: Math.max(0, savingsRate),
      pendingBillsTotal: 0,
      avgDailySpend,
    };
  }, [currentMonthTransactions]);

  // 2. CATEGORY SUMMARY & BUDGET PAGE READ: Filter Daily Expense Entries strictly for current month
  const currentMonthDailyExpenses = useMemo(() => {
    return filterTransactionsByDateRange(dailyExpenseEntries || [], 'this-month');
  }, [dailyExpenseEntries]);

  // CATEGORY SUMMARY & BUDGET PAGE BREAKDOWN: Computed STRICTLY from Daily Expenses (users/{uid}/daily_expenses)
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryExpense(currentMonthDailyExpenses, categories, budgets);
  }, [currentMonthDailyExpenses, categories, budgets]);

  // Reset Tracker Handler (Full Financial Data Reset)
  const resetTracker = async (onProgress = () => {}) => {
    if (!currentUser) throw new Error('Unauthenticated user.');

    try {
      if (clearTransactionsState) clearTransactionsState();
      if (clearBudgetsState) clearBudgetsState();
      setGoalsState([]);

      await resetAllFinancialData(currentUser.uid, onProgress);

      onProgress('Finalizing Verification...');
      const isEmpty = await verifyFinancialCollectionsEmpty(currentUser.uid);

      if (!isEmpty) {
        console.warn('[Reset Tracker Warning] Post-reset check detected remaining documents.');
      }

      setActiveTab('dashboard');
      showToast('Tracker reset successfully. All financial records have been removed. Your account is still active.', 'success');
      return true;
    } catch (err) {
      console.error('[Reset Tracker Context Error]:', err);
      showToast(err.message || 'Failed to reset tracker.', 'error');
      throw err;
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        dailyExpenseEntries,
        currentMonthDailyExpenses,
        loadingTransactions,
        transactionsError,
        categories,
        goals,
        upcomingBills,
        stats,
        categoryBreakdown,
        currentMonthTransactions,
        toastMessage,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        isOffline,
        addTransaction,
        editTransaction,
        deleteTransaction,
        bulkDeleteTransactions,
        deleteAllTransactions,
        addGoal,
        updateGoalProgress,
        resetTracker,
        showToast,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
