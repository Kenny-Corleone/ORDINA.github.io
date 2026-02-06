<script lang="ts">
  import { financeStore, totalExpenses, remainingDebts } from '../../lib/stores/financeStore';
  import {
    incompleteMonthlyTasks,
    incompleteYearlyTasks,
    incompleteDailyTasks,
  } from '../../lib/stores/tasksStore';
  import { uiStore } from '../../lib/stores/uiStore';
  import { translations, t } from '../../lib/i18n';
  import { formatCurrency } from '../../lib/utils/formatting';

  $: currency = $financeStore.currency;
  $: exchangeRate = $financeStore.exchangeRate;

  // Recurring paid/remaining (match Ordina 1 terminology)
  $: recurringPaidTotal = $financeStore.recurringTemplates
    .filter((tpl) => ($financeStore.recurringStatuses[tpl.id] || 'pending') === 'paid')
    .reduce((sum, tpl) => sum + tpl.amount, 0);

  $: recurringRemainingTotal = $financeStore.recurringTemplates
    .filter((tpl) => {
      const status = $financeStore.recurringStatuses[tpl.id] || 'pending';
      return status !== 'paid' && status !== 'skipped';
    })
    .reduce((sum, tpl) => sum + tpl.amount, 0);

  // Tasks counters
  $: tasksRemainingMonth = $incompleteMonthlyTasks.length;
  $: tasksRemainingYear = $incompleteYearlyTasks.length;

  // Tasks preview list (top panel)
  $: tasksPreview = $incompleteDailyTasks.slice(0, 4);
</script>

<div>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 auto-rows-fr">
    <div class="stat-card flex flex-col justify-center">
      <h3
        class="text-xs uppercase tracking-wider font-semibold mb-1.5 text-gray-500 dark:text-gray-400"
      >
        {t($translations, 'dashRecurringPaid')}
      </h3>
      <p class="text-xl font-bold" style="color: var(--gold-text);">
        {formatCurrency(recurringPaidTotal, currency, exchangeRate)}
      </p>
    </div>

    <div class="stat-card flex flex-col justify-center">
      <h3
        class="text-xs uppercase tracking-wider font-semibold mb-1.5 text-gray-500 dark:text-gray-400"
      >
        {t($translations, 'dashRecurringRemaining')}
      </h3>
      <p class="text-xl font-bold" style="color: var(--gold-text);">
        {formatCurrency(recurringRemainingTotal, currency, exchangeRate)}
      </p>
    </div>

    <div class="stat-card flex flex-col justify-center">
      <h3
        class="text-xs uppercase tracking-wider font-semibold mb-1.5 text-gray-500 dark:text-gray-400"
      >
        {t($translations, 'dashMonthlyExpenses')}
      </h3>
      <p class="text-xl font-bold" style="color: var(--gold-text);">
        {formatCurrency($totalExpenses, currency, exchangeRate)}
      </p>
    </div>

    <div class="stat-card flex flex-col justify-center">
      <h3
        class="text-xs uppercase tracking-wider font-semibold mb-1.5 text-gray-500 dark:text-gray-400"
      >
        {t($translations, 'dashTotalDebt')}
      </h3>
      <p class="text-xl font-bold" style="color: var(--gold-text);">
        {formatCurrency($remainingDebts, currency, exchangeRate)}
      </p>
    </div>

    <div class="stat-card flex flex-col justify-center">
      <h3
        class="text-xs uppercase tracking-wider font-semibold mb-1.5 text-gray-500 dark:text-gray-400"
      >
        {t($translations, 'dashTasksMonth')}
      </h3>
      <p class="text-xl font-bold" style="color: var(--gold-text);">
        {tasksRemainingMonth}
      </p>
    </div>

    <div
      id="dashboard-tasks-panel-top"
      class="stat-card flex flex-col overflow-hidden relative group cursor-pointer hover:shadow-md transition-all"
      role="button"
      tabindex="0"
      on:click={() => uiStore.setActiveTab('tasks')}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          uiStore.setActiveTab('tasks');
        }
      }}
    >
      <div class="flex justify-between items-center mb-1.5">
        <h3 class="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
          {t($translations, 'tabTasks')}
        </h3>
        <span class="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >Все →</span
        >
      </div>
      <div
        id="dashboard-tasks-list-top"
        class="overflow-y-auto flex-grow text-xs space-y-1 scrollbar-hide"
      >
        {#if tasksPreview.length === 0}
          <div class="text-gray-400 text-center py-1 text-xs">Нет задач</div>
        {:else}
          {#each tasksPreview as task}
            <div class="text-gray-700 dark:text-gray-300 truncate">{task.name}</div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <div class="stat-card">
    <h3
      class="text-xs uppercase tracking-wider font-semibold mb-1.5 text-gray-500 dark:text-gray-400"
    >
      {t($translations, 'dashTasksYear')}
    </h3>
    <p class="text-xl font-bold" style="color: var(--gold-text);">
      {tasksRemainingYear}
    </p>
  </div>
</div>
