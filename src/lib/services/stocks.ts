import { logger } from '../utils/logger';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: number;
  provider?: string;
}

const CACHE_KEY = 'stocks_data_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const STOCK_CATEGORIES = {
  CURRENCIES: ['USD', 'EUR', 'RUB', 'AZN', 'TRY', 'GBP', 'CAD', 'JPY'],
  INDICES: ['S&P 500', 'Nasdaq', 'Dow Jones', 'FTSE 100', 'Nikkei 225'],
  TECH: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META'],
  MARKETS: ['GOLD', 'BRENT OIL', 'BTC', 'ETH'],
};

// Map languages to specific local symbols
export const LOCAL_SYMBOLS: Record<string, string[]> = {
  'ru': ['SBER', 'GAZP', 'LKOH', 'YNDX', 'ROSN'], 
  'en': ['AAPL', 'MSFT', 'AMZN'],
  'az': ['USD/AZN', 'EUR/AZN', 'RUB/AZN'], 
};

export const DEFAULT_SYMBOLS = STOCK_CATEGORIES.CURRENCIES;

/**
 * Fetch Stock/Index data via Finnhub
 */
async function fetchFinnhub(symbol: string): Promise<StockQuote | null> {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) return null;

  // Map user-friendly names to Finnhub symbols for INDICES and TECH
  const mapping: Record<string, string> = {
    'S&P 500': 'SPY',
    'Nasdaq': 'QQQ',
    'Dow Jones': 'DIA',
    'AAPL': 'AAPL', 'MSFT': 'MSFT', 'NVDA': 'NVDA', 'TSLA': 'TSLA', 'AMZN': 'AMZN', 'GOOGL': 'GOOGL', 'META': 'META',
    'BTC': 'BINANCE:BTCUSDT', 'ETH': 'BINANCE:ETHUSDT',
    'SBER': 'SBER', 'GAZP': 'GAZP', 'LKOH': 'LKOH', 'YNDX': 'YNDX', 'ROSN': 'ROSN'
  };

  const s = mapping[symbol] || symbol;

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${apiKey}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.c) return null;

    return {
      symbol,
      price: data.c,
      change: data.d,
      percentChange: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      prevClose: data.pc,
      timestamp: data.t * 1000,
      provider: 'Finnhub'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Fetch Currencies via a truly free API (ExchangeRate-API)
 */
async function fetchCurrencies(): Promise<StockQuote[]> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) return [];
    const data = await res.json();
    const rates = data.rates;
    const base = 'USD';
    
    // We want pairs relative to USD as "stocks"
    const targets = ['EUR', 'RUB', 'AZN', 'TRY', 'GBP', 'CAD', 'JPY'];
    
    return targets.map(t => {
      const price = rates[t];
      // Since this API doesn't give 24h change directly, we'll estimate or just show price
      // For a real dashboard, we'd fetch yesterday's rate too, but let's keep it simple for now
      return {
        symbol: t === 'AZN' ? 'USD/AZN' : t,
        price: price,
        change: 0,
        percentChange: 0,
        high: price,
        low: price,
        open: price,
        prevClose: price,
        timestamp: data.time_last_updated * 1000,
        provider: 'ExRate'
      };
    });
  } catch (e) {
    return [];
  }
}

/**
 * Public API
 */
export async function fetchStocks(symbols: string[] = DEFAULT_SYMBOLS): Promise<StockQuote[]> {
  const containsCurrency = symbols.some(s => STOCK_CATEGORIES.CURRENCIES.includes(s) || s.includes('AZN'));
  
  let results: StockQuote[] = [];

  // Special handling for currencies - much more reliable than Finnhub free
  if (containsCurrency) {
    const currs = await fetchCurrencies();
    results.push(...currs.filter(c => symbols.includes(c.symbol.replace('USD/', '')) || symbols.includes(c.symbol)));
  }

  // Fetch others via Finnhub
  const otherSymbols = symbols.filter(s => !STOCK_CATEGORIES.CURRENCIES.includes(s) && !s.includes('AZN'));
  if (otherSymbols.length > 0) {
    const finnhubResults = await Promise.all(otherSymbols.map(s => fetchFinnhub(s)));
    results.push(...finnhubResults.filter((r): r is StockQuote => r !== null));
  }

  if (results.length > 0) {
    cacheStocks(results);
  } else {
    return getCachedStocks() || [];
  }

  return results;
}

function cacheStocks(quotes: StockQuote[]) {
  try {
    const cacheData = {
      quotes,
      expiry: Date.now() + CACHE_TTL
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {}
}

export function getCachedStocks(): StockQuote[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { quotes } = JSON.parse(cached);
    return quotes;
  } catch (error) {
    return null;
  }
}
