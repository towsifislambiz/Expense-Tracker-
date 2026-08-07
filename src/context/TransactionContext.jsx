import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction as deleteTransactionFromFirestore,
  bulkDeleteTransactionsFromFirestore,
  deleteAllTransactionsFromFirestore,
  cleanupLegacyBudgetTransactions
} from '../services/firestore/transactions';
import {
  subscribeDailyExpenses,
  extractExpenseEntriesFromDailyDocs
} from '../services/firestore/dailyExpenseService';
import { parseAuthError } from '../utils/firebaseErrors';

const TransactionContext = createContext(null);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

const INITIAL_DEMO_TRANSACTIONS = [
  { id: 'demo-tx-1', title: 'Monthly Salary', amount: 150000, type: 'income', category: 'salary', date: '2026-08-01', status: 'completed' },
  { id: 'demo-tx-2', title: 'Shopping', amount: 15000, type: 'expense', category: 'shopping', date: '2026-08-03', status: 'completed' },
  { id: 'demo-tx-3', title: 'Transport', amount: 6000, type: 'expense', category: 'transport', date: '2026-08-05', status: 'completed' },
  { id: 'demo-tx-4', title: 'Subscriptions', amount: 2500, type: 'expense', category: 'subscriptions', date: '2026-08-06', status: 'completed' },
];

const INITIAL_DEMO_DAILY_DOCS = [
  {
    id: '2026-08-08',
    date: '2026-08-08',
    categoriesData: {
      food: { categoryName: 'Food & Dining', items: [{ id: 'd-1', description: 'Lunch & Coffee', amount: 450 }] },
      shopping: { categoryName: 'Shopping', items: [{ id: 'd-2', description: 'T-Shirt', amount: 2000 }, { id: 'd-3', description: 'Shoes', amount: 500 }] },
    },
    grandTotal: 2950
  }
];

export const TransactionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [dailyExpenseDocs, setDailyExpenseDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener subscriptions or Demo User Mode
  useEffect(() => {
    if (!currentUser) {
      setLedgerTransactions([]);
      setDailyExpenseDocs([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (currentUser.isDemo) {
      setLedgerTransactions(INITIAL_DEMO_TRANSACTIONS);
      setDailyExpenseDocs(INITIAL_DEMO_DAILY_DOCS);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Auto-purge historical legacy proxy transactions if present
    cleanupLegacyBudgetTransactions(currentUser.uid).catch((e) => {
      console.warn('Migration note:', e);
    });

    // 1. DASHBOARD MODULE READ: Subscribe strictly to users/{uid}/transactions
    const unsubTransactions = subscribeTransactions(
      currentUser.uid,
      (rawList) => {
        const cleanLedger = (rawList || []).filter((t) => {
          if (!t) return false;
          if (t.isDailyEntry || String(t.id || '').startsWith('daily_')) {
            return false;
          }
          return true;
        });
        setLedgerTransactions(cleanLedger);
        setLoading(false);
      },
      (err) => {
        console.error('[TransactionContext] Transactions Listener Error:', err);
        setError(parseAuthError(err));
        setLoading(false);
      }
    );

    // 2. DAILY EXPENSE TRACKER & CATEGORY SUMMARY READ: Subscribe strictly to users/{uid}/daily_expenses
    const unsubDailyExpenses = subscribeDailyExpenses(
      currentUser.uid,
      (docs) => {
        setDailyExpenseDocs(docs || []);
        setLoading(false);
      },
      (err) => {
        console.error('[TransactionContext] DailyExpenses Listener Error:', err);
        setError(parseAuthError(err));
        setLoading(false);
      }
    );

    return () => {
      unsubTransactions();
      unsubDailyExpenses();
    };
  }, [currentUser]);

  // Extract flat itemized daily expense entries strictly from daily_expenses for Category Summary
  const dailyExpenseEntries = React.useMemo(() => {
    return extractExpenseEntriesFromDailyDocs(dailyExpenseDocs);
  }, [dailyExpenseDocs]);

  // Helper for demo user daily expense state updates
  const saveDemoDailyExpenseDoc = (dateStr, categoriesData, grandTotal) => {
    setDailyExpenseDocs((prev) => {
      const existingIdx = prev.findIndex((d) => (d.date || d.id) === dateStr);
      const newDoc = { id: dateStr, date: dateStr, categoriesData, grandTotal };
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newDoc;
        return copy;
      }
      return [newDoc, ...prev];
    });
  };

  // Create transaction in Firestore (Income / Monthly Ledger)
  const addTransaction = async (newTx) => {
    if (!currentUser) {
      throw new Error('Unauthenticated user. Please log in to add transactions.');
    }
    setError(null);

    if (currentUser.isDemo) {
      const createdTx = {
        id: `demo_tx_${Date.now()}`,
        date: newTx.date || new Date().toISOString().split('T')[0],
        status: newTx.status || 'completed',
        ...newTx,
      };
      setLedgerTransactions((prev) => [createdTx, ...prev]);
      return createdTx;
    }

    try {
      const createdTx = await createTransaction(currentUser.uid, newTx);
      return createdTx;
    } catch (err) {
      setError(parseAuthError(err));
      throw err;
    }
  };

  // Update transaction in Firestore
  const updateTransactionData = async (id, updatedFields) => {
    if (!currentUser) throw new Error('Unauthenticated user.');
    setError(null);

    if (currentUser.isDemo) {
      setLedgerTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
      );
      return;
    }

    try {
      await updateTransaction(currentUser.uid, id, updatedFields);
    } catch (err) {
      setError(parseAuthError(err));
      throw err;
    }
  };

  // Delete transaction in Firestore
  const deleteTransactionData = async (id) => {
    if (!currentUser) throw new Error('Unauthenticated user.');
    setError(null);

    if (currentUser.isDemo) {
      setLedgerTransactions((prev) => prev.filter((t) => t.id !== id));
      return;
    }

    try {
      await deleteTransactionFromFirestore(currentUser.uid, id);
    } catch (err) {
      setError(parseAuthError(err));
      throw err;
    }
  };

  // Bulk Delete transactions in Firestore
  const bulkDeleteTransactionsData = async (ids = []) => {
    if (!currentUser) throw new Error('Unauthenticated user.');
    if (!Array.isArray(ids) || ids.length === 0) return;
    setError(null);

    if (currentUser.isDemo) {
      setLedgerTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
      return;
    }

    try {
      await bulkDeleteTransactionsFromFirestore(currentUser.uid, ids);
    } catch (err) {
      setError(parseAuthError(err));
      throw err;
    }
  };

  // Delete ALL transactions in Firestore
  const deleteAllTransactionsData = async () => {
    if (!currentUser) throw new Error('Unauthenticated user.');
    setError(null);

    if (currentUser.isDemo) {
      setLedgerTransactions([]);
      return;
    }

    try {
      await deleteAllTransactionsFromFirestore(currentUser.uid);
    } catch (err) {
      setError(parseAuthError(err));
      throw err;
    }
  };

  // Instantly clear in-memory state during tracker reset
  const clearTransactionsState = () => {
    setLedgerTransactions([]);
    setDailyExpenseDocs([]);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions: ledgerTransactions, // Strictly Monthly Transaction Ledger for Dashboard
        dailyExpenseEntries, // Strictly Daily Expense Records for Category Summary & Budget Page
        dailyExpenseDocs, // Raw daily_expenses documents
        loading,
        error,
        addTransaction,
        updateTransaction: updateTransactionData,
        deleteTransaction: deleteTransactionData,
        bulkDeleteTransactions: bulkDeleteTransactionsData,
        deleteAllTransactions: deleteAllTransactionsData,
        clearTransactionsState,
        saveDemoDailyExpenseDoc,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
