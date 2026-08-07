/**
 * Reusable Category Forecast & Day Analytics Helpers
 */

/**
 * Calculates a realistic month-end forecast using a weighted blend between
 * actual burn velocity and budget limit pace to prevent early-month single-purchase spikes.
 */
export const calculateCategoryForecast = (catTxs = [], budgetLimit = 0, daysPassed = 1, totalDaysInMonth = 30) => {
  const itemCount = Array.isArray(catTxs) ? catTxs.length : 0;
  const spent = (catTxs || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // 1. Empty state: No spending recorded yet
  if (itemCount === 0 || spent === 0) {
    return {
      projectedMonthEnd: 0,
      isProjectedOver: false,
      statusLabel: 'No Spending History',
      statusType: 'empty', // 'empty' | 'gathering' | 'on-track' | 'overspend'
    };
  }

  // 2. Insufficient sample size (fewer than 2 transactions or first 2 days of month)
  if (itemCount < 2 && daysPassed <= 3) {
    // Blended forecast: Weight actual spend with remaining budget pace
    const actualVelocity = spent / daysPassed;
    const budgetDailyPace = budgetLimit > 0 ? budgetLimit / totalDaysInMonth : actualVelocity;
    
    // 30% weight on actual, 70% weight on budget pace during initial 3 days
    const blendedVelocity = actualVelocity * 0.3 + budgetDailyPace * 0.7;
    const projectedMonthEnd = Math.round(blendedVelocity * totalDaysInMonth);
    const isProjectedOver = budgetLimit > 0 && projectedMonthEnd > budgetLimit * 1.05;

    return {
      projectedMonthEnd,
      isProjectedOver,
      statusLabel: 'Gathering Data',
      statusType: 'gathering',
    };
  }

  // 3. Established spending history: Weighted moving burn rate
  const rawVelocity = spent / daysPassed;
  // Dampen extreme spikes if a single expense represents >80% of total category spent
  const maxSingleTx = Math.max(...catTxs.map((t) => Number(t.amount) || 0));
  const isSingleSpike = itemCount <= 3 && maxSingleTx > spent * 0.75;

  let effectiveVelocity = rawVelocity;
  if (isSingleSpike && daysPassed < totalDaysInMonth * 0.5) {
    // Exclude the anomaly spike from daily burn rate extrapolation
    const baselineSpent = spent - maxSingleTx;
    const baselineVelocity = daysPassed > 1 ? baselineSpent / (daysPassed - 1) : 0;
    effectiveVelocity = maxSingleTx / totalDaysInMonth + baselineVelocity;
  }

  const projectedMonthEnd = Math.round(effectiveVelocity * totalDaysInMonth);
  const isProjectedOver = budgetLimit > 0 && projectedMonthEnd > budgetLimit * 1.02;

  return {
    projectedMonthEnd,
    isProjectedOver,
    statusLabel: isProjectedOver ? 'Projected Overspend' : 'On Track',
    statusType: isProjectedOver ? 'overspend' : 'on-track',
  };
};

/**
 * Calculates category-specific highest spending day and lowest spending day
 */
export const calculateCategoryDayPeaks = (catTxs = []) => {
  if (!Array.isArray(catTxs) || catTxs.length === 0) {
    return {
      highestDay: { date: 'None', amount: 0 },
      lowestDay: { date: 'None', amount: 0 },
      lastExpenseItem: null,
    };
  }

  const dayTotals = {};
  let lastExpenseItem = null;

  catTxs.forEach((t) => {
    if (t.date) {
      const dStr = String(t.date).split('T')[0];
      const amt = Number(t.amount) || 0;
      dayTotals[dStr] = (dayTotals[dStr] || 0) + amt;

      const tDate = new Date(t.updatedAt || t.date);
      if (!lastExpenseItem || tDate > lastExpenseItem.dateObj) {
        lastExpenseItem = {
          title: t.title || 'Expense',
          amount: amt,
          dateObj: tDate,
        };
      }
    }
  });

  const dayEntries = Object.entries(dayTotals);
  if (dayEntries.length === 0) {
    return {
      highestDay: { date: 'None', amount: 0 },
      lowestDay: { date: 'None', amount: 0 },
      lastExpenseItem: null,
    };
  }

  dayEntries.sort((a, b) => b[1] - a[1]);

  const formatDate = (isoStr) => {
    if (!isoStr) return 'None';
    try {
      const cleanStr = String(isoStr).split('T')[0];
      const parts = cleanStr.split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = months[parts[1] - 1] || '';
        return `${monthName} ${parts[2]}`;
      }
      return cleanStr;
    } catch (e) {
      return String(isoStr);
    }
  };

  const highestDay = {
    date: formatDate(dayEntries[0][0]),
    amount: dayEntries[0][1],
  };

  const lowestDay = {
    date: formatDate(dayEntries[dayEntries.length - 1][0]),
    amount: dayEntries[dayEntries.length - 1][1],
  };

  return {
    highestDay,
    lowestDay,
    lastExpenseItem,
  };
};

/**
 * Returns severity level badges based on Budget Utilization %
 * 0-85%: Normal, 85-100%: Warning, 100-110%: Warning 100%+, 110-130%: High Risk, 130%+: Critical
 */
export const getOverspendSeverity = (pctUsed = 0) => {
  if (pctUsed >= 130) {
    return {
      label: 'Critical 130%+',
      badgeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold',
      progressGrad: 'from-rose-600 to-pink-600',
    };
  }
  if (pctUsed >= 110) {
    return {
      label: 'High Risk 110%+',
      badgeStyle: 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-bold',
      progressGrad: 'from-orange-500 to-amber-500',
    };
  }
  if (pctUsed >= 100) {
    return {
      label: 'Warning 100%+',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
      progressGrad: 'from-amber-500 to-yellow-500',
    };
  }
  if (pctUsed >= 85) {
    return {
      label: 'Near Limit 85%',
      badgeStyle: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 font-semibold',
      progressGrad: 'from-yellow-500 to-amber-400',
    };
  }
  return {
    label: 'Normal',
    badgeStyle: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold',
    progressGrad: 'from-emerald-500 to-teal-500',
  };
};
