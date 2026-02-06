<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fetchStocks, getCachedStocks, type StockQuote } from '../../lib/services/stocks';
  import { translations, t } from '../../lib/i18n';
  import { formatCurrency } from '../../lib/utils/formatting';
  import { financeStore } from '../../lib/stores/financeStore';

  let stocks: StockQuote[] = [];
  let loading = true;
  let error: string | null = null;
  let interval: any;

  async function loadStocks() {
    loading = true;
    try {
      const data = await fetchStocks();
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

  onMount(() => {
    const cached = getCachedStocks();
    if (cached) {
      stocks = cached;
      loading = false;
    }
    loadStocks();
    // Refresh every 5 minutes to stay within free tier limits easily
    interval = setInterval(loadStocks, 5 * 60 * 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="stocks-widget premium-card p-4 transition-all duration-300 hover:shadow-lg">
  <div class="flex items-center justify-between mb-4">
    <h3
      class="text-sm font-extrabold flex items-center gap-2 tracking-tight"
      style="color: var(--text-primary);"
    >
      <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
      <span class="uppercase opacity-80">{t($translations, 'stocksTitle', 'Markets')}</span>
    </h3>
    <button
      on:click={loadStocks}
      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90"
      title="Refresh"
    >
      <svg
        class={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`}
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

  {#if loading && stocks.length === 0}
    <div class="space-y-3">
      {#each Array(4) as _}
        <div class="h-12 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl animate-pulse"></div>
      {/each}
    </div>
  {:else if error && stocks.length === 0}
    <div class="flex flex-col items-center justify-center py-8 text-center">
      <div class="text-red-500/50 mb-2">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p class="text-xs font-medium text-gray-500">{error}</p>
    </div>
  {:else}
    <div class="stocks-grid">
      {#each stocks as stock}
        <div
          class="stock-item flex items-center justify-between p-3 rounded-xl hover:bg-white/50 dark:hover:bg-black/20 transition-colors group"
        >
          <div class="flex flex-col">
            <span
              class="symbol text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider"
            >
              {stock.symbol.includes(':')
                ? stock.symbol.split(':')[1].replace('USDT', '')
                : stock.symbol}
            </span>
            <span class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Finnhub</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="price text-sm font-mono font-bold text-gray-900 dark:text-gray-50">
              ${stock.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <div
              class={`flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.5 rounded-md ${stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
            >
              <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                {#if stock.change >= 0}
                  <path d="M7 14l5-5 5 5z" />
                {:else}
                  <path d="M7 10l5 5 5-5z" />
                {/if}
              </svg>
              {Math.abs(stock.percentChange).toFixed(2)}%
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .stocks-widget {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  }

  :global(.dark) .stocks-widget {
    background: rgba(15, 23, 42, 0.3);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .stocks-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
</style>
