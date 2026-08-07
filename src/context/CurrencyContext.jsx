import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENCIES, getCurrencyByCode } from '../constants/currencies';
import { formatCurrency as formatCurrencyUtil } from '../utils/currencyFormatter';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCodeState] = useState(() => {
    return localStorage.getItem('luxe_setting_currency') || 'USD';
  });

  const currencyObj = getCurrencyByCode(currencyCode);

  useEffect(() => {
    localStorage.setItem('luxe_setting_currency', currencyCode);
  }, [currencyCode]);

  const changeCurrency = (code) => {
    const found = getCurrencyByCode(code);
    if (found) {
      setCurrencyCodeState(found.code);
    }
  };

  const formatMoney = (amount) => {
    return formatCurrencyUtil(amount, currencyCode);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency: currencyObj,
        currencyCode,
        changeCurrency,
        currencies: CURRENCIES,
        formatMoney,
        formatCurrency: formatMoney,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
