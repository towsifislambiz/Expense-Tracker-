import { getCurrencyByCode } from '../constants/currencies';

/**
 * Format numerical amount into localized currency string with clean decimal precision handling.
 * @param {number|string} amount - Numerical value
 * @param {string} currencyCode - ISO Currency Code (e.g. 'USD', 'BDT')
 * @param {string} formatStyle - 'international' | 'compact' | 'integer'
 */
export const formatCurrency = (amount, currencyCode = 'USD', formatStyle = 'international') => {
  const num = Number(amount);
  const safeAmount = isNaN(num) ? 0 : num;
  const currencyObj = getCurrencyByCode(currencyCode);
  const symbol = currencyObj.symbol || '৳';

  if (formatStyle === 'compact') {
    const compactStr = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(safeAmount);
    return `${symbol}${compactStr}`;
  }

  // If integer format style or if the amount is a whole number (e.g. 15700 vs 15700.50)
  const isWholeNumber = Math.abs(safeAmount % 1) < 0.001;
  const showDecimals = formatStyle !== 'integer' && !isWholeNumber;

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(showDecimals ? safeAmount : Math.round(safeAmount));

  return `${symbol}${formattedNum}`;
};
