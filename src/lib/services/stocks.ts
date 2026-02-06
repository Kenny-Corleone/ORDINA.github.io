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
  INDICES: ['S&P 500', 'Nasdaq', 'Dow Jones', 'FTSE 100', 'Nikkei 225', 'IMOEX'],
  ENERGY: ['Crude Oil', 'Brent', 'Natural Gas', 'Gasoline', 'Heating Oil'],
  METALS: ['Gold', 'Silver', 'Copper', 'Platinum', 'Palladium'],
  AGRICULTURAL: ['Wheat', 'Corn', 'Soybeans', 'Rice', 'Sugar', 'Coffee'],
  TECH: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META'],
};

export const LOCAL_SYMBOLS: Record<string, string[]> = {
  'ru': ['IMOEX', 'SBER', 'GAZP', 'LKOH', 'YNDX', 'ROSN', 'MGNT', 'MTSS', 'CHMF', 'GMKN'], // Moscow Exchange
  'it': ['RACE', 'ENI', 'STLA', 'UCG', 'ISP', 'ENEL', 'PRY', 'G', 'TEN', 'MONC'], // Borsa Italiana (Ferrari, Eni, Stellantis, etc. from Investing.com list)
  'az': ['ABB', 'ABBNK', 'Brent', 'Gold', 'Natural Gas', 'S&P 500'], // BFB + Energy/Metals
  'en': ['S&P 500', 'Nasdaq', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META'],
};

export const DEFAULT_SYMBOLS = STOCK_CATEGORIES.CURRENCIES;

const STOCKS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&_t=${Date.now()}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&_t=${Date.now()}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

/**
 * BFB.az Scraper for Azerbaijan Market Data
 */
async function fetchBFB(ticker: string): Promise<StockQuote | null> {
  // Shuffle proxies
  const shuffledProxies = [...STOCKS_PROXIES].sort(() => Math.random() - 0.5);
  
  for (const proxyFn of shuffledProxies) {
    try {
      const bfbUrl = 'https://www.bfb.az/en/market-watch';
      const targetUrl = proxyFn(bfbUrl);
      
      const res = await fetch(targetUrl);
      if (!res.ok) continue;
      
      let html = '';
      if (targetUrl.includes('allorigins.win/get')) {
        const json = await res.json();
        html = json.contents;
      } else {
        html = await res.text();
      }

      if (!html || html.length < 500) continue; 

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const table = doc.querySelector('.capitalisation_table table') || doc.querySelector('table');
      if (!table) continue;

      const rows = Array.from(table.querySelectorAll('tbody tr'));
      
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const rowTicker = cells[0]?.textContent?.trim() || '';
          if (rowTicker.includes(ticker) || (ticker === 'ABB' && rowTicker.includes('AİB'))) {
            const priceStr = cells[2]?.textContent?.trim() || '0';
            const price = parseFloat(priceStr.replace(',', '.'));
            if (isNaN(price) || price === 0) continue;
            
            return {
              symbol: ticker,
              price: price,
              change: 0,
              percentChange: 0,
              high: price,
              low: price,
              open: price,
              prevClose: price,
              timestamp: Date.now(),
              provider: 'BFB'
            };
          }
        }
      }
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  return null;
}

/**
 * Trading Economics Scraper for Energy, Metals, Agricultural
 */
async function fetchTradingEconomics(ticker: string): Promise<StockQuote | null> {
  const shuffledProxies = [...STOCKS_PROXIES].sort(() => Math.random() - 0.5);

  for (const proxyFn of shuffledProxies) {
    try {
      const teUrl = 'https://tradingeconomics.com/commodities';
      const targetUrl = proxyFn(teUrl);

      const res = await fetch(targetUrl);
      if (!res.ok) continue;
      
      let html = '';
      if (targetUrl.includes('allorigins.win/get')) {
        const json = await res.json();
        html = json.contents;
      } else {
        html = await res.text();
      }

      if (!html || html.length < 1000) continue;

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const rows = Array.from(doc.querySelectorAll('tr[data-symbol], table tbody tr'));
      
      for (const row of rows) {
        const nameEl = row.querySelector('td:first-child b');
        const name = nameEl?.textContent?.trim() || '';
        
        if (name.toLowerCase() === ticker.toLowerCase() || 
            row.getAttribute('data-symbol')?.toLowerCase().includes(ticker.toLowerCase())) {
          
          const priceCell = row.querySelector('td:nth-child(2)');
          const price = parseFloat(priceCell?.textContent?.trim().replace(/,/g, '') || '0');
          if (isNaN(price)) continue;
          
          const changeCell = row.querySelector('td:nth-child(4)');
          const change = parseFloat(changeCell?.textContent?.trim() || '0');
          
          const pctCell = row.querySelector('td:nth-child(5)');
          const pctChange = parseFloat(pctCell?.textContent?.trim().replace('%', '') || '0');

          return {
            symbol: ticker,
            price: price,
            change: change,
            percentChange: pctChange,
            high: price,
            low: price,
            open: price - change,
            prevClose: price - change,
            timestamp: Date.now(),
            provider: 'TE'
          };
        }
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}
async function fetchMoEx(ticker: string): Promise<StockQuote | null> {
  try {
    const isIndex = ticker === 'IMOEX';
    const engine = 'stock';
    const market = isIndex ? 'index' : 'shares';
    const board = isIndex ? 'SNDX' : 'TQBR';
    
    const url = `https://iss.moex.com/iss/engines/${engine}/markets/${market}/boards/${board}/securities/${ticker}.json?iss.meta=off&iss.only=marketdata,securities`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    
    const marketData = data.marketdata.data[0];
    const securityData = data.securities.data[0];
    
    if (!marketData || !securityData) return null;

    // MoEx Positional Map: LAST=12, CHANGE=25, PCTCHANGE=26
    const last = marketData[12] || marketData[50]; 
    const change = marketData[25] || 0;
    const pctChange = marketData[26] || 0;

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
 * Alpha Vantage for Italian Stocks (Reliable with API Key)
 */
async function fetchAlphaVantage(ticker: string): Promise<StockQuote | null> {
  const apiKey = 'E2580VM00VDL0SH0'; 
  // Try .MI first, Alpha Vantage usually supports it for Milan
  const symbolsToTry = [`${ticker}.MI`, `${ticker}.MIL`];
  
  for (const symbol of symbolsToTry) {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const quote = data['Global Quote'];
      if (!quote || !quote['05. price']) continue;

      const price = parseFloat(quote['05. price']);
      if (isNaN(price)) continue;

      const change = parseFloat(quote['09. change']) || 0;
      const pctChangeStr = (quote['10. change percent'] || '0%').replace('%', '');
      const pctChange = parseFloat(pctChangeStr) || 0;

      return {
        symbol: ticker,
        price,
        change,
        percentChange: pctChange,
        high: parseFloat(quote['03. high']) || price,
        low: parseFloat(quote['04. low']) || price,
        open: parseFloat(quote['02. open']) || price,
        prevClose: parseFloat(quote['08. previous close']) || price - change,
        timestamp: Date.now(),
        provider: 'AlphaV'
      };
    } catch (e) {
      continue;
    }
  }
  return null;
}

/**
 * Yahoo Finance via CORS Proxy (Secondary Fallback)
 */
async function fetchYahoo(ticker: string, suffix: string = ''): Promise<StockQuote | null> {
  const fullTicker = suffix ? `${ticker}${suffix}` : ticker;
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${fullTicker}?interval=1d&range=1d`;
  
  const shuffledProxies = [...STOCKS_PROXIES].sort(() => Math.random() - 0.5);

  for (const proxyFn of shuffledProxies) {
    try {
      const targetUrl = proxyFn(yahooUrl);
      const response = await fetch(targetUrl);
      if (!response.ok) continue;
      
      let data;
      if (targetUrl.includes('allorigins.win/get')) {
        const json = await response.json();
        data = JSON.parse(json.contents);
      } else if (targetUrl.includes('allorigins.win/raw') || targetUrl.includes('corsproxy.io') || targetUrl.includes('codetabs')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = JSON.parse(text);
      }
    
      const meta = data.chart.result[0].meta;
      return {
        symbol: ticker,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.previousClose,
        percentChange: ((meta.regularMarketPrice - meta.previousClose) / (meta.previousClose || 1)) * 100,
        high: meta.dayHigh || meta.regularMarketPrice,
        low: meta.dayLow || meta.regularMarketPrice,
        open: meta.regularMarketOpen || meta.regularMarketPrice,
        prevClose: meta.previousClose,
        timestamp: meta.regularMarketTime * 1000,
        provider: 'Yahoo'
      };
    } catch (e) {
      continue;
    }
  }
  return null;
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
  const azTickers = LOCAL_SYMBOLS['az'] || [];
  const commodityTickers = [
    ...STOCK_CATEGORIES.ENERGY,
    ...STOCK_CATEGORIES.METALS,
    ...STOCK_CATEGORIES.AGRICULTURAL
  ];

  const promises = symbols.map(async (s) => {
    // Skip if already handled by currency
    if (results.find(r => r.symbol === s)) return null;

    // RU Stocks -> MoEx
    if (ruTickers && ruTickers.includes(s)) return fetchMoEx(s);
    
    // AZ Stocks -> BFB.az (excluding macro commodities which go to TE)
    if (azTickers && azTickers.includes(s) && !commodityTickers.includes(s) && s !== 'S&P 500') {
      return fetchBFB(s);
    }
    
    // Commodities -> TradingEconomics
    if (commodityTickers.includes(s)) {
      return fetchTradingEconomics(s);
    }

    // IT Stocks -> Alpha Vantage first
    if (itTickers && itTickers.includes(s)) {
      const alpha = await fetchAlphaVantage(s);
      if (alpha) return alpha;
      return fetchYahoo(s, '.MI');
    }
    
    // Indices/Tech -> Finnhub
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
