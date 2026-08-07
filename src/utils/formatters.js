/**
 * Format currency value with symbol and custom conversion rate
 */
export const formatCurrency = (amount, currency = { symbol: '$', rate: 1, code: 'USD' }) => {
  const converted = (amount || 0) * (currency.rate || 1);
  const decimals = currency.code === 'JPY' ? 0 : 2;
  
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted);

  return `${currency.symbol}${formattedNumber}`;
};

/**
 * Format numbers cleanly (e.g. 1.2k, 1.5M)
 */
export const formatCompactNumber = (amount) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount || 0);
};

/**
 * Format relative dates or standard readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(date);
};

/**
 * Format percentage string with sign indicator
 */
export const formatPercent = (val) => {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
};
