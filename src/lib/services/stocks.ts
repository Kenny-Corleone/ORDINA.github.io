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

const CACHE_KEY = 'stocks_data_cache_v2';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const STOCK_CATEGORIES = {
  CURRENCIES: ['USD', 'EUR', 'RUB', 'AZN', 'TRY', 'GBP'],
  INDICES: ['S&P 500', 'Nasdaq', 'Dow Jones', 'FTSE 100', 'Nikkei 225'],
  OIL: ['BRENT OIL', 'WTI OIL', 'GAS', 'GOLD'],
  TECH: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META'],
};

export const LOCAL_SYMBOLS: Record<string, string[]> = {
  'ru': ['IMOEX', 'SBER', 'GAZP', 'LKOH', 'YNDX', 'ROSN', 'MGNT'], // Moscow Exchange
  'it': ['RACE', 'ENI', 'STLA', 'UCG', 'ISP', 'ENEL'], // Ferrari, Eni, Stellantis, Unicredit, Intesa, Enel
  'az': ['BRENT OIL', 'GOLD', 'GAS', 'S&P 500'], // Relevant for Baku investors
  'en': ['S&P 500', 'Nasdaq', 'AAPL', 'MSFT', 'NVDA', 'AMZN'],
};

export const DEFAULT_SYMBOLS = STOCK_CATEGORIES.CURRENCIES;

/**
 * MOEX ISS API for Russian Stocks & Indices
 */
async function fetchMoEx(ticker: string): Promise<StockQuote | null> {
  try {
    const isIndex = ticker === 'IMOEX';
    const engine = isIndex ? 'stock' : 'stock';
    const market = isIndex ? 'index' : 'shares';
    const board = isIndex ? 'SNDX' : 'TQBR';
    
    const url = `https://iss.moex.com/iss/engines/${engine}/markets/${market}/boards/${board}/securities/${ticker}.json?iss.meta=off&iss.only=marketdata,securities`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    
    const marketData = data.marketdata.data[0];
    const securityData = data.securities.data[0];
    
    if (!marketData || !securityData) return null;

    // IMOEX index or Stock
    const priceIdx = isIndex ? 12 : 12; // LAST value
    const changeIdx = isIndex ? 25 : 25;
    const pctChangeIdx = isIndex ? 26 : 26;

    const last = marketData[priceIdx] || marketData[isIndex ? 50 : 50]; 
    const change = marketData[changeIdx] || 0;
    const pctChange = marketData[pctChangeIdx] || 0;

    return {
      symbol: ticker,
      price: last,
      change: change,
      percentChange: pctChange,
      high: marketData[14] || last,
      low: marketData[15] || last,
      open: marketData[9] || last,
      prevClose: last - change,
      timestamp: Date.now(),
      provider: 'MoEx'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Yahoo Finance via CORS Proxy for International Stocks (IT, etc.)
 */
async function fetchYahoo(ticker: string, suffix: string = ''): Promise<StockQuote | null> {
  const fullTicker = suffix ? `${ticker}${suffix}` : ticker;
  try {
    const proxy = 'https://corsproxy.io/?';
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${fullTicker}?interval=1d&range=1d`;
    const response = await fetch(proxy + encodeURIComponent(yahooUrl));
    if (!response.ok) return null;
    const data = await response.json();
    
    const meta = data.chart.result[0].meta;
    return {
      symbol: ticker,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      percentChange: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      high: meta.dayHigh,
      low: meta.dayLow,
      open: meta.regularMarketOpen,
      prevClose: meta.previousClose,
      timestamp: meta.regularMarketTime * 1000,
      provider: 'Yahoo'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Finnhub for US/Indices/Crypto
 */
async function fetchFinnhub(symbol: string): Promise<StockQuote | null> {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) return null;

  const mapping: Record<string, string> = {
    'S&P 500': 'SPY', 'Nasdaq': 'QQQ', 'Dow Jones': 'DIA',
    'FTSE 100': 'EWU', 'Nikkei 225': 'EWJ',
    'BRENT OIL': 'OANDA:BCO_USD', 'WTI OIL': 'OANDA:WTICO_USD',
    'GAS': 'OANDA:NATGAS_USD', 'GOLD': 'OANDA:XAU_USD',
    'BTC': 'BINANCE:BTCUSDT', 'ETH': 'BINANCE:ETHUSDT'
  };

  const s = mapping[symbol] || symbol;
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${apiKey}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.c || data.c === 0) return null;

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
  } catch (e) { return null; }
}

/**
 * Truly free Currency API
 */
async function fetchCurrencies(): Promise<StockQuote[]> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) return [];
    const data = await res.json();
    const rates = data.rates;
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
  } catch (e) { return []; }
}

/**
 * Master Dispatcher
 */
export async function fetchStocks(symbols: string[] = DEFAULT_SYMBOLS): Promise<StockQuote[]> {
  const ruTickers = LOCAL_SYMBOLS['ru'] || [];
  const itTickers = LOCAL_SYMBOLS['it'] || [];
  
  const results: StockQuote[] = [];

  // 1. Currencies
  const currsNeeded = symbols.filter(s => STOCK_CATEGORIES.CURRENCIES.includes(s) || s.includes('/AZN') || s.includes('/RUB'));
  if (currsNeeded.length > 0) {
    const rates = await fetchCurrencies();
    results.push(...rates.filter(r => {
      const part = r.symbol.split('/')[1];
      return symbols.includes(r.symbol) || (part && symbols.includes(part));
    }));
  }

  // 2. Specialized Fetchers
  const promises = symbols.map(async (s) => {
    // Skip if already handled by currency
    if (results.find(r => r.symbol === s)) return null;

    // RU Stocks -> MoEx
    if (ruTickers && ruTickers.includes(s)) return fetchMoEx(s);
    
    // IT Stocks -> Yahoo (.MI suffix)
    if (itTickers && itTickers.includes(s)) return fetchYahoo(s, '.MI');
    
    // Indices/Tech/Energy -> Finnhub
    return fetchFinnhub(s);
  });

  const resolved = await Promise.all(promises);
  results.push(...resolved.filter((r): r is StockQuote => r !== null));

  // Dedupe
  const final = Array.from(new Map(results.map(item => [item.symbol, item])).values());
  
  if (final.length > 0) cacheStocks(final);
  return final;
}

function cacheStocks(quotes: StockQuote[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ quotes, expiry: Date.now() + CACHE_TTL }));
  } catch (e) {
    console.warn('LocalStorage error in cacheStocks:', e);
  }
}

export function getCachedStocks(): StockQuote[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { quotes, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) return null;
    return quotes;
  } catch (e) { return null; }
}
