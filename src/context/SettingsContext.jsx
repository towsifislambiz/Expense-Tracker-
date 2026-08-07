import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { CURRENCIES, getCurrencyByCode } from '../constants/currencies';
import { formatCurrency as formatCurrencyUtil } from '../utils/currencyFormatter';
import {
  getUserSettings,
  updateUserSettings,
  getNotificationPreferences,
  updateNotificationPreferences
} from '../services/firestore/settingsService';

const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Settings State with LocalStorage Fallback
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('luxe_setting_currency') || 'USD';
  });

  const [dateFormat, setDateFormatState] = useState(() => {
    return localStorage.getItem('luxe_setting_dateformat') || 'MM/DD/YYYY';
  });

  const [numberFormat, setNumberFormatState] = useState(() => {
    return localStorage.getItem('luxe_setting_numberformat') || 'international';
  });

  const [notifications, setNotificationsState] = useState(() => {
    const saved = localStorage.getItem('luxe_setting_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      budgetAlert: true,
      monthlyReport: true,
      savingReminder: false,
      transactionReminder: true,
    };
  });

  // Derived Currency Object & Symbol
  const activeCurrencyObj = getCurrencyByCode(currency);
  const currencySymbol = activeCurrencyObj.symbol;

  // Background Firestore Sync on Auth Change
  useEffect(() => {
    if (!currentUser) return;

    const loadSettings = async () => {
      const dbSettings = await getUserSettings(currentUser.uid);
      if (dbSettings) {
        if (dbSettings.currency) setCurrencyState(dbSettings.currency);
        if (dbSettings.dateFormat) setDateFormatState(dbSettings.dateFormat);
        if (dbSettings.numberFormat) setNumberFormatState(dbSettings.numberFormat);
      }

      const dbNotifs = await getNotificationPreferences(currentUser.uid);
      if (dbNotifs) {
        setNotificationsState(dbNotifs);
      }
    };

    loadSettings();
  }, [currentUser]);

  // Updates & Sync Handlers
  const setCurrency = (code) => {
    setCurrencyState(code);
    localStorage.setItem('luxe_setting_currency', code);
    if (currentUser) {
      const currObj = getCurrencyByCode(code);
      updateUserSettings(currentUser.uid, {
        currency: code,
        currencySymbol: currObj.symbol,
        dateFormat,
        numberFormat,
      });
    }
  };

  const setDateFormat = (val) => {
    setDateFormatState(val);
    localStorage.setItem('luxe_setting_dateformat', val);
    if (currentUser) {
      updateUserSettings(currentUser.uid, {
        currency,
        currencySymbol,
        dateFormat: val,
        numberFormat,
      });
    }
  };

  const setNumberFormat = (val) => {
    setNumberFormatState(val);
    localStorage.setItem('luxe_setting_numberformat', val);
    if (currentUser) {
      updateUserSettings(currentUser.uid, {
        currency,
        currencySymbol,
        dateFormat,
        numberFormat: val,
      });
    }
  };

  const setNotifications = (newNotifs) => {
    setNotificationsState(newNotifs);
    localStorage.setItem('luxe_setting_notifications', JSON.stringify(newNotifs));
    if (currentUser) {
      updateNotificationPreferences(currentUser.uid, newNotifs);
    }
  };

  // Reusable Formatter Helpers
  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, currency, numberFormat);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (dateFormat === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
    if (dateFormat === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
    return `${month}/${day}/${year}`; // MM/DD/YYYY default
  };

  return (
    <SettingsContext.Provider
      value={{
        currency,
        currencySymbol,
        activeCurrencyObj,
        setCurrency,
        dateFormat,
        setDateFormat,
        numberFormat,
        setNumberFormat,
        notifications,
        setNotifications,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
