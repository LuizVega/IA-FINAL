import { AppSettings } from '../types';

export const getCurrencySymbol = (currency?: string) => {
  switch (currency) {
    case 'PEN': return 'S/';
    case 'USD': return '$';
    case 'MXN': return '$';
    case 'ARS': return '$';
    case 'CLP': return '$';
    case 'COP': return '$';
    case 'BOB': return 'Bs.';
    case 'BRL': return 'R$';
    case 'EUR': return '€';
    default: return '$';
  }
};

export const formatPrice = (price: number, currency?: string) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol} ${price.toFixed(2)}`;
};
