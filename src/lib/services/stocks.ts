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
}

const CACHE_KEY = 'stocks_data_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const STOCK_CATEGORIES = {
  STOCKS: ['AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META'],
  CRYPTO: ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:SOLUSDT', 'BINANCE:BNBUSDT'],
  FOREX: ['OANDA:EUR_USD', 'OANDA:GBP_USD', 'FX:USDTRY', 'FX:USDAZN'],
  ETF: ['SPY', 'QQQ', 'VTI', 'ARKK']
};

export const DEFAULT_SYMBOLS = [...STOCK_CATEGORIES.STOCKS.slice(0, 3), ...STOCK_CATEGORIES.CRYPTO.slice(0, 1), ...STOCK_CATEGORIES.FOREX.slice(0, 2)];

/**
 * Fetch stock quote for a single symbol
 */
async function fetchQuote(symbol: string, apiKey: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Finnhub returns 0 for price if symbol is invalid or not found
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
      timestamp: data.t * 1000 // Convert to ms
    };
  } catch (error) {
    logger.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch quotes for multiple symbols
 */
export async function fetchStocks(symbols: string[] = DEFAULT_SYMBOLS): Promise<StockQuote[]> {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) {
    logger.error('Finnhub API key is missing');
    return getCachedStocks() || [];
  }

  try {
    const quotes = await Promise.all(symbols.map(s => fetchQuote(s, apiKey)));
    const validQuotes = quotes.filter((q): q is StockQuote => q !== null);
    
    if (validQuotes.length > 0) {
      cacheStocks(validQuotes);
    }
    
    return validQuotes;
  } catch (error) {
    logger.error('Error in fetchStocks:', error);
    return getCachedStocks() || [];
  }
}

function cacheStocks(quotes: StockQuote[]) {
  try {
    const cacheData = {
      quotes,
      expiry: Date.now() + CACHE_TTL
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    // ignore
  }
}

export function getCachedStocks(): StockQuote[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { quotes, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) {
      return null; // Expired, but we might still return it if network fails
    }
    
    return quotes;
  } catch (error) {
    return null;
  }
}
