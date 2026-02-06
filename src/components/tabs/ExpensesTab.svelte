<script lang="ts">
  import { financeStore } from '../../lib/stores/financeStore';
  import { uiStore } from '../../lib/stores/uiStore';
  import { userStore } from '../../lib/stores/userStore';
  import { translations } from '../../lib/i18n';
  import { deleteExpense } from '../../lib/services/firebase/expenses';
  import { exportExpensesToCSV } from '../../lib/services/export';
  // MonthSelector удален - теперь в Header
  import CurrencyToggle from '../ui/CurrencyToggle.svelte';
  import ExpensesTable from '../expenses/ExpensesTable.svelte';
  import EmptyState from '../ui/EmptyState.svelte';

  // Subscribe to stores
  $: expenses = $financeStore.expenses;
  $: selectedMonthId = $financeStore.selectedMonthId;
  $: currency = $financeStore.currency;
  $: exchangeRate = $financeStore.exchangeRate;
  $: userId = $userStore.userId;
  $: currentTranslations = $translations;

  // Sort expenses by date descending (newest first)
  $: sortedExpenses = [...expenses].sort((a, b) => {
    return b.date.localeCompare(a.date);
  });

  // Handle add expense
  function handleAddExpense() {
    uiStore.openModal('expense');
  }

  // Handle edit expense
  function handleEditExpense(expenseId: string) {
    uiStore.openModal('expense', { editId: expenseId });
  }

  // Handle delete expense
  async function handleDeleteExpense(expenseId: string) {
    if (!userId) return;

    const confirmed = confirm(
      currentTranslations['confirm_delete_expense'] ||
        'Are you sure you want to delete this expense?',
    );
    if (!confirmed) return;

    try {
      await deleteExpense(userId, selectedMonthId, expenseId);
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert(
        currentTranslations['error_delete_expense'] ||
          'Failed to delete expense. Please try again.',
      );
    }
  }

  // Handle CSV export
  function handleExportCSV() {
    try {
      const filename = `expenses_${selectedMonthId}.csv`;
      exportExpensesToCSV(sortedExpenses, { filename });
    } catch (error) {
      console.error('Error exporting expenses:', error);
      alert(currentTranslations['error_export'] || 'Failed to export expenses. Please try again.');
    }
  }
</script>

<div class="expenses-tab">
  <!-- Header with controls -->
  <div class="expenses-header">
    <div class="header-left">
      <h2 class="tab-title">
        {currentTranslations['expenses'] || 'Expenses'}
      </h2>
      <!-- MonthSelector удален - теперь в Header -->
    </div>

    <div class="header-right">
      <CurrencyToggle />
      <button
        class="btn-export"
        on:click={handleExportCSV}
        disabled={sortedExpenses.length === 0}
        aria-label={currentTranslations['export_csv'] || 'Export to CSV'}
      >
        <svg
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {currentTranslations['export'] || 'Export'}
      </button>
      <button
        class="btn-add"
        on:click={handleAddExpense}
        aria-label={currentTranslations['add_expense'] || 'Add Expense'}
      >
        <svg
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {currentTranslations['add_expense'] || 'Add Expense'}
      </button>
    </div>
  </div>

  <!-- Content area -->
  <div class="expenses-content">
    {#if sortedExpenses.length === 0}
      <EmptyState
        icon="💰"
        message={currentTranslations['no_expenses'] || 'No expenses yet'}
        description={currentTranslations['no_expenses_desc'] ||
          'Add your first expense to start tracking your spending'}
      />
    {:else}
      <ExpensesTable
        expenses={sortedExpenses}
        {currency}
        {exchangeRate}
        on:edit={(e) => handleEditExpense(e.detail)}
        on:delete={(e) => handleDeleteExpense(e.detail)}
      />
    {/if}
  </div>
</div>

<style>
  .expenses-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0.75rem 1rem; /* УМЕНЬШЕНО: было 1.5rem */
    gap: 1rem; /* УМЕНЬШЕНО: было 1.5rem */
  }

  .expenses-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .tab-title {
    font-size: 1.875rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .btn-export,
  .btn-add {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .btn-export {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    color: #667eea;
    border: 2px solid rgba(102, 126, 234, 0.2);
  }

  .btn-export:hover:not(:disabled) {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  .btn-export:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-add {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-add:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a4291 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }

  .btn-export:active,
  .btn-add:active {
    transform: translateY(0);
  }

  .icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .expenses-content {
    flex: 1;
    overflow: auto;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }

  /* Dark mode styles */
  :global(.dark) .tab-title {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global(.dark) .btn-export {
    background: rgba(31, 41, 55, 0.9);
    color: #fbbf24;
    border-color: rgba(251, 191, 36, 0.2);
  }

  :global(.dark) .btn-export:hover:not(:disabled) {
    background: rgba(31, 41, 55, 1);
    border-color: rgba(251, 191, 36, 0.4);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
  }

  :global(.dark) .btn-add {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1f2937;
  }

  :global(.dark) .btn-add:hover {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
  }

  :global(.dark) .expenses-content {
    background: rgba(31, 41, 55, 0.6);
    border-color: rgba(75, 85, 99, 0.8);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .expenses-tab {
      padding: 1rem;
    }

    .expenses-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-left,
    .header-right {
      width: 100%;
      justify-content: space-between;
    }

    .tab-title {
      font-size: 1.5rem;
    }

    .btn-export,
    .btn-add {
      flex: 1;
      justify-content: center;
    }
  }
</style>
