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

export const shareContent = async (data: { title: string; text: string; url: string }) => {
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(data.url);
      return 'copied';
    }
    return 'shared';
  } catch (e) {
    console.error('Error sharing:', e);
    return 'error';
  }
};
