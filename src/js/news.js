import { translations, currentLang } from './i18n.js';
import { logger, showToast } from './utils.js';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let newsData = [];
let visibleNewsCount = 50;
let currentNewsCategory = 'all';
let currentNewsSearch = '';

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
                    const mediaContent = item.querySelector('media\\:content, content');
                    if (mediaContent && mediaContent.getAttribute('url')) {
                        image = mediaContent.getAttribute('url');
                    } else {
                        const imgMatch = desc.match(/<img[^>]+src="([^"]+)"/);
                        if (imgMatch) image = imgMatch[1];
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
    if (newsResults) newsResults.innerHTML = '';

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

        if (currentNewsSearch) {
            const searchLower = currentNewsSearch.toLowerCase();
            newsData = allArticles.filter(article =>
                article.title.toLowerCase().includes(searchLower) ||
                article.desc.toLowerCase().includes(searchLower)
            );
        } else {
            newsData = allArticles;
        }

        newsData.sort((a, b) => {
            const dateA = new Date(a.publishedAt);
            const dateB = new Date(b.publishedAt);
            return dateB - dateA;
        });
        // full dataset kept; rendering controls number of visible items
        visibleNewsCount = 30;

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
        newsResults.innerHTML = `
            <div class="news-empty">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p data-i18n="newsError">Ошибка загрузки новостей</p>
            </div>
        `;
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

        // Use proper HTML escaping
        const cleanTitle = news.title
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        const cleanDesc = (news.desc || '')
            .substring(0, 120)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        return `
            <article class="news-item" data-news-url="${news.url.replace(/"/g, '&quot;')}" onclick="const url = this.dataset.newsUrl; if (url) window.open(url, '_blank', 'noopener,noreferrer')">
                ${news.image ? `
                    <div class="news-item-image">
                        <img src="${news.image}" alt="${cleanTitle}" loading="lazy"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentNewsSearch = e.target.value.trim();
                fetchNews();
            }, 500);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentNewsSearch = e.target.value.trim();
                fetchNews();
            }
        });
    }

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
