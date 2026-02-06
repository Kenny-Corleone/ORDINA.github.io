<script lang="ts">
  import { financeStore } from '../../lib/stores/financeStore';
  import { translations } from '../../lib/i18n';

  let availableMonths: string[] = [];
  let selectedMonthId: string = '';
  let currentTranslations: Record<string, any>;

  // Subscribe to finance store
  financeStore.subscribe(state => {
    availableMonths = state.availableMonths;
    selectedMonthId = state.selectedMonthId;
  });

  // Subscribe to translations
  translations.subscribe(t => {
    currentTranslations = t;
  });

  function handleMonthChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newMonthId = target.value;
    financeStore.setSelectedMonthId(newMonthId);
  }

  /**
   * Format month ID (YYYY-MM) to display format
   * @param monthId - Month ID in YYYY-MM format
   * @returns Formatted month string (e.g., "January 2024")
   */
  function formatMonthDisplay(monthId: string): string {
    if (!monthId || !currentTranslations) return monthId;
    
    const [year, month] = monthId.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    
    // Get month names from translations
    const monthNames = currentTranslations['months'];
    if (Array.isArray(monthNames) && monthNames[monthIndex]) {
      return `${monthNames[monthIndex]} ${year}`;
    }
    
    // Fallback to default format
    return monthId;
  }
</script>

<div class="month-selector">
  <label for="month-select" class="month-label">
    {currentTranslations?.['select_month'] || 'Select Month'}:
  </label>
  <select
    id="month-select"
    class="month-select"
    value={selectedMonthId}
    on:change={handleMonthChange}
    aria-label="Select month"
  >
    {#each availableMonths as monthId}
      <option value={monthId}>
        {formatMonthDisplay(monthId)}
      </option>
    {/each}
  </select>
</div>

<style>
  .month-selector {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  /* Remove any potential pseudo-elements */
  .month-selector::before,
  .month-selector::after {
    content: none !important;
    display: none !important;
  }

  .month-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    white-space: nowrap;
  }

  /* Remove any potential pseudo-elements from label */
  .month-label::before,
  .month-label::after {
    content: none !important;
    display: none !important;
  }

  .month-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    color: #1f2937;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 12px 12px;
    min-width: 180px;
    /* Remove any list-style markers */
    list-style: none;
    list-style-type: none;
    /* Remove text decorations */
    text-decoration: none;
  }

  /* Remove any potential pseudo-elements from select */
  .month-select::before,
  .month-select::after {
    content: none !important;
    display: none !important;
  }

  .month-select:hover {
    border-color: rgba(102, 126, 234, 0.4);
    background-color: rgba(255, 255, 255, 1);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  .month-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .month-select option {
    background: white;
    color: #1f2937;
    padding: 0.5rem;
    /* Remove any list-style markers from options */
    list-style: none;
    list-style-type: none;
    /* Remove text decorations */
    text-decoration: none;
  }

  /* Remove any potential pseudo-elements from options */
  .month-select option::before,
  .month-select option::after {
    content: none !important;
    display: none !important;
  }

  /* Dark mode styles */
  :global(.dark) .month-label {
    color: #d1d5db;
  }

  /* Remove any potential pseudo-elements from dark mode label */
  :global(.dark) .month-label::before,
  :global(.dark) .month-label::after {
    content: none !important;
    display: none !important;
  }

  :global(.dark) .month-select {
    background: rgba(31, 41, 55, 0.9);
    color: #f3f4f6;
    border-color: rgba(251, 191, 36, 0.2);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fbbf24' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    /* Remove any list-style markers */
    list-style: none;
    list-style-type: none;
    /* Remove text decorations */
    text-decoration: none;
  }

  /* Remove any potential pseudo-elements from dark mode select */
  :global(.dark) .month-select::before,
  :global(.dark) .month-select::after {
    content: none !important;
    display: none !important;
  }

  :global(.dark) .month-select:hover {
    background-color: rgba(31, 41, 55, 1);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fbbf24' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    border-color: rgba(251, 191, 36, 0.4);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);
  }

  :global(.dark) .month-select:focus {
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }

  :global(.dark) .month-select option {
    background: #1f2937;
    color: #f3f4f6;
    /* Remove any list-style markers from dark mode options */
    list-style: none;
    list-style-type: none;
    /* Remove text decorations */
    text-decoration: none;
  }

  /* Remove any potential pseudo-elements from dark mode options */
  :global(.dark) .month-select option::before,
  :global(.dark) .month-select option::after {
    content: none !important;
    display: none !important;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .month-selector {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .month-select {
      width: 100%;
      min-width: auto;
    }
  }
</style>
