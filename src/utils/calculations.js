/**
 * Helper to identify if a transaction is an actual spending expense
 */
export const isActualExpenseTransaction = (t) => {
  if (!t) return false;
  const typeStr = String(t.type || '').toLowerCase().trim();
  if (typeStr !== 'expense') return false;

  const titleLower = String(t.title || '').toLowerCase().trim();

  // Filter out explicit budget proxy objects
  if (t.isBudgetProxy || titleLower.includes('monthly budget target limit')) {
    return false;
  }

  return true;
};

/**
 * Calculate total income from list of transactions with type normalization
 */
export const calculateTotalIncome = (transactions = []) => {
  if (!Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => String(t.type || '').toLowerCase().trim() === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
};

/**
 * Calculate total expense strictly from actual spending transactions
 */
export const calculateTotalExpense = (transactions = []) => {
  if (!Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => isActualExpenseTransaction(t))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
};

/**
 * Calculate balance: Total Income - Total Expense
 */
export const calculateBalance = (transactions = []) => {
  return calculateTotalIncome(transactions) - calculateTotalExpense(transactions);
};

/**
 * Calculate savings: Available balance or net savings
 */
export const calculateSavings = (transactions = []) => {
  const balance = calculateBalance(transactions);
  return Math.max(0, balance);
};

/**
 * Calculate expense breakdown by category strictly from actual transactions
 */
export const calculateCategoryExpense = (transactions = [], categoriesList = []) => {
  if (!Array.isArray(transactions)) return [];

  const categoryTotals = {};
  let totalExpense = 0;

  transactions.forEach((t) => {
    if (isActualExpenseTransaction(t)) {
      const amt = Number(t.amount) || 0;
      const catKey = String(t.category || 'others').toLowerCase().trim();
      categoryTotals[catKey] = (categoryTotals[catKey] || 0) + amt;
      totalExpense += amt;
    }
  });

  return categoriesList.map((cat) => {
    const catKey = String(cat.id || '').toLowerCase().trim();
    const spent = categoryTotals[catKey] || 0;
    const percentage = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
    return {
      ...cat,
      spent,
      percentage,
    };
  });
};

/**
 * Calculate monthly aggregated income vs expense data for charts
 */
export const calculateMonthlyData = (transactions = []) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMap = {};

  months.forEach((m) => {
    monthlyMap[m] = { month: m, income: 0, expense: 0 };
  });

  if (Array.isArray(transactions)) {
    transactions.forEach((t) => {
      if (!t.date) return;
      let monthIndex;
      if (typeof t.date === 'string' && t.date.includes('-')) {
        const parts = t.date.split('-').map(Number);
        if (parts.length >= 2 && !isNaN(parts[1])) {
          monthIndex = parts[1] - 1;
        }
      }
      if (monthIndex === undefined) {
        const dateObj = new Date(t.date);
        if (isNaN(dateObj.getTime())) return;
        monthIndex = dateObj.getMonth();
      }

      if (monthIndex < 0 || monthIndex > 11) return;
      const monthName = months[monthIndex];
      const amt = Number(t.amount) || 0;
      const typeStr = String(t.type || '').toLowerCase().trim();

      if (typeStr === 'income') {
        monthlyMap[monthName].income += amt;
      } else if (isActualExpenseTransaction(t)) {
        monthlyMap[monthName].expense += amt;
      }
    });
  }

  return months.map((m) => monthlyMap[m]);
};

/**
 * Filter transactions dataset by date range with safe string YYYY-MM-DD parsing
 */
export const filterTransactionsByDateRange = (transactions = [], dateRange = 'all') => {
  if (!Array.isArray(transactions)) return [];
  if (dateRange === 'all' || dateRange === 'all-time') return transactions;

  const now = new Date();
  const currentMonth = now.getMonth(); // 0 - 11
  const currentYear = now.getFullYear(); // YYYY

  return transactions.filter((t) => {
    if (!t.date) return false;

    let txMonth, txYear, txDay;
    if (typeof t.date === 'string' && t.date.includes('-')) {
      const parts = t.date.split('-').map(Number);
      if (parts.length >= 3 && !parts.some(isNaN)) {
        txYear = parts[0];
        txMonth = parts[1] - 1;
        txDay = parts[2];
      }
    }

    if (txMonth === undefined) {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return false;
      txMonth = d.getMonth();
      txYear = d.getFullYear();
      txDay = d.getDate();
    }

    if (dateRange === 'today') {
      return (
        txDay === now.getDate() &&
        txMonth === currentMonth &&
        txYear === currentYear
      );
    }

    if (dateRange === 'this-week') {
      const txDate = new Date(txYear, txMonth, txDay);
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      return txDate >= startOfWeek;
    }

    if (dateRange === 'this-month') {
      return (
        txMonth === currentMonth &&
        txYear === currentYear
      );
    }

    if (dateRange === 'last-month') {
      const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return (
        txMonth === targetMonth &&
        txYear === targetYear
      );
    }

    if (dateRange === 'this-year') {
      return txYear === currentYear;
    }

    return true;
  });
};

/**
 * Calculate percentage change between current and previous month
 */
export const calculatePercentageChange = (current = 0, previous = 0) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate monthly comparison for current vs previous month
 */
export const calculateMonthlyComparison = (transactions = []) => {
  const currentMonthTx = filterTransactionsByDateRange(transactions, 'this-month');
  const prevMonthTx = filterTransactionsByDateRange(transactions, 'last-month');

  const currentIncome = calculateTotalIncome(currentMonthTx);
  const currentExpense = calculateTotalExpense(currentMonthTx);
  const prevIncome = calculateTotalIncome(prevMonthTx);
  const prevExpense = calculateTotalExpense(prevMonthTx);

  return {
    incomeChange: calculatePercentageChange(currentIncome, prevIncome),
    expenseChange: calculatePercentageChange(currentExpense, prevExpense),
    savingsChange: calculatePercentageChange(
      currentIncome - currentExpense,
      prevIncome - prevExpense
    ),
  };
};

/**
 * Get top spending category
 */
export const getTopSpendingCategory = (transactions = [], categoriesList = []) => {
  const categoryTotals = {};
  if (Array.isArray(transactions)) {
    transactions.forEach((t) => {
      if (isActualExpenseTransaction(t)) {
        const amt = Number(t.amount) || 0;
        const catKey = String(t.category || 'others').toLowerCase().trim();
        categoryTotals[catKey] = (categoryTotals[catKey] || 0) + amt;
      }
    });
  }

  let topId = null;
  let maxAmount = 0;

  Object.entries(categoryTotals).forEach(([catId, amt]) => {
    if (amt > maxAmount) {
      maxAmount = amt;
      topId = catId;
    }
  });

  if (!topId) return null;

  const matchedCat = categoriesList.find((c) => String(c.id || '').toLowerCase().trim() === topId);
  return {
    id: topId,
    name: matchedCat?.name || topId,
    amount: maxAmount,
    color: matchedCat?.color || '#3b82f6',
    icon: matchedCat?.icon || 'ShoppingBag',
  };
};

// Aliases for backwards compatibility and semantic clarity
export const calculateIncome = calculateTotalIncome;
export const calculateExpense = calculateTotalExpense;
export const filterDailyExpensesByDateRange = filterTransactionsByDateRange;
export const filterItemsByDateRange = filterTransactionsByDateRange;
