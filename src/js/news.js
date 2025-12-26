import { translations, currentLang } from './i18n.js';
import { logger, showToast, debounce } from './utils.js';
import { showSkeleton, hideSkeleton } from '../components/skeleton-loader.js';
import { getCachedItem, setCachedItem } from './storage.js';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let newsData = [];
let visibleNewsCount = 50;
let currentNewsCategory = 'all';
let currentNewsSearch = '';
let showFavoritesOnly = false;
let favoriteNews = new Set();

// ============================================================================
// RSS FEED SOURCES
// ============================================================================
// RSS источники новостей по языкам (бесплатные, не требуют API ключа)
const RSS_SOURCES = {
    'ru': {
        'all': [
            'https://lenta.ru/rss',
            'https://www.kommersant.ru/RSS/news.xml',
            'https://ria.ru/export/rss2/index.xml',
            'https://www.gazeta.ru/export/rss/lenta.xml'
        ],
        'technology': [
            'https://habr.com/ru/rss/flows/develop/all/',
            'https://habr.com/ru/rss/flows/infosecurity/all/',
            'https://vc.ru/rss'
        ],
        'business': [
            'https://www.kommersant.ru/RSS/economics.xml',
            'https://www.vedomosti.ru/rss/news',
            'https://www.rbc.ru/rss/frontpage.xml'
        ],
        'science': [
            'https://nauka.tass.ru/rss',
            'https://scientificrussia.ru/rss.xml'
        ],
        'sports': [
            'https://www.championat.com/rss/news.xml',
            'https://rsport.ria.ru/export/rss2/index.xml'
        ],
        'health': [
            'https://www.takzdorovo.ru/rss/',
            'https://www.aif.ru/rss/health.xml'
        ],
        'entertainment': [
            'https://www.kinopoisk.ru/media/rss/rss_top_movies.xml',
            'https://www.kp.ru/rss/incidents.xml'
        ]
    },
    'az': {
        'all': [
            'https://oxu.az/rss',
            'https://apa.az/rss',
            'https://azertag.az/rss/az',
            'https://report.az/rss',
            'https://news.milli.az/rss',
            'https://lent.az/rss',
            'https://trend.az/rss',
            'https://modern.az/rss',
            'https://publika.az/rss',
            'https://qafqazinfo.az/rss'
        ],
        'technology': [
            'https://oxu.az/rss',
            'https://report.az/rss',
            'https://modern.az/rss',
            'https://trend.az/rss'
        ],
        'business': [
            'https://marja.az/rss',
            'https://fed.az/rss',
            'https://banker.az/rss',
            'https://biznesmedia.az/rss',
            'https://trend.az/rss',
            'https://report.az/rss'
        ],
        'science': [
            'https://azertag.az/rss/az',
            'https://report.az/rss',
            'https://modern.az/rss'
        ],
        'sports': [
            'https://sportinfo.az/rss',
            'https://qol.az/rss',
            'https://oxu.az/rss',
            'https://report.az/rss'
        ],
        'health': [
            'https://azertag.az/rss/az',
            'https://report.az/rss',
            'https://modern.az/rss'
        ],
        'entertainment': [
            'https://baku.ws/rss',
            'https://big.az/rss',
            'https://yenicag.az/rss',
            'https://sfera.az/rss',
            'https://modern.az/rss'
        ]
    },
    'en': {
        'all': [
            'https://rss.cnn.com/rss/edition.rss',
            'https://feeds.bbci.co.uk/news/world/rss.xml',
            'https://www.theguardian.com/world/rss',
            'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'
        ],
        'technology': [
            'https://feeds.feedburner.com/oreilly/radar',
            'https://techcrunch.com/feed/',
            'https://www.theverge.com/rss/index.xml'
        ],
        'business': [
            'https://feeds.reuters.com/reuters/businessNews',
            'https://www.bloomberg.com/feed/topics/economics'
        ],
        'science': [
            'https://www.scientificamerican.com/rss/all/',
            'https://feeds.nature.com/nature/rss/current'
        ],
        'sports': [
            'https://www.espn.com/espn/rss/news',
            'https://feeds.bbci.co.uk/sport/rss.xml'
        ],
        'health': [
            'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC'
        ],
        'entertainment': [
            'https://www.rollingstone.com/rss/',
            'https://feeds.feedburner.com/oreilly/radar'
        ]
    },
    'it': {
        'all': [
            'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',
            'https://www.repubblica.it/rss/homepage/rss2.0.xml',
            'https://www.corriere.it/rss/homepage.xml',
            'https://www.ilsole24ore.com/rss/homepage.xml'
        ],
        'technology': [
            'https://www.repubblica.it/rss/tecnologia/rss2.0.xml',
            'https://www.corriere.it/rss/tecnologia.xml',
            'https://www.ilsole24ore.com/rss/tecnologia.xml'
        ],
        'business': [
            'https://www.ilsole24ore.com/rss/economia.xml',
            'https://www.repubblica.it/rss/economia/rss2.0.xml',
            'https://www.corriere.it/rss/economia.xml'
        ],
        'science': [
            'https://www.ansa.it/sito/notizie/scienza/scienza_rss.xml',
            'https://www.repubblica.it/rss/scienze/rss2.0.xml'
        ],
        'sports': [
            'https://www.gazzetta.it/rss/home.xml',
            'https://www.corriere.it/rss/sport.xml',
            'https://www.repubblica.it/rss/sport/rss2.0.xml'
        ],
        'health': [
            'https://www.ansa.it/sito/notizie/saluteebenessere/saluteebenessere_rss.xml',
            'https://www.repubblica.it/rss/salute/rss2.0.xml'
        ],
        'entertainment': [
            'https://www.repubblica.it/rss/spettacoli/rss2.0.xml',
            'https://www.corriere.it/rss/spettacoli.xml'
        ]
    }
};

const getRSSSourcesForLanguage = (lang, category = 'all') => {
    const langSources = RSS_SOURCES[lang] || RSS_SOURCES['en'];
    return langSources[category] || langSources['all'] || [];
};

const CORS_PROXIES = [
    (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

const fetchWithTimeout = (url, timeout = 12000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetch(url, {
        signal: controller.signal,
        cache: 'no-cache',
        mode: 'cors'
    }).finally(() => clearTimeout(timeoutId));
};

async function parseRSSFeed(url, retries = 2) {
    let lastError = null;

    for (let proxyIndex = 0; proxyIndex < CORS_PROXIES.length; proxyIndex++) {
        const proxyFn = CORS_PROXIES[proxyIndex];

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const proxyUrl = proxyFn(url);
                const res = await fetchWithTimeout(proxyUrl, 12000);

                if (!res.ok) {
                    if (res.status === 400) {
                        throw new Error(`HTTP ${res.status} - Bad Request, trying next proxy`);
                    }
                    throw new Error(`HTTP ${res.status}`);
                }

                const contentType = res.headers.get('content-type') || '';
                let finalXml = null;

                if (contentType.includes('application/json')) {
                    const data = await res.json();
                    finalXml = data.contents || data.content || (typeof data === 'string' ? data : JSON.stringify(data));
                } else if (contentType.includes('text/xml') || contentType.includes('application/xml')) {
                    finalXml = await res.text();
                } else {
                    const clonedRes = res.clone();
                    try {
                        const data = await res.json();
                        finalXml = data.contents || data.content || (typeof data === 'string' ? data : JSON.stringify(data));
                    } catch (jsonError) {
                        try {
                            finalXml = await clonedRes.text();
                        } catch (textError) {
                            throw new Error('Failed to parse response as JSON or text');
                        }
                    }
                }

                if (!finalXml || (typeof finalXml === 'string' && finalXml.trim().length === 0)) {
                    throw new Error('Empty response');
                }

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(finalXml, 'text/xml');

                const parseError = xmlDoc.querySelector('parsererror');
                if (parseError) {
                    throw new Error('XML parse error');
                }

                const items = xmlDoc.querySelectorAll('item');
                const articles = [];

                if (items.length === 0) {
                    throw new Error('No items found');
                }

                items.forEach(item => {
                    const title = item.querySelector('title')?.textContent || '';
                    const desc = item.querySelector('description')?.textContent || '';
                    const link = item.querySelector('link')?.textContent || '';
                    const pubDate = item.querySelector('pubDate')?.textContent || '';

                    let image = '';
                    // Try multiple sources for images with improved parsing
                    
                    // 1. Media namespace (media:content, media:thumbnail) - try different selectors
                    const mediaSelectors = [
                        'media\\:content',
                        'content[type^="image"]',
                        'media\\:thumbnail',
                        '*[xmlns\\:media] content',
                        '*[xmlns\\:media] thumbnail'
                    ];
                    
                    for (const selector of mediaSelectors) {
                        try {
                            const mediaContent = item.querySelector(selector);
                            if (mediaContent) {
                                image = mediaContent.getAttribute('url') || 
                                        mediaContent.getAttribute('href') || 
                                        mediaContent.getAttribute('src') ||
                                        mediaContent.textContent?.trim() || '';
                                if (image) break;
                            }
                        } catch (e) {
                            // Invalid selector, continue
                        }
                    }
                    
                    // 2. Enclosure tag
                    if (!image) {
                        const enclosure = item.querySelector('enclosure');
                        if (enclosure) {
                            const type = enclosure.getAttribute('type') || '';
                            if (type.startsWith('image/')) {
                                image = enclosure.getAttribute('url') || '';
                            }
                        }
                    }
                    
                    // 3. Parse description HTML to find images
                    if (!image && desc) {
                        try {
                            // Try to parse as HTML
                            const descDoc = new DOMParser().parseFromString(desc, 'text/html');
                            const imgTags = descDoc.querySelectorAll('img');
                            if (imgTags.length > 0) {
                                for (const img of imgTags) {
                                    const src = img.getAttribute('src') || img.getAttribute('data-src');
                                    if (src && (src.startsWith('http') || src.startsWith('//'))) {
                                        image = src;
                                        break;
                                    }
                                }
                            }
                        } catch (e) {
                            // Fallback to regex if HTML parsing fails
                        }
                        
                        // Regex fallback for image tags
                        if (!image) {
                            const imgMatches = desc.match(/<img[^>]+src=["']([^"']+)["']/gi);
                            if (imgMatches) {
                                for (const match of imgMatches) {
                                    const srcMatch = match.match(/src=["']([^"']+)["']/i);
                                    if (srcMatch && srcMatch[1]) {
                                        const src = srcMatch[1];
                                        if (src.startsWith('http') || src.startsWith('//') || src.startsWith('/')) {
                                            image = src;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Try to find image URLs in CDATA or plain text
                        if (!image) {
                            const urlMatches = desc.match(/(https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s<>"']*)?)/gi);
                            if (urlMatches && urlMatches.length > 0) {
                                image = urlMatches[0];
                            }
                        }
                    }
                    
                    // 4. Try Open Graph and Twitter Card meta tags (if description contains them)
                    if (!image && desc) {
                        const ogImageMatch = desc.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
                        if (ogImageMatch) {
                            image = ogImageMatch[1];
                        } else {
                            const twitterImageMatch = desc.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
                            if (twitterImageMatch) {
                                image = twitterImageMatch[1];
                            }
                        }
                    }
                    
                    // Clean and validate image URL
                    if (image) {
                        // Remove HTML entities
                        image = image.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                        
                        // Handle relative URLs
                        if (image.startsWith('//')) {
                            image = 'https:' + image;
                        } else if (image.startsWith('/')) {
                            try {
                                const urlObj = new URL(url);
                                image = urlObj.origin + image;
                            } catch (e) {
                                // Keep relative URL if base URL parsing fails
                            }
                        }
                        
                        // Remove only tracking parameters, keep essential ones
                        if (image.includes('?')) {
                            const [base, query] = image.split('?');
                            const params = query.split('&').filter(p => {
                                const param = p.split('=')[0].toLowerCase();
                                // Remove tracking params but keep size, quality, etc.
                                return !param.startsWith('utm_') && 
                                       !param.startsWith('ref=') && 
                                       !param.startsWith('fbclid') &&
                                       !param.startsWith('gclid');
                            });
                            image = base + (params.length > 0 ? '?' + params.join('&') : '');
                        }
                        
                        // Validate URL format
                        try {
                            new URL(image);
                        } catch (e) {
                            // Invalid URL, clear it
                            image = '';
                        }
                    }

                    articles.push({
                        title: title.replace(/<[^>]*>/g, '').trim(),
                        desc: desc.replace(/<[^>]*>/g, '').trim().substring(0, 200),
                        image: image,
                        url: link,
                        source: url.split('/')[2]?.replace('www.', '') || 'News',
                        publishedAt: pubDate,
                        categories: []
                    });
                });

                if (articles.length > 0) {
                    return articles;
                }
            } catch (e) {
                lastError = e;
                if (attempt < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        }
    }

    if (lastError) {
        logger.debug('RSS parse error after all retries:', lastError.message || lastError);
    }
    return [];
}

export async function fetchNews() {
    const newsLoading = document.getElementById('news-loading');
    const newsResults = document.getElementById('news-results');

    if (newsLoading) newsLoading.classList.remove('hidden');
    if (newsResults) {
        // Show skeleton loader instead of empty
        showSkeleton('news-results', 'news', { count: 5 });
    }

    try {
        const categoryKey = currentNewsCategory || 'all';
        let rssUrls = getRSSSourcesForLanguage(currentLang, categoryKey);

        if (rssUrls.length === 0) {
            const fallbackUrls = RSS_SOURCES['en'][categoryKey] || RSS_SOURCES['en']['all'];
            rssUrls = [...fallbackUrls];
        }

        const urlsToFetch = rssUrls.slice(0, 2);
        const allArticles = [];

        const promises = urlsToFetch.map(url => parseRSSFeed(url, 1));
        const results = await Promise.allSettled(promises);

        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                allArticles.push(...result.value);
            } else {
                if (result.reason) {
                    logger.debug(`Failed to load news from source ${urlsToFetch[index]}:`, result.reason);
                }
            }
        });

        if (allArticles.length === 0 && rssUrls.length > 2) {
            try {
                const articles = await parseRSSFeed(rssUrls[2], 1);
                if (articles && articles.length > 0) {
                    allArticles.push(...articles);
                }
            } catch (e) {
                logger.debug(`Source ${rssUrls[2]} failed:`, e);
            }
        }

        if (allArticles.length === 0 && currentLang !== 'en') {
            const fallbackUrls = RSS_SOURCES['en'][categoryKey] || RSS_SOURCES['en']['all'];
            try {
                const articles = await parseRSSFeed(fallbackUrls[0], 1);
                if (articles && articles.length > 0) {
                    allArticles.push(...articles);
                }
            } catch (e) {
                logger.debug(`Fallback source failed:`, e);
            }
        }

        // Apply search filter
        let filteredArticles = allArticles;
        if (currentNewsSearch) {
            const searchLower = currentNewsSearch.toLowerCase();
            filteredArticles = allArticles.filter(article =>
                article.title.toLowerCase().includes(searchLower) ||
                article.desc.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply favorites filter
        if (showFavoritesOnly) {
            filteredArticles = filteredArticles.filter(article => 
                favoriteNews.has(article.url)
            );
        }
        
        newsData = filteredArticles;

        newsData.sort((a, b) => {
            const dateA = new Date(a.publishedAt);
            const dateB = new Date(b.publishedAt);
            return dateB - dateA;
        });
        // full dataset kept; rendering controls number of visible items
        visibleNewsCount = 30;

        // Cache the original articles (before search/favorites filter) for 30 minutes
        if (allArticles.length > 0 && !currentNewsSearch && !showFavoritesOnly) {
            setCachedItem(cacheKey, allArticles, 1000 * 60 * 30);
        }
        
        // Hide skeleton and render news
        hideSkeleton('news-results');
        renderNews();

        if (newsData.length === 0) {
            newsResults.innerHTML = `
                <div class="news-empty">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                    <p data-i18n="newsNoNews">Новости не найдены</p>
                </div>
            `;
            setTimeout(() => {
                const emptyText = newsResults.querySelector('[data-i18n="newsNoNews"]');
                if (emptyText && translations[currentLang].newsNoNews) {
                    emptyText.textContent = translations[currentLang].newsNoNews;
                }
            }, 0);
        }
    } catch (e) {
        logger.error('News fetch error:', e);
        hideSkeleton('news-results');
        if (newsResults) {
            newsResults.innerHTML = `
                <div class="news-empty">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p data-i18n="newsError">Ошибка загрузки новостей</p>
                </div>
            `;
        }
        setTimeout(() => {
            const errorText = newsResults.querySelector('[data-i18n="newsError"]');
            if (errorText && translations[currentLang].newsError) {
                errorText.textContent = translations[currentLang].newsError;
            }
        }, 0);
        showToast(translations[currentLang].newsError || 'Failed to load news', 'error');
    } finally {
        if (newsLoading) newsLoading.classList.add('hidden');
    }
}

const renderNews = () => {
    const newsResults = document.getElementById('news-results');
    if (!newsResults) return;

    if (newsData.length === 0) {
        newsResults.innerHTML = `
            <div class="news-empty">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
                <p data-i18n="newsNoNews">Новости не найдены</p>
            </div>
        `;
        setTimeout(() => {
            const emptyText = newsResults.querySelector('[data-i18n="newsNoNews"]');
            if (emptyText && translations[currentLang].newsNoNews) {
                emptyText.textContent = translations[currentLang].newsNoNews;
            }
        }, 0);
        return;
    }

    const slice = newsData.slice(0, visibleNewsCount);
    newsResults.innerHTML = slice.map((news) => {
        const date = new Date(news.publishedAt);
        const monthIndex = date.getMonth();
        const day = date.getDate();
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const monthShort = translations[currentLang]?.monthsShort?.[monthIndex] || '';
        const formattedDate = monthShort ? `${day} ${monthShort}, ${hour}:${minute}` : date.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'az' ? 'az-Latn-AZ' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const cleanTitle = news.title.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const cleanDesc = (news.desc || '').substring(0, 120).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

        return `
            <article class="news-item" onclick="window.open('${news.url}', '_blank', 'noopener,noreferrer')">
                ${news.image ? `
                    <div class="news-item-image">
                        <img src="${news.image}" 
                             alt="${cleanTitle}" 
                             loading="lazy"
                             decoding="async"
                             crossorigin="anonymous"
                             referrerpolicy="no-referrer"
                             data-src="${news.image}"
                             class="news-image-lazy"
                             onerror="this.onerror=null; this.style.display='none'; const placeholder = this.nextElementSibling; if(placeholder) placeholder.style.display='flex';"
                             onload="this.style.opacity='1';">
                        <div class="news-item-image-placeholder" style="display:none;">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                            </svg>
                        </div>
                    </div>
                ` : `
                    <div class="news-item-image-placeholder">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                        </svg>
                    </div>
                `}
                <div class="news-item-content">
                    <div class="news-item-header">
                        <span class="news-item-source">${news.source}</span>
                        <span class="news-item-date">${formattedDate}</span>
                    </div>
                    <h3 class="news-item-title">${cleanTitle}</h3>
                    ${news.desc ? `<p class="news-item-desc">${cleanDesc}${news.desc.length > 120 ? '...' : ''}</p>` : ''}
                </div>
                <div class="news-item-arrow">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </article>
        `;
    }).join('');
    const showMoreBtn = document.getElementById('news-show-more');
    if (showMoreBtn) {
        if (visibleNewsCount >= newsData.length) {
            showMoreBtn.classList.add('hidden');
        } else {
            showMoreBtn.classList.remove('hidden');
        }
    }
};

let isNewsInitialized = false;

// Load favorites from storage
function loadFavorites() {
    try {
        const saved = localStorage.getItem('ordina_news_favorites');
        if (saved) {
            favoriteNews = new Set(JSON.parse(saved));
        }
    } catch (e) {
        logger.error('Error loading favorites:', e);
    }
}

// Save favorites to storage
function saveFavorites() {
    try {
        localStorage.setItem('ordina_news_favorites', JSON.stringify(Array.from(favoriteNews)));
    } catch (e) {
        logger.error('Error saving favorites:', e);
    }
}

// Toggle favorite status
export function toggleNewsFavorite(url) {
    if (favoriteNews.has(url)) {
        favoriteNews.delete(url);
    } else {
        favoriteNews.add(url);
    }
    saveFavorites();
    renderNews();
}

// Initialize favorites on load
loadFavorites();

export const initNews = () => {
    if (isNewsInitialized) return;
    isNewsInitialized = true;

    const categorySelect = document.getElementById('news-category');
    const searchInput = document.getElementById('news-search');
    const refreshBtn = document.getElementById('news-refresh');

    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            currentNewsCategory = e.target.value;
            fetchNews();
        });
    }

    if (searchInput) {
        // Debounced search
        const debouncedSearch = debounce((value) => {
            currentNewsSearch = value.trim();
            renderNews(); // Re-render with search filter
        }, 300);
        
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentNewsSearch = e.target.value.trim();
                renderNews();
            }
        });
    }
    
    // Favorites toggle button
    const favoritesBtn = document.getElementById('news-favorites-toggle');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', () => {
            showFavoritesOnly = !showFavoritesOnly;
            favoritesBtn.classList.toggle('active', showFavoritesOnly);
            favoritesBtn.setAttribute('aria-pressed', showFavoritesOnly);
            renderNews();
        });
    }
    
    // Make toggleNewsFavorite available globally
    window.toggleNewsFavorite = toggleNewsFavorite;

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            visibleNewsCount = 10;
            fetchNews();
        });
    }

    const showMoreBtn = document.getElementById('news-show-more');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            visibleNewsCount += 10;
            renderNews();
        });
    }

    // Initial load
    fetchNews();
};
