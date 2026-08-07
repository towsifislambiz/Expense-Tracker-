import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Save, CalendarDays, AlertCircle, Loader2, PieChart, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useBudgets } from '../context/BudgetContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTransactions } from '../context/TransactionContext';
import { getDailyExpensesByDate, saveDailyExpensesService } from '../services/firestore/dailyExpenseService';
import { ExpenseCalendar } from '../components/analytics/ExpenseCalendar';
import { SmartInsightsWidget } from '../components/analytics/SmartInsightsWidget';
import { MonthlyCategorySummary } from '../components/analytics/MonthlyCategorySummary';
import { ExpenseHistoryTable } from '../components/analytics/ExpenseHistoryTable';

export const DailyExpenseTrackerPage = () => {
  const { currentUser } = useAuth();
  const { categories, categoryBreakdown, stats, transactions, showToast } = useExpenses();
  const { saveDemoDailyExpenseDoc } = useTransactions();
  const { budgets } = useBudgets();
  const { formatMoney, symbol: currencySymbol } = useCurrency();

  // Active view mode: 'editor' | 'calendar' | 'summary' | 'history'
  const [viewMode, setViewMode] = useState('editor');

  // Date selection state (Default: Today YYYY-MM-DD in local time)
  const getTodayLocalStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getTodayLocalStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const isFutureDate = Boolean(selectedDate && selectedDate > todayStr);

  // Form State: { [catId]: { categoryName: '...', items: [{ id, description, amount }] } }
  const [formState, setFormState] = useState({});
  const [initialFormState, setInitialFormState] = useState({});
  const [isLoadingDate, setIsLoadingDate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Active Category List
  const activeCategories = (categories && categories.length > 0)
    ? categories
    : [
        { id: 'food', name: 'Food & Dining', color: '#10b981' },
        { id: 'transport', name: 'Transport', color: '#3b82f6' },
        { id: 'shopping', name: 'Shopping', color: '#ec4899' },
        { id: 'bills', name: 'Bills & Utilities', color: '#f59e0b' },
        { id: 'entertainment', name: 'Entertainment', color: '#8b5cf6' },
        { id: 'healthcare', name: 'Healthcare', color: '#ef4444' },
      ];

  // Load existing data for selectedDate (Duplicate Protection & Backdate Editing)
  useEffect(() => {
    let isMounted = true;

    const loadDateData = async () => {
      if (!currentUser || !selectedDate) return;
      setIsLoadingDate(true);
      setValidationError('');

      try {
        const existingDoc = await getDailyExpensesByDate(currentUser.uid, selectedDate);
        if (!isMounted) return;

        const loadedForm = {};
        activeCategories.forEach((cat) => {
          const catKey = String(cat.id).toLowerCase().trim();
          if (existingDoc && existingDoc.categoriesData && existingDoc.categoriesData[catKey]) {
            loadedForm[catKey] = {
              categoryName: cat.name,
              items: existingDoc.categoriesData[catKey].items || [],
            };
          } else {
            loadedForm[catKey] = {
              categoryName: cat.name,
              items: [],
            };
          }
        });

        setFormState(loadedForm);
        setInitialFormState(JSON.parse(JSON.stringify(loadedForm)));
      } catch (err) {
        console.error('Error loading date data:', err);
      } finally {
        if (isMounted) setIsLoadingDate(false);
      }
    };

    loadDateData();

    return () => {
      isMounted = false;
    };
  }, [currentUser, selectedDate, categories]);

  // Determine if form has unsaved modifications (Dirty state lock for Save Button)
  const isFormDirty = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(initialFormState);
  }, [formState, initialFormState]);

  // Handle Date Selection from Calendar or History Edit click
  const handleSelectDateFromChild = (dateStr) => {
    setSelectedDate(dateStr);
    setViewMode('editor');
  };

  // Add Item Row under Category
  const handleAddItem = (catId) => {
    setValidationError('');
    setFormState((prev) => {
      const catObj = prev[catId] || { categoryName: '', items: [] };
      return {
        ...prev,
        [catId]: {
          ...catObj,
          items: [
            ...catObj.items,
            { id: Date.now().toString() + Math.random().toString(36).substring(2, 5), description: '', amount: '' },
          ],
        },
      };
    });
  };

  // Update Item Row Property
  const handleUpdateItem = (catId, itemId, field, value) => {
    setValidationError('');
    setFormState((prev) => {
      const catObj = prev[catId];
      if (!catObj) return prev;

      const updatedItems = catObj.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, [field]: value };
        }
        return item;
      });

      return {
        ...prev,
        [catId]: {
          ...catObj,
          items: updatedItems,
        },
      };
    });
  };

  // Remove Item Row
  const handleRemoveItem = (catId, itemId) => {
    setValidationError('');
    setFormState((prev) => {
      const catObj = prev[catId];
      if (!catObj) return prev;

      return {
        ...prev,
        [catId]: {
          ...catObj,
          items: catObj.items.filter((item) => item.id !== itemId),
        },
      };
    });
  };

  // Calculate Form Daily Total
  const grandTotal = useMemo(() => {
    let total = 0;
    Object.values(formState).forEach((cat) => {
      (cat.items || []).forEach((item) => {
        const amt = Number(item.amount);
        if (!isNaN(amt) && amt > 0) {
          total += amt;
        }
      });
    });
    return total;
  }, [formState]);

  // Selected Date Financial Overview (Selected Date Income, Expense, Net)
  const selectedDateMetrics = useMemo(() => {
    let dayIncome = 0;
    let dayExpense = grandTotal;

    (transactions || []).forEach((t) => {
      if (t.date && String(t.date).split('T')[0] === selectedDate) {
        const typeStr = String(t.type || '').toLowerCase().trim();
        const amt = Number(t.amount) || 0;
        if (typeStr === 'income') {
          dayIncome += amt;
        } else if (typeStr === 'expense' && !t.isDailyEntry) {
          dayExpense += amt;
        }
      }
    });

    const dayNet = dayIncome - dayExpense;
    const totalMonthlyBudget = (budgets || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const monthlySpent = Number(stats?.monthlyExpenses) || 0;
    const remainingMonthlyBudget = Math.max(0, totalMonthlyBudget - monthlySpent);

    return {
      dayIncome,
      dayExpense,
      dayNet,
      remainingMonthlyBudget,
    };
  }, [transactions, selectedDate, grandTotal, budgets, stats]);

  // Save Handler
  const handleSave = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!currentUser) {
      setValidationError('You must be logged in to save expenses.');
      return;
    }

    if (!selectedDate) {
      setValidationError('Please select a valid expense date.');
      return;
    }

    if (isFutureDate || selectedDate > todayStr) {
      const errMsg = '❌ You cannot add expenses for a future date. Please select today or a previous date.';
      setValidationError(errMsg);
      if (showToast) {
        showToast('Future dates are not allowed for Daily Expense entries.', 'error');
      }
      return;
    }

    let hasInvalidAmount = false;
    let hasMissingDesc = false;

    Object.values(formState).forEach((cat) => {
      (cat.items || []).forEach((item) => {
        const desc = String(item.description || '').trim();
        const amt = Number(item.amount);

        if (desc || item.amount !== '') {
          if (!desc) hasMissingDesc = true;
          if (isNaN(amt) || amt <= 0) hasInvalidAmount = true;
        }
      });
    });

    if (hasMissingDesc) {
      setValidationError('Please enter a description for all expense rows.');
      return;
    }

    if (hasInvalidAmount) {
      setValidationError('Expense amounts must be positive numbers greater than 0.');
      return;
    }

    setIsSaving(true);
    try {
      if (currentUser?.isDemo) {
        if (saveDemoDailyExpenseDoc) {
          saveDemoDailyExpenseDoc(selectedDate, formState, grandTotal);
        }
      } else {
        await saveDailyExpensesService(currentUser.uid, selectedDate, formState, grandTotal);
      }
      setInitialFormState(JSON.parse(JSON.stringify(formState)));

      if (showToast) {
        showToast(`Daily expenses saved for ${selectedDate} (Total: ${formatMoney(grandTotal)})!`, 'success');
      }
    } catch (err) {
      console.error('Save Daily Expenses Error:', err);
      setValidationError('Failed to save expenses. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner & Date Selector */}
      <div className="card-locked p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2.5">
            <CalendarDays className="w-6 h-6 text-indigo-400" />
            <span>Personal Finance & Daily Expense Manager</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Itemized daily expense logging, real-time budget tracking, solvency insights, and historical audits.
          </p>
        </div>

        {/* Date Selector Box (Block Future Dates) */}
        <div className="flex flex-col">
          <div className={`flex items-center space-x-3 p-2.5 rounded-xl border transition-all ${
            isFutureDate
              ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
              : 'bg-[#171928] border-white/10'
          }`}>
            <CalendarIcon className={`w-4 h-4 flex-shrink-0 ${isFutureDate ? 'text-rose-400' : 'text-indigo-400'}`} />
            <div className="flex flex-col">
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${isFutureDate ? 'text-rose-400' : 'text-slate-400'}`}>
                Expense Date
              </label>
              <input
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
          {isFutureDate && (
            <span className="text-[11px] font-bold text-rose-400 mt-1.5 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-rose-400" />
              <span>❌ You cannot add expenses for a future date. Please select today or a previous date.</span>
            </span>
          )}
        </div>
      </div>

      {/* Instant Daily Financial Insight Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">Selected Date Income</span>
          <span className="text-base sm:text-lg font-extrabold text-emerald-400">+{formatMoney(selectedDateMetrics.dayIncome)}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">Selected Date Expense</span>
          <span className="text-base sm:text-lg font-extrabold text-rose-400">-{formatMoney(selectedDateMetrics.dayExpense)}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">Selected Date Net</span>
          <span className={`text-base sm:text-lg font-extrabold ${selectedDateMetrics.dayNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatMoney(selectedDateMetrics.dayNet)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">Remaining Monthly Budget</span>
          <span className="text-base sm:text-lg font-extrabold text-indigo-300">{formatMoney(selectedDateMetrics.remainingMonthlyBudget)}</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'editor', label: 'Daily Expense Editor' },
          { id: 'calendar', label: 'Monthly Calendar View' },
          { id: 'summary', label: 'Category Summary' },
          { id: 'history', label: 'Expense History & Search' },
        ].map((tab) => {
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Smart Insights & Over Budget Warning Banner */}
      <SmartInsightsWidget />

      {/* TAB 1: DAILY EXPENSE EDITOR */}
      {viewMode === 'editor' && (
        <div className="space-y-6">
          {/* Validation Error Alert Banner */}
          {validationError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Active Budgets Consumption Monitor */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Budget Consumption Status</span>
            </h3>

            {(!budgets || budgets.length === 0) ? (
              <div className="card-locked p-4 text-xs text-slate-400">
                No budget limits created yet. Go to <strong className="text-indigo-300">Budgets</strong> page to set category spending targets.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((b) => {
                  let spent = 0;
                  if (b.type === 'category') {
                    const catKey = String(b.category || '').toLowerCase().trim();
                    const catTxs = (transactions || []).filter(
                      (t) => String(t.type || '').toLowerCase().trim() === 'expense' && String(t.category || '').toLowerCase().trim() === catKey
                    );
                    spent = catTxs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                  } else {
                    spent = Number(stats?.monthlyExpenses) || 0;
                  }

                  const target = Number(b.amount) || 0;
                  const remaining = target - spent;
                  const actualPct = target > 0 ? (spent / target) * 100 : 0;
                  const barPct = Math.min(100, actualPct);

                  // 4-Tier Color System (0-60% Green, 60-85% Yellow, 85-100% Orange, >=100% Red)
                  let colorGrad = 'from-emerald-500 to-teal-500';
                  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

                  if (actualPct >= 100) {
                    colorGrad = 'from-rose-500 to-pink-500';
                    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                  } else if (actualPct >= 85) {
                    colorGrad = 'from-orange-500 to-amber-500';
                    badgeColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
                  } else if (actualPct >= 60) {
                    colorGrad = 'from-amber-500 to-yellow-500';
                    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                  }

                  return (
                    <div key={b.id} className="card-locked p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-36">{b.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {actualPct.toFixed(0)}% Used
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-400">Spent / Limit:</span>
                        <span className="font-bold text-white">
                          {formatMoney(spent)} / <span className="text-slate-400">{formatMoney(target)}</span>
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-400">Remaining:</span>
                        <span className={`font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatMoney(remaining)}
                        </span>
                      </div>

                      <div className="w-full bg-[#171928] rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div
                          className={`bg-gradient-to-r ${colorGrad} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Itemized Daily Entry Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activeCategories.map((cat) => {
                const catKey = String(cat.id).toLowerCase().trim();
                const catData = formState[catKey] || { categoryName: cat.name, items: [] };
                const items = catData.items || [];

                const categoryTotal = items.reduce((acc, curr) => {
                  const val = Number(curr.amount);
                  return acc + (!isNaN(val) && val > 0 ? val : 0);
                }, 0);

                const isEmpty = items.length === 0;

                return (
                  <div key={cat.id} className="card-locked p-4 space-y-3">
                    {/* Category Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#6366f1' }} />
                        <h3 className="text-sm font-bold text-white capitalize">{cat.name}</h3>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          {items.length} {items.length === 1 ? 'Item' : 'Items'}
                        </span>
                        <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                          Total: {formatMoney(categoryTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Compact View for Empty Categories */}
                    {isEmpty ? (
                      <div className="flex items-center justify-between py-1 text-xs text-slate-500">
                        <span className="italic text-[11px]">No items recorded for {cat.name} on this date.</span>
                        <button
                          type="button"
                          onClick={() => handleAddItem(catKey)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold flex items-center space-x-1 border border-indigo-500/20 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Item</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Populate Items List */}
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Description (e.g. Lunch, Bus)"
                                value={item.description}
                                onChange={(e) => handleUpdateItem(catKey, item.id, 'description', e.target.value)}
                                className="flex-1 bg-[#171928] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                              />
                              <input
                                type="number"
                                placeholder={`Amount (${currencySymbol || '৳'})`}
                                value={item.amount}
                                min="0"
                                step="any"
                                onChange={(e) => handleUpdateItem(catKey, item.id, 'amount', e.target.value)}
                                className="w-24 sm:w-28 bg-[#171928] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-semibold flex-shrink-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(catKey, item.id)}
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddItem(catKey)}
                            className="w-full py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Add Item</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Bar with Grand Total & Dirty Save Button */}
            <div className="sticky bottom-4 card-locked p-4 rounded-2xl flex items-center justify-between gap-4 border border-indigo-500/30 shadow-2xl z-20">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Selected Date Total ({selectedDate})</span>
                <span className="text-lg sm:text-xl font-extrabold text-white">{formatMoney(grandTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={isSaving || isLoadingDate || !isFormDirty || isFutureDate}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2"
                title={
                  isFutureDate
                    ? 'Future dates are not allowed for Daily Expense entries'
                    : !isFormDirty
                    ? 'No changes to save'
                    : 'Save changes to Firestore'
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isFormDirty ? 'Save Daily Expenses' : 'No Changes to Save'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MONTHLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <ExpenseCalendar onSelectDate={handleSelectDateFromChild} />
      )}

      {/* TAB 3: CATEGORY SUMMARY */}
      {viewMode === 'summary' && (
        <MonthlyCategorySummary />
      )}

      {/* TAB 4: EXPENSE HISTORY & SEARCH */}
      {viewMode === 'history' && (
        <ExpenseHistoryTable onSelectDateForEdit={handleSelectDateFromChild} />
      )}
    </div>
  );
};
