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
        stocks = data;
        error = null;
      } else if (stocks.length === 0) {
        error = t($translations, 'stocksError', 'Failed to load data');
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

  function getDisplayName(symbol: string): string {
    // Indices mapping
    if (symbol === '^GSPC') return 'S&P 500';
    if (symbol === '^IXIC') return 'Nasdaq';
    if (symbol === '^DJI') return 'Dow Jones';
    if (symbol === '^FTSE') return 'FTSE 100';
    if (symbol === '^N225') return 'Nikkei 225';

    if (symbol.startsWith('FX:')) {
      const pair = symbol.replace('FX:', '');
      return `${pair.slice(0, 3)} / ${pair.slice(3)}`;
    }
    if (symbol.startsWith('BINANCE:')) return symbol.replace('BINANCE:', '').replace('USDT', '');
    if (symbol.startsWith('OANDA:')) {
      const name = symbol.replace('OANDA:', '');
      if (name === 'XAU_USD') return 'GOLD';
      if (name === 'BCO_USD') return 'BRENT OIL';
      // Currency pairs in OANDA format USD_AZN
      if (name.includes('_')) return name.replace('_', ' / ');
      return name;
    }
    if (symbol.startsWith('MCX:')) return symbol.replace('MCX:', '');
    return symbol;
  }

  // Reload when language changes if in LOCAL category
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
    interval = setInterval(() => loadStocks(), 3 * 60 * 1000);
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
      title="Refresh Markets"
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
    <!-- Manual Local Tab first -->
    <button
      class={`tab-item px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tighter transition-all whitespace-nowrap border ${activeCategory === 'LOCAL' ? 'active-tab' : 'inactive-tab'}`}
      on:click={() => handleCategoryChange('LOCAL')}
    >
      {currentLang === 'ru' ? 'МОСБИРЖА' : 'LOCAL'}
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

  <div class="grid-content max-h-[150px] overflow-y-auto no-scrollbar p-3 space-y-2">
    {#if loading && stocks.length === 0}
      <div class="space-y-4 py-4">
        {#each Array(3) as _}
          <div class="loading-bar"></div>
        {/each}
      </div>
    {:else if error && stocks.length === 0}
      <div class="flex flex-col items-center justify-center py-10 opacity-40">
        <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          ><path
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          /></svg
        >
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
                {getDisplayName(stock.symbol)}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-[8px] font-bold text-white/30 uppercase tracking-widest"
                  >Finnhub</span
                >
                {#if stock.symbol.includes('AZN')}
                  <span
                    class="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20"
                    >BAKU</span
                  >
                {/if}
              </div>
            </div>

            <div class="flex flex-col items-end gap-0.5">
              <span class="text-sm font-mono font-bold tracking-tighter text-white">
                {stock.price > 1000
                  ? stock.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : stock.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
              </span>
              <div
                class={`flex items-center gap-1 text-[10px] font-black ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {stock.change >= 0 ? '+' : ''}{Math.abs(stock.percentChange).toFixed(2)}%
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between">
    <span class="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]"
      >Market Data 15m delay</span
    >
    <div class="flex gap-1">
      <div class="w-1 h-1 rounded-full bg-emerald-500/40"></div>
    </div>
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
