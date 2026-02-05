<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { translations } from '../../lib/i18n';
  import { uiStore } from '../../lib/stores/uiStore';
  import { formatCurrency, formatISODateForDisplay } from '../../lib/utils/formatting';
  import type { Expense, Currency } from '../../lib/types';
  import VirtualList from '../ui/VirtualList.svelte';

  export let expenses: Expense[] = [];
  export let currency: Currency;
  export let exchangeRate: number;

  const dispatch = createEventDispatcher();

  $: currentTranslations = $translations;
  $: language = $uiStore.language;
  $: monthsArray = Array.isArray(currentTranslations['months'])
    ? currentTranslations['months']
    : undefined;

  function handleEdit(expenseId: string) {
    dispatch('edit', expenseId);
  }

  function handleDelete(expenseId: string) {
    dispatch('delete', expenseId);
  }
</script>

<div class="expenses-table-container">
  <table class="expenses-table">
    <thead>
      <tr>
        <th class="col-date">{currentTranslations['date'] || 'Date'}</th>
        <th class="col-category">{currentTranslations['category'] || 'Category'}</th>
        <th class="col-name">{currentTranslations['name'] || 'Name'}</th>
        <th class="col-amount">{currentTranslations['amount'] || 'Amount'}</th>
        <th class="col-actions">{currentTranslations['actions'] || 'Actions'}</th>
      </tr>
    </thead>
  </table>

  <VirtualList
    items={expenses}
    itemHeight={60}
    bufferSize={10}
    containerHeight="calc(100vh - 300px)"
    threshold={50}
    let:item={expense}
  >
    <table class="expenses-table expenses-table-body">
      <tbody>
        <tr class="expense-row">
          <td class="col-date" data-label={currentTranslations['date'] || 'Date'}>
            {formatISODateForDisplay(expense.date, language, monthsArray)}
          </td>
          <td class="col-category" data-label={currentTranslations['category'] || 'Category'}>
            <span class="category-badge">{expense.category}</span>
          </td>
          <td class="col-name" data-label={currentTranslations['name'] || 'Name'}>
            {expense.name}
          </td>
          <td class="col-amount" data-label={currentTranslations['amount'] || 'Amount'}>
            <span class="amount-value">
              {formatCurrency(expense.amount, currency, exchangeRate)}
            </span>
          </td>
          <td class="col-actions" data-label={currentTranslations['actions'] || 'Actions'}>
            <div class="action-buttons">
              <button
                class="btn-action btn-edit"
                on:click={() => handleEdit(expense.id)}
                aria-label={currentTranslations['edit'] || 'Edit'}
                title={currentTranslations['edit'] || 'Edit'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                class="btn-action btn-delete"
                on:click={() => handleDelete(expense.id)}
                aria-label={currentTranslations['delete'] || 'Delete'}
                title={currentTranslations['delete'] || 'Delete'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </VirtualList>
</div>

<style>
  .expenses-table-container {
    width: 100%;
    padding: 1rem;
  }

  .expenses-table {
    width: 100%;
    border-collapse: collapse;
    background: transparent;
  }

  .expenses-table-body {
    display: table;
    table-layout: fixed;
  }

  .expenses-table thead {
    background: rgba(102, 126, 234, 0.1);
    backdrop-filter: blur(10px);
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .expenses-table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  }

  .expenses-table tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .expenses-table tbody tr:hover {
    background: rgba(102, 126, 234, 0.05);
  }

  .expenses-table td {
    padding: 1rem;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .col-date {
    width: 15%;
    min-width: 120px;
  }

  .col-category {
    width: 20%;
    min-width: 120px;
  }

  .col-name {
    width: 35%;
    min-width: 150px;
  }

  .col-amount {
    width: 15%;
    min-width: 100px;
    text-align: right;
  }

  .col-actions {
    width: 15%;
    min-width: 100px;
    text-align: center;
  }

  .category-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }

  .amount-value {
    font-weight: 600;
    color: #059669;
    font-variant-numeric: tabular-nums;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
  }

  .btn-action svg {
    width: 1rem;
    height: 1rem;
  }

  .btn-edit {
    color: #3b82f6;
  }

  .btn-edit:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
  }

  .btn-delete {
    color: #ef4444;
  }

  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }

  .btn-action:active {
    transform: scale(0.95);
  }

  /* Dark mode styles */
  :global(.dark) .expenses-table thead {
    background: rgba(251, 191, 36, 0.1);
  }

  :global(.dark) .expenses-table th {
    color: #d1d5db;
    border-bottom-color: rgba(251, 191, 36, 0.2);
  }

  :global(.dark) .expenses-table tbody tr {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }

  :global(.dark) .expenses-table tbody tr:hover {
    background: rgba(251, 191, 36, 0.05);
  }

  :global(.dark) .expenses-table td {
    color: #f3f4f6;
  }

  :global(.dark) .category-badge {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }

  :global(.dark) .amount-value {
    color: #10b981;
  }

  :global(.dark) .btn-edit {
    color: #60a5fa;
  }

  :global(.dark) .btn-edit:hover {
    background: rgba(96, 165, 250, 0.1);
    color: #93c5fd;
  }

  :global(.dark) .btn-delete {
    color: #f87171;
  }

  :global(.dark) .btn-delete:hover {
    background: rgba(248, 113, 113, 0.1);
    color: #fca5a5;
  }

  /* Mobile responsive - card layout */
  @media (max-width: 768px) {
    .expenses-table-container {
      padding: 0.5rem;
    }

    .expenses-table thead {
      display: none;
    }

    .expenses-table,
    .expenses-table tbody,
    .expenses-table tr,
    .expenses-table td {
      display: block;
      width: 100%;
    }

    .expense-row {
      margin-bottom: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    :global(.dark) .expense-row {
      background: rgba(31, 41, 55, 0.8);
      border-color: rgba(255, 255, 255, 0.05);
    }

    .expenses-table td {
      padding: 0.5rem 0;
      text-align: left !important;
      border: none;
    }

    .expenses-table td::before {
      content: attr(data-label);
      display: block;
      font-weight: 600;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    :global(.dark) .expenses-table td::before {
      color: #9ca3af;
    }

    .col-actions {
      padding-top: 1rem;
      margin-top: 0.5rem;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    :global(.dark) .col-actions {
      border-top-color: rgba(255, 255, 255, 0.05);
    }

    .action-buttons {
      justify-content: flex-start;
    }

    .btn-action {
      width: 2.5rem;
      height: 2.5rem;
    }

    .btn-action svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
</style>
