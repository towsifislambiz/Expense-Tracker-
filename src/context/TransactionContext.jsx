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

export const TransactionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [dailyExpenseDocs, setDailyExpenseDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener subscriptions
  useEffect(() => {
    if (!currentUser) {
      setLedgerTransactions([]);
      setDailyExpenseDocs([]);
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

  // Create transaction in Firestore (Income / Monthly Ledger)
  const addTransaction = async (newTx) => {
    if (!currentUser) {
      throw new Error('Unauthenticated user. Please log in to add transactions.');
    }
    setError(null);
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
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
