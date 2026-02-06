<script lang="ts">
  import { onMount } from 'svelte';
  import { uiStore } from '../../lib/stores/uiStore';
  import {
    fetchNews,
    getCachedNews,
    CACHE_KEY,
    type NewsArticle,
    type NewsCategory,
  } from '../../lib/services/news';
  import { translations, t, tArray } from '../../lib/i18n';
  import { logger } from '../../lib/utils/logger';

  let articles: NewsArticle[] = [];
  // Number of articles to show per page/load
  let showCount = 6;
  let loading = true;
  let error: string | null = null;
  let category: NewsCategory = 'all';
  let search = '';
  let showFavorites = false;
  let favorites: Set<string> = new Set();
  /** URLs of images that failed to load — show placeholder instead */
  let failedImageUrls: Set<string> = new Set();

  function loadFavorites() {
    try {
      const raw = localStorage.getItem('newsFavorites');
      if (!raw) {
        favorites = new Set();
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        favorites = new Set(parsed.filter((x) => typeof x === 'string'));
      } else {
        favorites = new Set();
      }
    } catch {
      favorites = new Set();
    }
  }

  function persistFavorites() {
    try {
      localStorage.setItem('newsFavorites', JSON.stringify(Array.from(favorites)));
    } catch {
      // ignore
    }
  }

  function toggleFavorite(url: string) {
    if (!url) return;
    if (favorites.has(url)) {
      favorites.delete(url);
    } else {
      favorites.add(url);
    }
    favorites = new Set(favorites);
    persistFavorites();
  }

  function formatNewsDate(publishedAt: string): string {
    if (!publishedAt) return '';
    const d = new Date(publishedAt);
    if (Number.isNaN(d.getTime())) return publishedAt;
    const monthsShort = tArray($translations, 'monthsShort', []);
    const monthStr =
      monthsShort[d.getMonth()] || d.toLocaleDateString(undefined, { month: 'short' });
    const day = d.getDate();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return monthsShort.length ? `${day} ${monthStr}, ${h}:${m}` : d.toLocaleDateString();
  }

  function setImageFailed(url: string) {
    failedImageUrls.add(url);
    failedImageUrls = new Set(failedImageUrls);
  }

  async function loadNews() {
    if (articles.length === 0) loading = true;
    error = null;
    try {
      articles = await fetchNews($uiStore.language, category);
      if (articles.length === 0) {
        error = t($translations, 'newsNotFound', 'Новости не найдены');
      }
    } catch (err) {
      logger.error('News fetch error:', err);
      error = t($translations, 'newsError', 'Ошибка загрузки новостей');
      const cached = getCachedNews();
      if (cached?.length) {
        articles = cached;
        error = null;
      }
    } finally {
      loading = false;
    }
  }

  function handleRefresh() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
    loadNews();
  }

  /** Refetch only when tab becomes visible (not on every focus — иначе поле поиска мерцает) */
  function onVisibilityChange() {
    if (!document.hidden) {
      setTimeout(() => loadNews(), 0);
    }
  }

  onMount(() => {
    loadFavorites();
    const cached = getCachedNews($uiStore.language);
    if (cached?.length) {
      articles = cached;
      loading = false;
    } else {
      loadNews();
    }

    const intervalId = setInterval(
      () => {
        if (!document.hidden) loadNews();
      },
      30 * 60 * 1000,
    );
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  });

  $: filteredArticles = (() => {
    let items = articles;

    if (showFavorites) {
      items = items.filter((a) => favorites.has(a.url));
    }

    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter((a) => {
        const hay = `${a.title} ${a.desc} ${a.source}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return items;
  })();

  // Computed list to render based on showCount for simple pagination
  $: visibleArticles = filteredArticles.slice(0, showCount);

  // Re-fetch news when language changes
  $: if ($uiStore.language) {
    loadNews();
  }
</script>

<section
  id="news-widget"
  class="w-full premium-card p-0 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-full"
  style="border: 1px solid rgba(212, 175, 55, 0.2);"
>
  <div
    class="news-toolbar p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0"
  >
    <div class="news-toolbar-left flex gap-2 w-full items-center">
      <select
        id="news-category"
        class="news-select text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 flex-grow focus:ring-2 focus:ring-blue-500"
        bind:value={category}
        on:change={() => loadNews()}
        aria-label="News category filter"
      >
        <option value="all">{t($translations, 'newsAllCategories', 'Все категории')}</option>
        <option value="technology">{t($translations, 'newsTechnology', '💻 Технологии')}</option>
        <option value="business">{t($translations, 'newsBusiness', '💼 Бизнес')}</option>
        <option value="science">{t($translations, 'newsScience', '🔬 Наука')}</option>
        <option value="sports">{t($translations, 'newsSports', '⚽ Спорт')}</option>
        <option value="health">{t($translations, 'newsHealth', '🏥 Здоровье')}</option>
        <option value="entertainment"
          >{t($translations, 'newsEntertainment', '🎬 Развлечения')}</option
        >
      </select>

      <input
        id="news-search"
        type="text"
        class="news-search-input text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 flex-grow max-w-xs focus:ring-2 focus:ring-blue-500"
        bind:value={search}
        placeholder={t($translations, 'newsSearchPlaceholder', 'Поиск...')}
        aria-label="Search news"
      />

      <button
        id="news-favorites-toggle"
        class="news-favorites-btn p-2 text-gray-500 hover:text-yellow-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        class:active={showFavorites}
        type="button"
        aria-label="Show favorites"
        title="Избранное"
        on:click={() => (showFavorites = !showFavorites)}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>

      <button
        id="news-refresh"
        class="news-refresh-btn p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        type="button"
        aria-label="Refresh news"
        title={t($translations, 'newsRefresh', 'Обновить')}
        on:click={handleRefresh}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  </div>

  <div id="news-results" class="news-list flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
    {#if loading}
      <div class="animate-pulse news-item-skeleton">
        <div class="news-item-image-skeleton w-20 h-20 bg-gray-200 dark:bg-gray-700"></div>
        <div class="news-item-content-skeleton flex-1">
          <div class="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    {:else if error}
      <div class="flex flex-col items-center justify-center h-48 text-center p-4">
        <div class="text-sm text-red-500 mb-2">{error}</div>
        <button
          on:click={loadNews}
          class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          {t($translations, 'retry', 'Retry')}
        </button>
      </div>
    {:else if filteredArticles.length === 0}
      <div class="text-sm text-gray-500 dark:text-gray-400 p-2">
        {t($translations, 'newsNoNews', 'Новости не найдены')}
      </div>
    {:else}
      {#each visibleArticles as a (a.url)}
        <a class="news-item" href={a.url} target="_blank" rel="noopener noreferrer">
          <button
            type="button"
            class="news-item-favorite-btn"
            class:active={favorites.has(a.url)}
            aria-label="Favorite"
            on:click|stopPropagation|preventDefault={() => toggleFavorite(a.url)}
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill={favorites.has(a.url) ? 'currentColor' : 'none'}
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          {#if a.image && !failedImageUrls.has(a.url)}
            <div class="news-item-image">
              <img
                src={a.image}
                alt={a.title}
                loading="lazy"
                on:error={() => setImageFailed(a.url)}
              />
            </div>
          {:else}
            <div class="news-item-image-placeholder">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          {/if}

          <div class="news-item-content">
            <div class="news-item-header">
              <span class="news-item-source">{a.source}</span>
              <span class="news-item-date">{formatNewsDate(a.publishedAt)}</span>
            </div>
            <div class="news-item-title">{a.title}</div>
            <div class="news-item-desc">{a.desc}</div>
          </div>

          <div class="news-item-arrow">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>
      {/each}
      {#if showCount < filteredArticles.length}
        <div class="flex justify-center py-2">
          <button
            class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md"
            on:click={() => (showCount = Math.min(showCount + 6, filteredArticles.length))}
          >
            {t($translations, 'newsLoadMore', 'Загрузить ещё')}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</section>
