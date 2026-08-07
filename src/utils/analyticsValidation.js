/**
 * Sanitizes input values to prevent zero division and invalid numerical errors
 */
export const sanitizeAmount = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

export const safePercentage = (numerator, denominator) => {
  const num = sanitizeAmount(numerator);
  const den = sanitizeAmount(denominator);
  if (den === 0) return 0;
  return (num / den) * 100;
};

export const sanitizeTransactions = (transactions) => {
  if (!Array.isArray(transactions)) return [];
  return transactions.filter(
    (t) => t && typeof t === 'object' && t.amount !== undefined && !isNaN(Number(t.amount))
  );
};
