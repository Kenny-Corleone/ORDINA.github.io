<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { translations } from '../../lib/i18n';
  import { formatCurrency } from '../../lib/utils/formatting';
  import type { Debt, Currency } from '../../lib/types';
  import VirtualList from '../ui/VirtualList.svelte';

  export let debts: Debt[] = [];
  export let currency: Currency;
  export let exchangeRate: number;

  const dispatch = createEventDispatcher();

  $: currentTranslations = $translations;

  // Local state for comment editing
  let editingComments: Record<string, string> = {};

  // Initialize editing comments from debts
  $: {
    debts.forEach((debt) => {
      if (!(debt.id in editingComments)) {
        editingComments[debt.id] = debt.comment || '';
      }
    });
  }

  function handleEdit(debtId: string) {
    dispatch('edit', debtId);
  }

  function handleDelete(debtId: string) {
    dispatch('delete', debtId);
  }

  function handleAddPayment(debtId: string) {
    dispatch('addPayment', debtId);
  }

  function handleCommentInput(debtId: string, value: string) {
    editingComments[debtId] = value;
    dispatch('commentChange', { debtId, comment: value });
  }

  function calculateRemaining(debt: Debt): number {
    return (debt.totalAmount || 0) - (debt.paidAmount || 0);
  }

  function getProgressPercentage(debt: Debt): number {
    if (!debt.totalAmount || debt.totalAmount === 0) return 0;
    return Math.min(100, Math.max(0, (debt.paidAmount / debt.totalAmount) * 100));
  }
</script>

<div class="debts-table-container">
  <table class="debts-table">
    <thead>
      <tr>
        <th class="col-name">{currentTranslations['name'] || 'Name'}</th>
        <th class="col-total">{currentTranslations['total_amount'] || 'Total'}</th>
        <th class="col-paid">{currentTranslations['paid_amount'] || 'Paid'}</th>
        <th class="col-remaining">{currentTranslations['remaining'] || 'Remaining'}</th>
        <th class="col-progress">{currentTranslations['progress'] || 'Progress'}</th>
        <th class="col-comment">{currentTranslations['comment'] || 'Comment'}</th>
        <th class="col-actions">{currentTranslations['actions'] || 'Actions'}</th>
      </tr>
    </thead>
  </table>

  <VirtualList
    items={debts}
    itemHeight={typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 80}
    bufferSize={10}
    containerHeight="calc(100vh - 300px)"
    threshold={50}
    let:item={debt}
  >
    {@const remaining = calculateRemaining(debt)}
    {@const progress = getProgressPercentage(debt)}
    {@const isPaid = remaining <= 0}
    <table class="debts-table debts-table-body">
      <tbody>
        <tr class="debt-row" class:paid={isPaid}>
          <td class="col-name" data-label={String(currentTranslations['name'] || 'Name')}>
            <span class="debt-name">{debt.name}</span>
          </td>
          <td class="col-total" data-label={String(currentTranslations['total_amount'] || 'Total')}>
            <span class="amount-value">
              {formatCurrency(debt.totalAmount, currency, exchangeRate)}
            </span>
          </td>
          <td class="col-paid" data-label={String(currentTranslations['paid_amount'] || 'Paid')}>
            <span class="amount-value paid-amount">
              {formatCurrency(debt.paidAmount, currency, exchangeRate)}
            </span>
          </td>
          <td
            class="col-remaining"
            data-label={String(currentTranslations['remaining'] || 'Remaining')}
          >
            <span class="amount-value remaining-amount" class:fully-paid={isPaid}>
              {formatCurrency(remaining, currency, exchangeRate)}
            </span>
          </td>
          <td
            class="col-progress"
            data-label={String(currentTranslations['progress'] || 'Progress')}
          >
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" class:complete={isPaid} style="width: {progress}%"></div>
              </div>
              <span class="progress-text">{progress.toFixed(0)}%</span>
            </div>
          </td>
          <td class="col-comment" data-label={String(currentTranslations['comment'] || 'Comment')}>
            <input
              type="text"
              class="comment-input"
              value={editingComments[debt.id] || ''}
              on:input={(e) => handleCommentInput(debt.id, e.currentTarget.value)}
              placeholder={String(currentTranslations['add_comment'] || 'Add comment...')}
              aria-label={String(currentTranslations['comment'] || 'Comment')}
            />
          </td>
          <td class="col-actions" data-label={String(currentTranslations['actions'] || 'Actions')}>
            <div class="action-buttons">
              <button
                class="btn-action btn-payment"
                on:click={() => handleAddPayment(debt.id)}
                aria-label={String(currentTranslations['add_payment'] || 'Add Payment')}
                title={String(currentTranslations['add_payment'] || 'Add Payment')}
                disabled={isPaid}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </button>
              <button
                class="btn-action btn-edit"
                on:click={() => handleEdit(debt.id)}
                aria-label={String(currentTranslations['edit'] || 'Edit')}
                title={String(currentTranslations['edit'] || 'Edit')}
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
                on:click={() => handleDelete(debt.id)}
                aria-label={String(currentTranslations['delete'] || 'Delete')}
                title={String(currentTranslations['delete'] || 'Delete')}
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
  .debts-table-container {
    width: 100%;
    padding: 1rem;
  }

  .debts-table {
    width: 100%;
    border-collapse: collapse;
    background: transparent;
  }

  .debts-table-body {
    display: table;
    table-layout: fixed;
  }

  .debts-table thead {
    background: rgba(102, 126, 234, 0.1);
    backdrop-filter: blur(10px);
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .debts-table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  }

  .debts-table tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .debts-table tbody tr:hover {
    background: rgba(102, 126, 234, 0.05);
  }

  .debts-table tbody tr.paid {
    opacity: 0.7;
  }

  .debts-table td {
    padding: 1rem;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .col-name {
    width: 20%;
    min-width: 150px;
  }

  .col-total,
  .col-paid,
  .col-remaining {
    width: 12%;
    min-width: 100px;
    text-align: right;
  }

  .col-progress {
    width: 15%;
    min-width: 120px;
  }

  .col-comment {
    width: 20%;
    min-width: 150px;
  }

  .col-actions {
    width: 11%;
    min-width: 120px;
    text-align: center;
  }

  .debt-name {
    font-weight: 600;
    color: #1f2937;
  }

  .amount-value {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .paid-amount {
    color: #059669;
  }

  .remaining-amount {
    color: #dc2626;
  }

  .remaining-amount.fully-paid {
    color: #059669;
  }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-bar {
    flex: 1;
    height: 0.5rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
    border-radius: 9999px;
  }

  .progress-fill.complete {
    background: linear-gradient(90deg, #059669 0%, #10b981 100%);
  }

  .progress-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    min-width: 2.5rem;
    text-align: right;
  }

  .comment-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.8);
    color: #1f2937;
    transition: all 0.2s ease;
  }

  .comment-input:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .comment-input::placeholder {
    color: #9ca3af;
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

  .btn-action:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-action svg {
    width: 1rem;
    height: 1rem;
  }

  .btn-payment {
    color: #10b981;
  }

  .btn-payment:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
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

  .btn-action:active:not(:disabled) {
    transform: scale(0.95);
  }

  /* Dark mode styles */
  :global(.dark) .debts-table thead {
    background: rgba(251, 191, 36, 0.1);
  }

  :global(.dark) .debts-table th {
    color: #d1d5db;
    border-bottom-color: rgba(251, 191, 36, 0.2);
  }

  :global(.dark) .debts-table tbody tr {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }

  :global(.dark) .debts-table tbody tr:hover {
    background: rgba(251, 191, 36, 0.05);
  }

  :global(.dark) .debts-table td {
    color: #f3f4f6;
  }

  :global(.dark) .debt-name {
    color: #f3f4f6;
  }

  :global(.dark) .paid-amount {
    color: #10b981;
  }

  :global(.dark) .remaining-amount {
    color: #f87171;
  }

  :global(.dark) .remaining-amount.fully-paid {
    color: #10b981;
  }

  :global(.dark) .progress-bar {
    background: rgba(255, 255, 255, 0.1);
  }

  :global(.dark) .progress-fill {
    background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  }

  :global(.dark) .progress-fill.complete {
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  }

  :global(.dark) .progress-text {
    color: #9ca3af;
  }

  :global(.dark) .comment-input {
    background: rgba(31, 41, 55, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    color: #f3f4f6;
  }

  :global(.dark) .comment-input:focus {
    border-color: #fbbf24;
    background: rgba(31, 41, 55, 1);
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }

  :global(.dark) .comment-input::placeholder {
    color: #6b7280;
  }

  :global(.dark) .btn-payment {
    color: #34d399;
  }

  :global(.dark) .btn-payment:hover:not(:disabled) {
    background: rgba(52, 211, 153, 0.1);
    color: #6ee7b7;
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
    .debts-table-container {
      padding: 0.5rem;
    }

    .debts-table thead {
      display: none;
    }

    .debts-table,
    .debts-table tbody,
    .debts-table tr,
    .debts-table td {
      display: block;
      width: 100%;
    }

    .debt-row {
      margin-bottom: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    :global(.dark) .debt-row {
      background: rgba(31, 41, 55, 0.8);
      border-color: rgba(255, 255, 255, 0.05);
    }

    .debts-table td {
      padding: 0.5rem 0;
      text-align: left !important;
      border: none;
    }

    .debts-table td::before {
      content: attr(data-label);
      display: block;
      font-weight: 600;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    :global(.dark) .debts-table td::before {
      color: #9ca3af;
    }

    .col-progress {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }

    .progress-container {
      flex-direction: column;
      align-items: stretch;
      gap: 0.25rem;
    }

    .progress-text {
      text-align: left;
    }

    .col-comment {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
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
