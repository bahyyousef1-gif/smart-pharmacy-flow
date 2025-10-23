import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<string>('EGP');
  
  const getCurrencySymbol = (curr: string) => {
    const symbols: { [key: string]: string } = {
      'EGP': 'E£',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[curr] || curr;
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      currencySymbol: getCurrencySymbol(currency),
      formatCurrency, 
      setCurrency 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
