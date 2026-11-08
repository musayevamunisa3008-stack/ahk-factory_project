import React, { createContext, useContext, useState } from 'react';
import { useLanguage } from './LanguageContext';

const CurrencyContext = createContext(null);

export const EXCHANGE_RATE_USD = 12800; // 1 USD = 12,800 UZS

export const CurrencyProvider = ({ children }) => {
  const { lang } = useLanguage();
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('ahk_factory_currency') || localStorage.getItem('manufaktura_currency') || 'UZS';
  });

  const setCurrency = (c) => {
    if (c === 'UZS' || c === 'USD') {
      setCurrencyState(c);
      localStorage.setItem('ahk_factory_currency', c);
    }
  };

  const getCurrencySymbol = () => {
    if (currency === 'USD') return '$';
    if (lang === 'uz') return "so'm";
    if (lang === 'tr') return 'UZS';
    if (lang === 'en') return 'UZS';
    return 'сум';
  };

  const formatPrice = (amountInUZS) => {
    if (amountInUZS === null || amountInUZS === undefined || isNaN(amountInUZS)) {
      return '0';
    }

    if (currency === 'USD') {
      const dollars = Math.round(amountInUZS / EXCHANGE_RATE_USD);
      return `$${dollars.toLocaleString('en-US')}`;
    }

    // UZS
    const formatted = Math.round(amountInUZS).toLocaleString('ru-RU');
    return `${formatted} ${getCurrencySymbol()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        getCurrencySymbol,
        exchangeRate: EXCHANGE_RATE_USD
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
