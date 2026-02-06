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

<div class="summary-container">
  <!-- Section 1: Financial Overview -->
  <div class="summary-grid">
    <!-- Recurring Paid -->
    <div class="summary-card glass-panel" style="--accent: #10b981;">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="card-content">
        <div class="card-label">{t($translations, 'dashRecurringPaid')}</div>
        <div class="card-value text-emerald-500">
          {formatCurrency(recurringPaidTotal, currency, exchangeRate)}
        </div>
      </div>
    </div>

    <!-- Recurring Remaining -->
    <div class="summary-card glass-panel" style="--accent: #f59e0b;">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="card-content">
        <div class="card-label">{t($translations, 'dashRecurringRemaining')}</div>
        <div class="card-value text-amber-500">
          {formatCurrency(recurringRemainingTotal, currency, exchangeRate)}
        </div>
      </div>
    </div>

    <!-- Monthly Expenses -->
    <div class="summary-card glass-panel" style="--accent: #ef4444;">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 0 0 7H6"></path>
        </svg>
      </div>
      <div class="card-content">
        <div class="card-label">{t($translations, 'dashMonthlyExpenses')}</div>
        <div class="card-value text-red-500">
          {formatCurrency($totalExpenses, currency, exchangeRate)}
        </div>
      </div>
    </div>

    <!-- Total Debt -->
    <div class="summary-card glass-panel" style="--accent: #8b5cf6;">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      </div>
      <div class="card-content">
        <div class="card-label">{t($translations, 'dashTotalDebt')}</div>
        <div class="card-value text-violet-500">
          {formatCurrency($remainingDebts, currency, exchangeRate)}
        </div>
      </div>
    </div>
  </div>

  <!-- Section 2: Tasks (Smaller grid) -->
  <div class="summary-grid tasks-grid">
    <!-- Tasks Month -->
    <div class="summary-card glass-panel small-card" style="--accent: #3b82f6;">
      <div class="card-content centered">
        <div class="card-value-large text-blue-500">{tasksRemainingMonth}</div>
        <div class="card-label">{t($translations, 'dashTasksMonth')}</div>
      </div>
    </div>

    <!-- Tasks Year -->
    <div class="summary-card glass-panel small-card" style="--accent: #6366f1;">
      <div class="card-content centered">
        <div class="card-value-large text-indigo-500">{tasksRemainingYear}</div>
        <div class="card-label">{t($translations, 'dashTasksYear')}</div>
      </div>
    </div>

    <!-- Tasks Preview (Wide) -->
    <div
      id="dashboard-tasks-panel-top"
      class="summary-card glass-panel wide-card cursor-pointer hover-glow"
      role="button"
      tabindex="0"
      on:click={() => uiStore.setActiveTab('tasks')}
      on:keydown={(e) => e.key === 'Enter' && uiStore.setActiveTab('tasks')}
    >
      <div class="card-header">
        <div class="card-label">{t($translations, 'tabTasks')}</div>
        <svg
          class="arrow-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div class="tasks-list">
        {#if tasksPreview.length === 0}
          <div class="empty-msg">No pending tasks</div>
        {:else}
          {#each tasksPreview as task}
            <div class="task-item">
              <span class="dot"></span>
              <span class="task-name">{task.name}</span>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .summary-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    margin-bottom: 0;
  }

  /* Grid Layouts */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .summary-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Task specific grid - mixed sizes */
  .tasks-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    .tasks-grid {
      grid-template-columns: 1fr 1fr 2fr; /* 2 small, 1 wide */
    }
  }

  /* Card Styles */
  .summary-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.05),
      0 2px 4px -1px rgba(0, 0, 0, 0.03);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    min-height: 80px;
  }

  :global(.dark) .summary-card {
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }

  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-color: var(--accent, #64748b);
  }

  /* Decorative accent line */
  .summary-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--accent);
    opacity: 0.8;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(var(--accent-rgb, 0, 0, 0), 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
  }

  /* Fallback if RGB var is not easy to inject, we use opacity on the color directly if possible, or just light backgrounds */
  .card-icon {
    background: #f1f5f9;
  }
  :global(.dark) .card-icon {
    background: rgba(255, 255, 255, 0.05);
  }

  .card-icon svg {
    width: 20px;
    height: 20px;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    min-width: 0;
  }

  .card-content.centered {
    align-items: center;
    text-align: center;
  }

  .card-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  :global(.dark) .card-label {
    color: #94a3b8;
  }

  .card-value {
    font-size: 1.25rem;
    font-weight: 800;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-value-large {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
  }

  /* Wide Card for Tasks */
  .wide-card {
    grid-column: span 2;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 1.25rem;
  }

  @media (max-width: 640px) {
    .wide-card {
      grid-column: span 1;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 0.75rem;
  }

  .arrow-icon {
    width: 16px;
    height: 16px;
    opacity: 0;
    transform: translateX(-5px);
    transition: all 0.2s;
  }

  .wide-card:hover .arrow-icon {
    opacity: 1;
    transform: translateX(0);
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #334155;
  }
  :global(.dark) .task-item {
    color: #e2e8f0;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3b82f6;
  }

  .task-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
