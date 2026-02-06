<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    fetchStocks,
    getCachedStocks,
    STOCK_CATEGORIES,
    type StockQuote,
  } from '../../lib/services/stocks';
  import { translations, t } from '../../lib/i18n';
  import { uiStore } from '../../lib/stores/uiStore';

  let stocks: StockQuote[] = [];
  let loading = true;
  let error: string | null = null;
  let interval: any;
  let activeCategory: string = 'STOCKS';

  async function loadStocks(force = false) {
    if (force) loading = true;
    try {
      const symbols = STOCK_CATEGORIES[activeCategory as keyof typeof STOCK_CATEGORIES] || [];
      const data = await fetchStocks(symbols);
      if (data.length > 0) {
        stocks = data;
        error = null;
      } else if (stocks.length === 0) {
        error = t($translations, 'stocksError', 'Failed to load stocks');
      }
    } catch (e) {
      error = t($translations, 'stocksError', 'Error fetching stocks');
    } finally {
      loading = false;
    }
  }

  function handleCategoryChange(cat: string) {
    activeCategory = cat;
    stocks = [];
    loadStocks(true);
  }

  onMount(() => {
    const cached = getCachedStocks();
    if (cached) {
      // Basic validation: check if cached symbols match active category
      // (Simplified for now, just load)
      stocks = cached;
      loading = false;
    }
    loadStocks();
    interval = setInterval(() => loadStocks(), 5 * 60 * 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="stocks-widget premium-card transition-all duration-300">
  <!-- Header -->
  <div class="flex items-center justify-between p-3 border-b border-white/10 dark:border-black/10">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
      <span
        class="text-[10px] font-black uppercase tracking-widest opacity-60"
        style="color: var(--text-primary);"
      >
        {t($translations, 'stocksTitle', 'Markets')}
      </span>
    </div>

    <div class="flex items-center gap-1">
      <button
        on:click={() => loadStocks(true)}
        class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:scale-90"
      >
        <svg
          class={`w-3 h-3 text-gray-400 ${loading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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

  <!-- Category Selection (Scrollable on mobile, compact on desktop) -->
  <div class="category-tabs flex gap-1 p-2 overflow-x-auto no-scrollbar bg-black/5 dark:bg-white/5">
    {#each Object.keys(STOCK_CATEGORIES) as cat}
      <button
        class={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
        on:click={() => handleCategoryChange(cat)}
      >
        {cat}
      </button>
    {/each}
  </div>

  <!-- Content (Scrollable but height-constrained) -->
  <div class="stocks-content max-h-[160px] overflow-y-auto no-scrollbar p-2">
    {#if loading && stocks.length === 0}
      <div class="space-y-2">
        {#each Array(3) as _}
          <div class="h-10 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
        {/each}
      </div>
    {:else if error && stocks.length === 0}
      <div class="py-6 text-center text-[10px] text-red-500/50">{error}</div>
    {:else}
      <div class="grid grid-cols-1 gap-1">
        {#each stocks as stock}
          <div
            class="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/10 transition-colors"
          >
            <div class="flex flex-col">
              <span
                class="text-[11px] font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight"
              >
                {stock.symbol.includes(':')
                  ? stock.symbol.split(':')[1].replace('USDT', '')
                  : stock.symbol.replace('OANDA:', '').replace('FX:', '')}
              </span>
              <span class="text-[8px] text-gray-400 dark:text-gray-500 truncate max-w-[60px]"
                >FINNHUB</span
              >
            </div>

            <div class="flex flex-col items-end">
              <span class="text-[11px] font-mono font-bold text-gray-900 dark:text-gray-50">
                {stock.price > 1
                  ? stock.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : stock.price.toFixed(4)}
              </span>
              <div
                class={`text-[9px] font-bold ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {stock.change >= 0 ? '+' : ''}{stock.percentChange.toFixed(2)}%
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .stocks-widget {
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    min-width: 200px;
  }

  :global(.dark) .stocks-widget {
    background: rgba(15, 23, 42, 0.2);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
