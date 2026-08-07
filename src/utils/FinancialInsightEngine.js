import { calculateMonthComparison, calculateFinancialHealthScore } from './reportCalculations';

export const generateSmartInsights = (transactions = [], budgets = []) => {
  if (!transactions || transactions.length === 0) {
    return [
      {
        id: 'no-data',
        type: 'info',
        title: 'Get Started with Ledger Insights',
        message: 'Add income and expense transactions to generate real-time AI spending insights.',
      },
    ];
  }

  const insights = [];
  const health = calculateFinancialHealthScore(transactions, budgets);

  // Health Score Insight
  if (health.score >= 80) {
    insights.push({
      id: 'health-excellent',
      type: 'success',
      title: 'Strong Financial Position',
      message: `Your financial health score is ${health.score}/100. Excellent job maintaining a strong savings margin.`,
    });
  } else if (health.score < 60) {
    insights.push({
      id: 'health-warning',
      type: 'warning',
      title: 'Health Score Alert',
      message: `Your financial health score is ${health.score}/100. Consider reducing non-essential category expenses.`,
    });
  }

  // Budget Warnings
  if (Array.isArray(budgets)) {
    budgets.forEach((b) => {
      if (b.type === 'category') {
        const spent = transactions
          .filter(
            (t) =>
              String(t.type || '').toLowerCase().trim() === 'expense' &&
              String(t.category || '').toLowerCase().trim() === String(b.category || '').toLowerCase().trim()
          )
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        if (b.amount > 0 && spent >= b.amount) {
          insights.push({
            id: `budget-exceeded-${b.id}`,
            type: 'danger',
            title: `Exceeded ${b.name}`,
            message: `You have spent $${spent.toLocaleString()} which exceeds your $${b.amount.toLocaleString()} budget limit.`,
          });
        }
      }
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'steady-ledger',
      type: 'info',
      title: 'Stable Ledger',
      message: 'Your spending pattern is balanced. Keep logging daily items to track net wealth growth.',
    });
  }

  return insights;
};
