// Stocks service

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
  CURRENCIES: ['USD', 'EUR', 'RUB', 'AZN', 'TRY', 'GBP'],
  INDICES: ['S&P 500', 'Nasdaq', 'Dow Jones', 'DAX 40', 'FTSE 100'],
  OIL: ['BRENT OIL', 'WTI OIL', 'GAS', 'GOLD'],
  TECH: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META'],
};

// Map languages to specific local symbols
export const LOCAL_SYMBOLS: Record<string, string[]> = {
  'ru': ['USD/RUB', 'EUR/RUB', 'SBER', 'GAZP', 'LKOH'], 
  'en': ['S&P 500', 'Nasdaq', 'Dow Jones', 'AAPL', 'MSFT'],
  'az': ['USD/AZN', 'EUR/AZN', 'RUB/AZN', 'BRENT OIL'], 
  'it': ['EWI', 'ENI', 'RACE', 'STLA', 'UCG'], // EWI is Italy ETF
};

export const DEFAULT_SYMBOLS = STOCK_CATEGORIES.CURRENCIES;

/**
 * Fetch Stock/Index data via Finnhub
 */
async function fetchFinnhub(symbol: string): Promise<StockQuote | null> {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) return null;

  // Map user-friendly names to Finnhub symbols for reliability
  const mapping: Record<string, string> = {
    'S&P 500': 'SPY',
    'Nasdaq': 'QQQ',
    'Dow Jones': 'DIA',
    'DAX 40': 'EWG', // US-listed ETF for DAX
    'FTSE 100': 'EWU',
    'Nikkei 225': 'EWJ',
    'EWI': 'EWI', // Italy ETF
    'BRENT OIL': 'OANDA:BCO_USD',
    'WTI OIL': 'OANDA:WTICO_USD',
    'GAS': 'OANDA:NATGAS_USD',
    'GOLD': 'OANDA:XAU_USD',
    'BTC': 'BINANCE:BTCUSDT', 
    'ETH': 'BINANCE:ETHUSDT',
    'ENI': 'E', // US-listed ADR for Eni
    'RACE': 'RACE', // NYSE
    'STLA': 'STLA', // NYSE
    'SBER': 'SBERP.ME', 
    'GAZP': 'GAZP.ME',
    'LKOH': 'LKOH.ME'
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
      provider: 'Markets'
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
    
    // We want pairs relative to USD as "stocks"
    const targets = ['EUR', 'RUB', 'AZN', 'TRY', 'GBP', 'CAD', 'JPY'];
    
    return targets.map(t => {
      const price = rates[t];
      return {
        symbol: ['AZN', 'RUB'].includes(t) ? `USD/${t}` : t,
        price: price,
        change: 0,
        percentChange: 0,
        high: price,
        low: price,
        open: price,
        prevClose: price,
        timestamp: data.time_last_updated * 1000,
        provider: 'Forex'
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
  const containsCurrency = symbols.some(s => 
    STOCK_CATEGORIES.CURRENCIES.includes(s) || 
    s.includes('/') || 
    ['AZN', 'RUB'].includes(s)
  );
  
  let results: StockQuote[] = [];

  // Special handling for currencies - much more reliable than Finnhub free
  if (containsCurrency) {
    const currs = await fetchCurrencies();
    results.push(...currs.filter(c => 
      symbols.includes(c.symbol.replace('USD/', '')) || 
      symbols.includes(c.symbol) ||
      (c.symbol === 'USD/AZN' && symbols.includes('AZN'))
    ));
  }

  // Fetch others via Finnhub
  const otherSymbols = symbols.filter(s => 
    !STOCK_CATEGORIES.CURRENCIES.includes(s) && 
    !s.includes('/') && 
    !['AZN', 'RUB'].includes(s)
  );
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
  } catch (error) {
    console.warn('LocalStorage error in cacheStocks:', error);
  }
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
