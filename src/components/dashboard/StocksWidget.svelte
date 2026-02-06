<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    fetchStocks,
    getCachedStocks,
    STOCK_CATEGORIES,
    LOCAL_SYMBOLS,
    type StockQuote,
  } from '../../lib/services/stocks';
  import { translations, t } from '../../lib/i18n';
  import { uiStore } from '../../lib/stores/uiStore';

  let stocks: StockQuote[] = [];
  let loading = true;
  let error: string | null = null;
  let interval: any;
  let activeCategory: string = 'CURRENCIES';

  $: currentLang = $uiStore.language;

  async function loadStocks(force = false) {
    if (force) loading = true;
    try {
      let symbols: string[] = [];

      if (activeCategory === 'LOCAL') {
        symbols = LOCAL_SYMBOLS[currentLang] || LOCAL_SYMBOLS['en'];
      } else {
        symbols = STOCK_CATEGORIES[activeCategory as keyof typeof STOCK_CATEGORIES] || [];
      }

      const data = await fetchStocks(symbols);
      if (data.length > 0) {
        // Sort to match requested symbol order if possible
        stocks = data;
        error = null;
      } else if (stocks.length === 0) {
        error = t($translations, 'stocksError', 'Service Unavailable');
      }
    } catch (e) {
      error = t($translations, 'stocksError', 'Market data error');
    } finally {
      loading = false;
    }
  }

  function handleCategoryChange(cat: string) {
    activeCategory = cat;
    stocks = [];
    loadStocks(true);
  }

  // Language change reload for LOCAL tab
  $: if (currentLang && activeCategory === 'LOCAL') {
    loadStocks(true);
  }

  onMount(() => {
    const cached = getCachedStocks();
    if (cached) {
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

<div class="stocks-container premium-card glass-morphism overflow-hidden">
  <div class="header-band p-4 flex items-center justify-between border-b border-white/10">
    <div class="flex items-center gap-3">
      <div
        class="pulse-icon w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
      ></div>
      <h3 class="text-xs font-black uppercase tracking-[0.2em] text-white/90">
        MARKETS <span class="text-white/30 font-light">Live</span>
      </h3>
    </div>
    <button
      on:click={() => loadStocks(true)}
      class="refresh-btn group p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5"
    >
      <svg
        class={`w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}
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

  <div class="tabs-scroll flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar bg-black/20">
    <button
      class={`tab-item px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tighter transition-all whitespace-nowrap border ${activeCategory === 'LOCAL' ? 'active-tab' : 'inactive-tab'}`}
      on:click={() => handleCategoryChange('LOCAL')}
    >
      {#if currentLang === 'ru'}
        МОСБИРЖА
      {:else if currentLang === 'az'}
        BAKU
      {:else if currentLang === 'it'}
        BORSA ITAL.
      {:else}
        US MARKET
      {/if}
    </button>
    {#each Object.keys(STOCK_CATEGORIES) as cat}
      <button
        class={`tab-item px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tighter transition-all whitespace-nowrap border ${activeCategory === cat ? 'active-tab' : 'inactive-tab'}`}
        on:click={() => handleCategoryChange(cat)}
      >
        {cat}
      </button>
    {/each}
  </div>

  <div class="grid-content max-h-[160px] overflow-y-auto no-scrollbar p-3 space-y-2">
    {#if loading && stocks.length === 0}
      <div class="space-y-4 py-4">
        {#each Array(3) as _}
          <div class="loading-bar"></div>
        {/each}
      </div>
    {:else if error && stocks.length === 0}
      <div class="flex flex-col items-center justify-center py-10 opacity-40">
        <span class="text-[10px] uppercase font-bold text-white">{error}</span>
      </div>
    {:else}
      <div class="space-y-1.5">
        {#each stocks as stock}
          <div
            class="stock-row flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-all border border-white/[0.03] group"
          >
            <div class="flex flex-col gap-0.5">
              <span
                class="text-[11px] font-black text-white group-hover:text-amber-400 transition-colors"
              >
                {stock.symbol}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-[8px] font-bold text-white/30 uppercase tracking-widest"
                  >{stock.provider || 'Live'}</span
                >
                {#if stock.symbol.includes('AZN')}
                  <span
                    class="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20"
                    >AZ</span
                  >
                {/if}
              </div>
            </div>

            <div class="flex flex-col items-end gap-0.5">
              <span class="text-sm font-mono font-bold tracking-tighter text-white">
                {stock.price > 100
                  ? stock.price.toLocaleString(undefined, { maximumFractionDigits: 1 })
                  : stock.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
              </span>
              <div
                class={`flex items-center gap-1 text-[10px] font-black ${stock.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {#if stock.percentChange !== 0}
                  {stock.percentChange > 0 ? '+' : ''}{stock.percentChange.toFixed(2)}%
                {:else}
                  <span class="text-white/20">---</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="px-4 py-1.5 bg-white/5 border-t border-white/5 flex items-center justify-between">
    <span class="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]"
      >Real-time Market Data</span
    >
    <div class="w-1 h-1 rounded-full bg-emerald-500/40"></div>
  </div>
</div>

<style>
  .stocks-container {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  }

  .glass-morphism {
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .active-tab {
    background: #f59e0b;
    color: #000;
    border-color: #fbbf24;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  .inactive-tab {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .inactive-tab:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .loading-bar {
    height: 40px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.03) 100%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 12px;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .pulse-icon {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
</style>
