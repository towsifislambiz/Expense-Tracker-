import { sanitizeAmount, safePercentage, sanitizeTransactions } from './analyticsValidation';

/**
 * Calculate financial health score (0 - 100) based on 4 key factors:
 * - Savings Rate (40%)
 * - Budget Adherence (30%)
 * - Expense Ratio (20%)
 * - Ledger Consistency (10%)
 */
export const calculateFinancialHealthScore = (transactions = [], budgets = []) => {
  const safeTx = sanitizeTransactions(transactions);
  let totalIncome = 0;
  let totalExpense = 0;

  safeTx.forEach((t) => {
    const amt = sanitizeAmount(t.amount);
    const type = String(t.type || '').toLowerCase().trim();
    if (type === 'income') totalIncome += amt;
    if (type === 'expense') totalExpense += amt;
  });

  const netSavings = totalIncome - totalExpense;

  // Factor 1: Savings Rate (max 40 pts)
  // Target savings rate = 50% for 40 pts, linear scale
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const savingsScore = Math.min(40, Math.max(0, (savingsRate / 50) * 40));

  // Factor 2: Budget Adherence (max 30 pts)
  let budgetScore = 30;
  if (Array.isArray(budgets) && budgets.length > 0) {
    let exceededCount = 0;
    budgets.forEach((b) => {
      let spent = 0;
      if (b.type === 'category') {
        spent = safeTx
          .filter(
            (t) =>
              String(t.type || '').toLowerCase().trim() === 'expense' &&
              String(t.category || '').toLowerCase().trim() === String(b.category || '').toLowerCase().trim()
          )
          .reduce((sum, t) => sum + sanitizeAmount(t.amount), 0);
      } else {
        spent = totalExpense;
      }
      if (b.amount > 0 && spent > b.amount) {
        exceededCount++;
      }
    });
    const penalty = exceededCount * 10;
    budgetScore = Math.max(0, 30 - penalty);
  }

  // Factor 3: Expense Ratio (max 20 pts)
  // Lower expense ratio is healthier
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;
  const expenseScore = Math.min(20, Math.max(0, ((100 - expenseRatio) / 100) * 20));

  // Factor 4: Ledger Consistency (max 10 pts)
  const consistencyScore = safeTx.length > 0 ? 10 : 0;

  const totalScore = Math.min(100, Math.round(savingsScore + budgetScore + expenseScore + consistencyScore));

  let rating = 'Needs Improvement';
  if (totalScore >= 80) rating = 'Excellent';
  else if (totalScore >= 60) rating = 'Good';

  return {
    score: totalScore,
    rating,
    breakdown: {
      savingsScore: Math.round(savingsScore),
      budgetScore: Math.round(budgetScore),
      expenseScore: Math.round(expenseScore),
      consistencyScore: Math.round(consistencyScore),
    },
  };
};

/**
 * Income Breakdown by Category / Source
 */
export const calculateIncomeBreakdown = (transactions = []) => {
  const safeTx = sanitizeTransactions(transactions);
  const sources = {};
  let totalIncome = 0;

  safeTx.forEach((t) => {
    if (String(t.type || '').toLowerCase().trim() === 'income') {
      const amt = sanitizeAmount(t.amount);
      const cat = String(t.category || 'salary').toLowerCase().trim();
      sources[cat] = (sources[cat] || 0) + amt;
      totalIncome += amt;
    }
  });

  return Object.entries(sources).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
  }));
};

/**
 * Expense Breakdown by Category
 */
export const calculateExpenseBreakdown = (transactions = []) => {
  const safeTx = sanitizeTransactions(transactions);
  const categoriesMap = {};
  let totalExpense = 0;

  safeTx.forEach((t) => {
    if (String(t.type || '').toLowerCase().trim() === 'expense') {
      const amt = sanitizeAmount(t.amount);
      const cat = String(t.category || 'others').toLowerCase().trim();
      categoriesMap[cat] = (categoriesMap[cat] || 0) + amt;
      totalExpense += amt;
    }
  });

  return Object.entries(categoriesMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
  }));
};

/**
 * Spending trend over 6 months
 */
export const calculateSpendingTrend = (transactions = []) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const map = {};

  months.forEach((m) => {
    map[m] = { month: m, amount: 0 };
  });

  sanitizeTransactions(transactions).forEach((t) => {
    if (String(t.type || '').toLowerCase().trim() === 'expense' && t.date) {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const mName = months[d.getMonth()];
        map[mName].amount += sanitizeAmount(t.amount);
      }
    }
  });

  return months.map((m) => map[m]);
};

/**
 * Month-over-Month Comparison
 */
export const calculateMonthComparison = (currentTx = [], prevTx = []) => {
  let currIncome = 0, currExpense = 0;
  let prevIncome = 0, prevExpense = 0;

  sanitizeTransactions(currentTx).forEach((t) => {
    const type = String(t.type || '').toLowerCase().trim();
    if (type === 'income') currIncome += sanitizeAmount(t.amount);
    if (type === 'expense') currExpense += sanitizeAmount(t.amount);
  });

  sanitizeTransactions(prevTx).forEach((t) => {
    const type = String(t.type || '').toLowerCase().trim();
    if (type === 'income') prevIncome += sanitizeAmount(t.amount);
    if (type === 'expense') prevExpense += sanitizeAmount(t.amount);
  });

  const incomeChange = prevIncome > 0 ? ((currIncome - prevIncome) / prevIncome) * 100 : (currIncome > 0 ? 100 : 0);
  const expenseChange = prevExpense > 0 ? ((currExpense - prevExpense) / prevExpense) * 100 : (currExpense > 0 ? 100 : 0);
  const savingsChange = (currIncome - currExpense) - (prevIncome - prevExpense);

  return {
    currIncome,
    currExpense,
    prevIncome,
    prevExpense,
    incomeChange,
    expenseChange,
    savingsChange,
  };
};
