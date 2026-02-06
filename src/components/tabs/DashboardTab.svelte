<script lang="ts">
  import { financeStore } from '../../lib/stores/financeStore';
  import type { Expense } from '../../lib/types';
  import { formatCurrency } from '../../lib/utils/formatting';
  import { uiStore } from '../../lib/stores/uiStore';
  import { translations, t } from '../../lib/i18n';
  import { onMount, onDestroy, tick } from 'svelte';
  import SummaryCards from '../dashboard/SummaryCards.svelte';
  import NewsWidget from '../dashboard/NewsWidget.svelte';
  import StocksWidget from '../dashboard/StocksWidget.svelte';
  import type { SvelteComponentTyped } from 'svelte';

  // Subscribe to stores
  $: selectedMonthId = $financeStore.selectedMonthId;

  $: currency = $financeStore.currency;
  $: exchangeRate = $financeStore.exchangeRate;

  // Dashboard date/time - УДАЛЕНО (теперь в Header)
  // let now = new Date();
  // let datetimeInterval: number | null = null;

  // Dashboard chart
  let expensesChartCanvas: HTMLCanvasElement | null = null;
  let chartDrawScheduled = false;

  // Ограничение высоты колонки новостей по высоте левой колонки (контейнер «Последняя активность»)
  let leftColumnEl: HTMLDivElement | null = null;
  let newsColumnMaxHeight = 0;

  function setNewsHeight() {
    if (leftColumnEl) newsColumnMaxHeight = leftColumnEl.offsetHeight;
  }

  onMount(() => {
    setNewsHeight();
    if (leftColumnEl) {
      const ro = new ResizeObserver(() => setNewsHeight());
      ro.observe(leftColumnEl);
      return () => ro.disconnect();
    }
  });

  onDestroy(() => {
    // Datetime interval cleanup удален
  });

  function getDaysInMonth(monthId: string): number {
    const [y, m] = monthId.split('-').map(Number);
    if (!y || !m) return 30;
    return new Date(y, m, 0).getDate();
  }

  function getMonthExpenses(monthId: string, expenses: Expense[]): Expense[] {
    const prefix = `${monthId}-`;
    return expenses.filter((e) => typeof e.date === 'string' && e.date.startsWith(prefix));
  }

  $: monthExpenses = getMonthExpenses(selectedMonthId, $financeStore.expenses);
  $: daysInSelectedMonth = getDaysInMonth(selectedMonthId);

  $: dailyTotals = (() => {
    const totals = Array.from({ length: daysInSelectedMonth }, () => 0);
    for (const e of monthExpenses) {
      const dayStr = (e.date ?? '').slice(8, 10);
      const day = Number(dayStr);
      if (!Number.isFinite(day) || day < 1 || day > daysInSelectedMonth) continue;
      totals[day - 1] = (totals[day - 1] ?? 0) + e.amount;
    }
    return totals;
  })();

  $: maxDailyTotal = dailyTotals.reduce((m, v) => (v > m ? v : m), 0);

  function scheduleChartDraw() {
    if (chartDrawScheduled) return;
    chartDrawScheduled = true;
    tick().then(() => {
      chartDrawScheduled = false;
      drawExpensesChart();
    });
  }

  function drawExpensesChart() {
    if (!expensesChartCanvas) return;

    const canvas = expensesChartCanvas;
    const container = canvas.parentElement;
    if (!container) return;

    const cssWidth = Math.max(1, container.clientWidth);
    const cssHeight = Math.max(1, container.clientHeight);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const padding = 16;
    const w = Math.max(1, cssWidth - padding * 2);
    const h = Math.max(1, cssHeight - padding * 2);

    // Grid
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    const rows = 4;
    for (let i = 0; i <= rows; i++) {
      const y = padding + (h * i) / rows;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + w, y);
      ctx.stroke();
    }

    if (dailyTotals.length === 0 || maxDailyTotal <= 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText(t($translations, 'emptyExpenses', 'Нет расходов'), padding, padding + 14);
      return;
    }

    // Line
    const stepX = w / Math.max(1, dailyTotals.length - 1);
    const yScale = h / maxDailyTotal;

    const gradient = ctx.createLinearGradient(padding, padding, padding + w, padding);
    gradient.addColorStop(0, 'rgba(244, 196, 48, 0.95)');
    gradient.addColorStop(0.5, 'rgba(129, 140, 248, 0.95)');
    gradient.addColorStop(1, 'rgba(244, 196, 48, 0.95)');

    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    for (let i = 0; i < dailyTotals.length; i++) {
      const x = padding + stepX * i;
      const value = dailyTotals[i] ?? 0;
      const y = padding + h - value * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill
    const fillGrad = ctx.createLinearGradient(0, padding, 0, padding + h);
    fillGrad.addColorStop(0, 'rgba(244, 196, 48, 0.18)');
    fillGrad.addColorStop(1, 'rgba(244, 196, 48, 0)');
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    for (let i = 0; i < dailyTotals.length; i++) {
      const x = padding + stepX * i;
      const value = dailyTotals[i] ?? 0;
      const y = padding + h - value * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(padding + w, padding + h);
    ctx.lineTo(padding, padding + h);
    ctx.closePath();
    ctx.fill();
  }

  $: {
    dailyTotals;
    maxDailyTotal;
    scheduleChartDraw();
  }

  // dashTime и dashDate удалены - теперь в Header

  // Handle month change - УДАЛЕНО (теперь в Header)
  // function handleMonthChange(event: Event) {
  //   const target = event.target as HTMLSelectElement;
  //   financeStore.setSelectedMonthId(target.value);
  // }

  // Open calculator modal
  function openCalculator() {
    uiStore.openModal('calculator');
  }

  // Open shopping list modal
  function openShoppingList() {
    uiStore.openModal('shoppingList');
  }

  function openExpenseModal() {
    uiStore.openModal('expense');
  }

  function openDebtModal() {
    uiStore.openModal('debt');
  }

  function openRecurringModal() {
    uiStore.openModal('recurring');
  }

  function openTaskModal() {
    uiStore.openModal('dailyTask');
  }

  $: recentExpenses = [...monthExpenses]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 6);
</script>

<!-- Dashboard Header: Title & Buttons -->
<div class="flex items-center justify-between mb-4 gap-3">
  <!-- Left: Title & Buttons -->
  <div class="flex items-center gap-3 justify-start">
    <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
      {t($translations, 'dashboardTitle')}
    </h2>
    <button
      id="calculator-btn"
      class="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      title="Калькулятор"
      on:click={openCalculator}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    </button>
    <button
      id="shopping-list-btn"
      class="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500 text-white hover:from-green-600 hover:via-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      title="Список покупок"
      on:click={openShoppingList}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    </button>
  </div>
</div>

<SummaryCards />

<!-- Dashboard Lower Area (Ordina 1 structure) -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-stretch mt-0">
  <!-- Left column: chart + quick actions + recent expenses -->
  <div class="space-y-4 flex flex-col" id="dashboard-left-column" bind:this={leftColumnEl}>
    <div id="expense-chart-container" class="premium-card p-4 flex flex-col">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold" style="color: var(--text-primary);">
          {t($translations, 'chartLabel', 'Расходы')}
        </h3>
        <div class="text-sm font-semibold" style="color: var(--accent-gold);">
          {formatCurrency(
            monthExpenses.reduce((s, e) => s + e.amount, 0),
            currency,
            exchangeRate,
          )}
        </div>
      </div>
      <div class="h-48 lg:h-80 w-full">
        <canvas id="expenses-chart" bind:this={expensesChartCanvas}></canvas>
      </div>
    </div>

    <div class="premium-card p-4">
      <h3 class="text-lg font-semibold mb-3" style="color: var(--text-primary);">
        {t($translations, 'quickActionsTitle', 'Быстрые действия')}
      </h3>
      <div class="grid grid-cols-2 gap-2">
        <button
          class="premium-btn bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 text-sm rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          on:click={openExpenseModal}
          type="button"
        >
          {t($translations, 'addExpense')}
        </button>
        <button
          class="premium-btn bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 text-sm rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          on:click={openTaskModal}
          type="button"
        >
          {t($translations, 'addTask')}
        </button>
        <button
          class="premium-btn bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 text-sm rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          on:click={openDebtModal}
          type="button"
        >
          {t($translations, 'addDebt')}
        </button>
        <button
          class="premium-btn bg-gradient-to-r from-orange-600 to-orange-700 text-white px-3 py-2 text-sm rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          on:click={openRecurringModal}
          type="button"
        >
          {t($translations, 'addTemplate')}
        </button>
      </div>
    </div>

    <div id="recent-activity-container" class="premium-card p-4">
      <h3 class="text-lg font-semibold mb-3" style="color: var(--text-primary);">
        {t($translations, 'lastActivity', 'Последняя активность')}
      </h3>
      <div id="recent-activity" class="space-y-2">
        {#if recentExpenses.length === 0}
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{t($translations, 'noRecentActivity', 'Нет недавней активности')}</span>
          </div>
        {:else}
          {#each recentExpenses as exp}
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {exp.name}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {exp.date}
                </div>
              </div>
              <div class="text-sm font-semibold whitespace-nowrap" style="color: var(--gold-text);">
                {formatCurrency(exp.amount, currency, exchangeRate)}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <!-- Right column: News widget — высота ограничена высотой левой колонки -->
  <div
    class="flex flex-col min-h-0 overflow-hidden gap-4"
    id="dashboard-right-column"
    style={newsColumnMaxHeight ? `max-height: ${newsColumnMaxHeight}px; height: 100%` : ''}
  >
    <StocksWidget />
    <div class="flex-1 min-h-0">
      <NewsWidget />
    </div>
  </div>
</div>
