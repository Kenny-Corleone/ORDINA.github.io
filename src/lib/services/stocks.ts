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

// Basic symbols available on most free tiers
export const STOCK_CATEGORIES = {
  CURRENCIES: ['OANDA:EUR_USD', 'OANDA:GBP_USD', 'OANDA:USD_JPY', 'OANDA:USD_AZN', 'OANDA:USD_TRY', 'OANDA:USD_CAD'],
  INDICES: ['^GSPC', '^IXIC', '^DJI', '^FTSE', '^N225'],
  TECH: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META'],
  MARKETS: ['SPY', 'QQQ', 'OANDA:XAU_USD', 'OANDA:BCO_USD', 'BINANCE:BTCUSDT'],
};

// Map languages to specific local symbols
export const LOCAL_SYMBOLS: Record<string, string[]> = {
  'ru': ['MCX:SBER', 'MCX:GAZP', 'MCX:LKOH', 'MCX:YNDX'], // Moscow Exchange
  'en': ['AAPL', 'MSFT', 'AMZN'],
};

export const DEFAULT_SYMBOLS = STOCK_CATEGORIES.CURRENCIES;

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
