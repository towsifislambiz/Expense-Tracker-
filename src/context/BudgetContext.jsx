import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeBudgets,
  createBudget as createBudgetInFirestore,
  updateBudget as updateBudgetInFirestore,
  deleteBudget as deleteBudgetInFirestore,
  getBudgets
} from '../services/firestore/budgets';
import { parseAuthError } from '../utils/firebaseErrors';

const BudgetContext = createContext(null);

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};

const INITIAL_DEMO_BUDGETS = [
  { id: 'demo-b-1', name: 'Shopping Budget', type: 'category', category: 'shopping', amount: 20000, period: 'monthly', rolloverEnabled: false },
  { id: 'demo-b-2', name: 'Food & Dining Budget', type: 'category', category: 'food', amount: 15000, period: 'monthly', rolloverEnabled: true },
  { id: 'demo-b-3', name: 'Transport Ceiling', type: 'category', category: 'transport', amount: 10000, period: 'monthly', rolloverEnabled: false },
];

export const BudgetProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener subscription or Demo User Mode
  useEffect(() => {
    if (!currentUser) {
      setBudgets([]);
      setLoadingBudgets(false);
      return;
    }

    if (currentUser.isDemo) {
      setBudgets(INITIAL_DEMO_BUDGETS);
      setLoadingBudgets(false);
      setError(null);
      return;
    }

    setLoadingBudgets(true);
    setError(null);

    const unsubscribe = subscribeBudgets(
      currentUser.uid,
      (data) => {
        setBudgets(data);
        setLoadingBudgets(false);
      },
      (err) => {
        setError(parseAuthError(err));
        setLoadingBudgets(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Create Budget Handler (Optimistic Update)
  const createBudget = async (budgetData) => {
    if (!currentUser) throw new Error('Unauthenticated user.');
    setError(null);

    if (currentUser.isDemo) {
      const created = { id: `demo_b_${Date.now()}`, ...budgetData };
      setBudgets((prev) => [created, ...prev]);
      return created;
    }

    try {
      const created = await createBudgetInFirestore(currentUser.uid, budgetData);
      setBudgets((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(parseAuthError(err));
      throw err;
    }
  };

  // Update Budget Handler (Optimistic Update)
  const updateBudget = async (id, updatedFields) => {
    if (!currentUser) throw new Error('Unauthenticated user.');
    setError(null);

    if (currentUser.isDemo) {
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
      );
      return;
    }

    try {
      await updateBudgetInFirestore(currentUser.uid, id, updatedFields);
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
      );
    } catch (err) {
      setError(parseAuthError(err));
      throw err;
    }
  };

  // Soft Delete Budget Handler (Optimistic Update)
  const deleteBudget = async (id) => {
    if (!currentUser) throw new Error('Unauthenticated user.');
    setError(null);

    if (currentUser.isDemo) {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      return;
    }

    try {
      await deleteBudgetInFirestore(currentUser.uid, id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(parseAuthError(err));
      throw err;
    }
  };

  // Duplicate Budget Feature (Copy to Next Month or Same Month)
  const duplicateBudget = async (budgetToCopy) => {
    if (!currentUser || !budgetToCopy) return;
    const now = new Date();
    const nextMonth = (now.getMonth() + 1) % 12;
    const nextYear = nextMonth === 0 ? now.getFullYear() + 1 : now.getFullYear();

    const copyData = {
      name: `${budgetToCopy.name} (Copy)`,
      type: budgetToCopy.type,
      category: budgetToCopy.category,
      amount: budgetToCopy.amount,
      period: budgetToCopy.period,
      month: nextMonth,
      year: nextYear,
      rolloverEnabled: budgetToCopy.rolloverEnabled,
    };

    return await createBudget(copyData);
  };

  // Instantly clear in-memory state during tracker reset
  const clearBudgetsState = () => {
    setBudgets([]);
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        loadingBudgets,
        error,
        createBudget,
        updateBudget,
        deleteBudget,
        duplicateBudget,
        clearBudgetsState,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
