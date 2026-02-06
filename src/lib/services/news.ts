// ============================================================================
// NEWS SERVICE - RSS Feed Integration with CORS Proxy
// ============================================================================

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type NewsCategory =
  | 'all'
  | 'technology'
  | 'business'
  | 'science'
  | 'sports'
  | 'health'
  | 'entertainment';

export interface NewsArticle {
  title: string;
  desc: string;
  url: string;
  source: string;
  publishedAt: string;
  image: string;
  categories: NewsCategory[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const RSS_SOURCES: Record<string, Record<string, string[]>> = {
  az: {
    all: [
      'https://azertag.az/rss.xml',
      'https://apa.az/az/rss',
      'https://report.az/rss',
      'https://oxu.az/rss',
      'https://az.trend.az/rss',
      'https://qafqazinfo.az/rss',
      'https://www.milli.az/rss',
      'https://lent.az/rss',
      'https://publika.az/rss',
      'https://turan.az/ext/news/rss.xml',
      'https://www.azadliq.info/feed',
      'https://www.bizimyol.info/rss',
      'https://bakupost.az/rss',
      'https://moderator.az/rss'
    ],
    business: ['https://fed.az/rss', 'https://marja.az/rss', 'https://banker.az/rss'],
    sports: ['https://qol.az/rss', 'https://sportinfo.az/rss'],
    entertainment: ['https://baku.ws/rss', 'https://big.az/rss', 'https://yenicag.az/rss', 'https://sfera.az/rss'],
    technology: ['https://az.trend.az/rss/it/'],
    science: ['https://azertag.az/rss.xml'],
    health: ['https://apa.az/az/rss']
  },
  ru: {
    all: [
      'https://ria.ru/export/rss2/archive/index.xml',
      'https://tass.ru/rss/v2.xml',
      'https://www.interfax.ru/rss.asp',
      'https://lenta.ru/rss',
      'https://www.gazeta.ru/export/rss/lenta.xml',
      'https://iz.ru/xml/rss/all.xml',
      'https://rssexport.rbc.ru/rbcnews/news/30/full.rss',
      'https://www.kommersant.ru/RSS/main.xml',
      'https://www.vedomosti.ru/rss/news'
    ],
    business: ['https://www.vedomosti.ru/rss/news', 'https://www.forbes.ru/newrss.xml', 'https://rssexport.rbc.ru/rbcnews/news/30/full.rss'],
    technology: ['https://3dnews.ru/news/rss/', 'https://habr.com/ru/rss/all/all/'],
    science: ['https://nplus1.ru/rss'],
    sports: ['https://www.sports.ru/rss/all.xml'],
    health: ['https://rg.ru/rss/vlast/zdorove/index.xml'],
    entertainment: ['https://www.afisha.ru/rss/news/']
  },
  en: {
    all: [
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://feeds.bbci.co.uk/news/rss.xml',
      'https://feeds.reuters.com/reuters/worldNews',
      'https://feeds.reuters.com/reuters/topNews',
      'https://apnews.com/rss',
      'https://www.theguardian.com/world/rss',
      'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
      'https://feeds.washingtonpost.com/rss/world',
      'https://www.aljazeera.com/xml/rss/all.xml',
      'https://rss.dw.com/xml/rss-en-all'
    ],
    business: [
      'https://feeds.bloomberg.com/markets/news.rss',
      'https://www.ft.com/rss/home',
      'https://www.cnbc.com/id/100003114/device/rss/rss.html',
      'https://feeds.a.dj.com/rss/RSSWorldNews.xml'
    ],
    technology: ['https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', 'https://www.theverge.com/rss/index.xml'],
    science: ['https://www.sciencedaily.com/rss/all.xml'],
    sports: ['https://feeds.bbci.co.uk/sport/rss.xml'],
    health: ['https://www.medicalnewstoday.com/feed/rss'],
    entertainment: ['https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml']
  },
  it: {
    all: [
      'https://www.ansa.it/sito/ansait_rss.xml',
      'https://www.corriere.it/rss/homepage.xml',
      'https://www.repubblica.it/rss/homepage/rss2.0.xml',
      'https://www.lastampa.it/rss.xml',
      'https://tg24.sky.it/rss/tg24.xml',
      'https://www.fanpage.it/feed/',
      'https://www.open.online/feed/'
    ],
    business: ['https://www.ilsole24ore.com/rss/homepage.xml', 'https://www.milanofinanza.it/rss'],
    technology: ['https://www.ansa.it/sito/notizie/tecnologia/tecnologia_rss.xml'],
    science: ['https://www.ansa.it/sito/notizie/scienza_tecnica/scienza_tecnica_rss.xml'],
    sports: ['https://www.ansa.it/sito/notizie/sport/sport_rss.xml'],
    health: ['https://www.ansa.it/sito/notizie/sanita/sanita_rss.xml'],
    entertainment: ['https://www.ansa.it/sito/notizie/cultura/cultura_rss.xml']
  }
};

/** Cache key for localStorage */
export const CACHE_KEY = 'cached_news';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

const CORS_PROXIES = [
  // Direct fetch (some feeds allow it nowadays)
  (url: string) => url,
  // Primary Proxies
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://proxy.cors.sh/${url}`, // Note: might require an API key in headers, but often works for small traffic
];

// ============================================================================
// HELPERS
// ============================================================================

function getRSSSourcesForLanguage(lang: string, category: NewsCategory = 'all'): string[] {
  const safeLang = RSS_SOURCES[lang] ? lang : 'en';
  const langSources = RSS_SOURCES[safeLang];
  if (!langSources) return [];
  const catSources = langSources[category] || langSources['all'] || [];
  return Array.isArray(catSources) ? catSources : [];
}

function fetchWithTimeout(url: string, timeoutMs: number = 12000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal, cache: 'no-cache', mode: 'cors' }).finally(() =>
    clearTimeout(timeoutId)
  );
}

/**
 * Remove tracking and junk query params from URL (e.g. utm_*, fbclid, ref).
 */
function cleanUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    const strip = new Set([
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'ref', 'mc_cid', 'mc_eid', '_ga', 'utm_id',
    ]);
    strip.forEach((p) => parsed.searchParams.delete(p));
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Clean image URL and ensure valid protocol.
 */
function cleanImageUrl(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let s = raw.replace(/&amp;/g, '&').trim();
  if (s.startsWith('//')) s = 'https:' + s;
  return cleanUrl(s);
}

/**
 * Parse one RSS feed URL via CORS proxies with retries. Returns articles or [].
 */
async function parseRSSFeed(url: string, retries: number = 2): Promise<NewsArticle[]> {
  let lastError: Error | null = null;
  const sourceName = (() => {
    try {
      return new URL(url).hostname.replace('www.', '') || 'News';
    } catch {
      return 'News';
    }
  })();

  for (let proxyIndex = 0; proxyIndex < CORS_PROXIES.length; proxyIndex++) {
    const proxyFn = CORS_PROXIES[proxyIndex];
    if (!proxyFn) continue;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const proxyUrl = proxyFn(url);
        const res = await fetchWithTimeout(proxyUrl, 12000);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        let raw: string;
        
        if (contentType.includes('application/json') || proxyUrl.includes('allorigins')) {
          const json = await res.json();
          // AllOrigins puts XML in 'contents'
          raw = typeof json.contents === 'string' ? json.contents : JSON.stringify(json);
        } else {
          raw = await res.text();
        }

        // Final fail-safe: if it's a JSON string but we expect XML
        if (raw.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed.contents) raw = parsed.contents;
          } catch { /* not json */ }
        }
        if (!raw || !raw.trim()) throw new Error('Empty response');

        const xmlDoc = new DOMParser().parseFromString(raw, 'text/xml');
        if (xmlDoc.querySelector('parsererror')) throw new Error('XML parse error');
        const items = xmlDoc.querySelectorAll('item');
        if (!items.length) throw new Error('No items found');

        const articles: NewsArticle[] = [];
        items.forEach((item) => {
          const title = (item.querySelector('title')?.textContent || '').trim();
          const descRaw = item.querySelector('description')?.textContent || '';
          const desc = descRaw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200);
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          let image = '';

          const mediaSelectors = [
            'media\\:content',
            'content[type^="image"]',
            'media\\:thumbnail',
            'enclosure[type^="image"]',
          ];
          for (const sel of mediaSelectors) {
            const el = item.querySelector(sel);
            if (el) {
              image = el.getAttribute('url') || el.getAttribute('src') || (el as Element).textContent || '';
              if (image) break;
            }
          }
          const enc = item.querySelector('enclosure');
          if (!image && enc && enc.getAttribute('type')?.startsWith('image/')) {
            image = enc.getAttribute('url') || '';
          }
          if (!image && descRaw) {
            const m = descRaw.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (m && m[1]) image = m[1];
          }
          if (image) image = cleanImageUrl(image);

          if (title && link) {
            articles.push({
              title,
              desc,
              image,
              url: cleanUrl(link),
              source: sourceName,
              publishedAt: pubDate,
              categories: [],
            });
          }
        });

        if (articles.length) return articles;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }
  if (lastError) logger.debug('RSS parse error:', lastError.message);
  return [];
}

/**
 * Deduplicate articles by URL (first occurrence wins).
 */
function dedupeByUrl(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const u = a.url?.trim();
    if (!u || seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Fetch news: always attempts load, aggregates with dedup by URL,
 * fallback to English sources if current language returns no articles,
 * caches with CACHE_KEY, resilient to CORS and unstable sources.
 */
export async function fetchNews(
  lang: string = 'en',
  category: NewsCategory = 'all'
): Promise<NewsArticle[]> {
  const safeLang = RSS_SOURCES[lang] ? lang : 'en';
  const safeCat = (RSS_SOURCES[safeLang] && category in RSS_SOURCES[safeLang])
    ? category
    : 'all';

  let urls = getRSSSourcesForLanguage(safeLang, safeCat).slice(0, 8);
  const promises = urls.map((u) => parseRSSFeed(u, 1));
  const results = await Promise.allSettled(promises);

  const allArticles: NewsArticle[] = [];
  results.forEach((r) => {
    if (r.status === 'fulfilled' && r.value.length) allArticles.push(...r.value);
  });

  let filtered = dedupeByUrl(allArticles);
  if (filtered.length === 0 && safeLang !== 'en') {
    const enUrls = getRSSSourcesForLanguage('en', safeCat).slice(0, 8);
    const enPromises = enUrls.map((u) => parseRSSFeed(u, 1));
    const enResults = await Promise.allSettled(enPromises);
    enResults.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.length) allArticles.push(...r.value);
    });
    filtered = dedupeByUrl(allArticles);
  }

  filtered.sort((a, b) => {
    const ta = new Date(a.publishedAt).getTime();
    const tb = new Date(b.publishedAt).getTime();
    return tb - ta;
  });
  const final = filtered.slice(0, 50);

  if (typeof localStorage !== 'undefined' && final.length > 0) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: final,
          lang: safeLang,
          category: safeCat,
        })
      );
    } catch {
      // ignore
    }
  }

  return final;
}

/**
 * Get cached news if valid and matching the requested language
 */
export function getCachedNews(lang?: string): NewsArticle[] | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { timestamp, data, lang: cachedLang } = JSON.parse(raw);
    
    // Check expiry
    if (!Array.isArray(data) || Date.now() - timestamp > CACHE_EXPIRY_MS) return null;
    
    // Check language match if requested
    if (lang && cachedLang !== lang) return null;
    
    return data;
  } catch {
    return null;
  }
}
