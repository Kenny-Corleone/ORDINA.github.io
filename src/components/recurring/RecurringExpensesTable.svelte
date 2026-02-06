<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { translations } from '../../lib/i18n';
  import { uiStore } from '../../lib/stores/uiStore';
  import { formatCurrency } from '../../lib/utils/formatting';
  import type { RecurringExpense, Currency } from '../../lib/types';
  import VirtualList from '../ui/VirtualList.svelte';

  export let recurringTemplates: RecurringExpense[] = [];
  export let recurringStatuses: Record<string, string> = {};
  export let currency: Currency;
  export let exchangeRate: number;
  export let currentDay: number; // Current day of month for overdue highlighting

  const dispatch = createEventDispatcher();

  $: currentTranslations = $translations;

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Not Paid', color: 'gray' },
    { value: 'paid', label: 'Paid', color: 'green' },
    { value: 'skipped', label: 'Skipped', color: 'yellow' },
  ];

  function getStatus(templateId: string): string {
    return recurringStatuses[templateId] || 'pending';
  }

  function getStatusColor(status: string): string {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.color || 'gray';
  }

  function getStatusLabel(status: string): string {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.label || 'Not Paid';
  }

  function isOverdue(template: RecurringExpense): boolean {
    const status = getStatus(template.id);
    return status === 'pending' && currentDay > template.dueDay;
  }

  function handleStatusChange(templateId: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    dispatch('statusChange', { templateId, status: newStatus });
  }

  function handleEdit(templateId: string) {
    dispatch('edit', templateId);
  }

  function handleDelete(templateId: string) {
    dispatch('delete', templateId);
  }
</script>

<div class="recurring-table-container">
  <table class="recurring-table">
    <thead>
      <tr>
        <th class="col-name">{currentTranslations['name'] || 'Name'}</th>
        <th class="col-amount">{currentTranslations['amount'] || 'Amount'}</th>
        <th class="col-due-day">{currentTranslations['due_day'] || 'Due Day'}</th>
        <th class="col-details">{currentTranslations['details'] || 'Details'}</th>
        <th class="col-status">{currentTranslations['status'] || 'Status'}</th>
        <th class="col-actions">{currentTranslations['actions'] || 'Actions'}</th>
      </tr>
    </thead>
  </table>

  <VirtualList
    items={recurringTemplates}
    itemHeight={typeof window !== 'undefined' && window.innerWidth < 768 ? 280 : 70}
    bufferSize={10}
    containerHeight="calc(100vh - 300px)"
    threshold={50}
    let:item={template}
  >
    <table class="recurring-table recurring-table-body">
      <tbody>
        <tr class="recurring-row" class:overdue={isOverdue(template)}>
          <td class="col-name" data-label={currentTranslations['name'] || 'Name'}>
            {template.name}
          </td>
          <td class="col-amount" data-label={currentTranslations['amount'] || 'Amount'}>
            <span class="amount-value">
              {formatCurrency(template.amount, currency, exchangeRate)}
            </span>
          </td>
          <td class="col-due-day" data-label={currentTranslations['due_day'] || 'Due Day'}>
            <span class="due-day-badge">
              {template.dueDay}
            </span>
          </td>
          <td class="col-details" data-label={currentTranslations['details'] || 'Details'}>
            {template.details || '-'}
          </td>
          <td class="col-status" data-label={currentTranslations['status'] || 'Status'}>
            <select
              class="status-select status-{getStatusColor(getStatus(template.id))}"
              value={getStatus(template.id)}
              on:change={(e) => handleStatusChange(template.id, e)}
              aria-label="Status for {template.name}"
            >
              {#each statusOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </td>
          <td class="col-actions" data-label={currentTranslations['actions'] || 'Actions'}>
            <div class="action-buttons">
              <button
                class="btn-action btn-edit"
                on:click={() => handleEdit(template.id)}
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
                on:click={() => handleDelete(template.id)}
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
  .recurring-table-container {
    width: 100%;
    padding: 1rem;
  }

  .recurring-table {
    width: 100%;
    border-collapse: collapse;
    background: transparent;
  }

  .recurring-table-body {
    display: table;
    table-layout: fixed;
  }

  .recurring-table thead {
    background: rgba(102, 126, 234, 0.1);
    backdrop-filter: blur(10px);
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .recurring-table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  }

  .recurring-table tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .recurring-table tbody tr:hover {
    background: rgba(102, 126, 234, 0.05);
  }

  .recurring-table tbody tr.overdue {
    background: rgba(239, 68, 68, 0.05);
  }

  .recurring-table tbody tr.overdue:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .recurring-table td {
    padding: 1rem;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .col-name {
    width: 25%;
    min-width: 150px;
  }

  .col-amount {
    width: 15%;
    min-width: 100px;
    text-align: right;
  }

  .col-due-day {
    width: 10%;
    min-width: 80px;
    text-align: center;
  }

  .col-details {
    width: 25%;
    min-width: 150px;
  }

  .col-status {
    width: 15%;
    min-width: 120px;
  }

  .col-actions {
    width: 10%;
    min-width: 100px;
    text-align: center;
  }

  .amount-value {
    font-weight: 600;
    color: #059669;
    font-variant-numeric: tabular-nums;
  }

  .due-day-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .status-select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 2px solid;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.9);
  }

  .status-select:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .status-gray {
    border-color: #9ca3af;
    color: #6b7280;
  }

  .status-green {
    border-color: #10b981;
    color: #059669;
    background: rgba(16, 185, 129, 0.05);
  }

  .status-yellow {
    border-color: #f59e0b;
    color: #d97706;
    background: rgba(245, 158, 11, 0.05);
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
  :global(.dark) .recurring-table thead {
    background: rgba(251, 191, 36, 0.1);
  }

  :global(.dark) .recurring-table th {
    color: #d1d5db;
    border-bottom-color: rgba(251, 191, 36, 0.2);
  }

  :global(.dark) .recurring-table tbody tr {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }

  :global(.dark) .recurring-table tbody tr:hover {
    background: rgba(251, 191, 36, 0.05);
  }

  :global(.dark) .recurring-table tbody tr.overdue {
    background: rgba(239, 68, 68, 0.1);
  }

  :global(.dark) .recurring-table tbody tr.overdue:hover {
    background: rgba(239, 68, 68, 0.15);
  }

  :global(.dark) .recurring-table td {
    color: #f3f4f6;
  }

  :global(.dark) .amount-value {
    color: #10b981;
  }

  :global(.dark) .due-day-badge {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }

  :global(.dark) .status-select {
    background: rgba(31, 41, 55, 0.9);
  }

  :global(.dark) .status-gray {
    border-color: #6b7280;
    color: #9ca3af;
  }

  :global(.dark) .status-green {
    border-color: #10b981;
    color: #34d399;
    background: rgba(16, 185, 129, 0.1);
  }

  :global(.dark) .status-yellow {
    border-color: #f59e0b;
    color: #fbbf24;
    background: rgba(245, 158, 11, 0.1);
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
    .recurring-table-container {
      padding: 0.5rem;
    }

    .recurring-table thead {
      display: none;
    }

    .recurring-table,
    .recurring-table tbody,
    .recurring-table tr,
    .recurring-table td {
      display: block;
      width: 100%;
    }

    .recurring-row {
      margin-bottom: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .recurring-row.overdue {
      border-color: rgba(239, 68, 68, 0.3);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
    }

    :global(.dark) .recurring-row {
      background: rgba(31, 41, 55, 0.8);
      border-color: rgba(255, 255, 255, 0.05);
    }

    :global(.dark) .recurring-row.overdue {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .recurring-table td {
      padding: 0.5rem 0;
      text-align: left !important;
      border: none;
    }

    .recurring-table td::before {
      content: attr(data-label);
      display: block;
      font-weight: 600;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    :global(.dark) .recurring-table td::before {
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
