<script lang="ts">
  import { financeStore } from '../../lib/stores/financeStore';
  import { uiStore } from '../../lib/stores/uiStore';
  import { userStore } from '../../lib/stores/userStore';
  import { translations } from '../../lib/i18n';
  import { deleteDebt, updateDebt } from '../../lib/services/firebase/debts';
  import { exportDebtsToCSV } from '../../lib/services/export';
  import { debounce } from '../../lib/utils/performance';
  import CurrencyToggle from '../ui/CurrencyToggle.svelte';
  import DebtsTable from '../debts/DebtsTable.svelte';
  import EmptyState from '../ui/EmptyState.svelte';
  
  // Subscribe to stores
  $: debts = $financeStore.debts;
  $: currency = $financeStore.currency;
  $: exchangeRate = $financeStore.exchangeRate;
  $: userId = $userStore.userId;
  $: currentTranslations = $translations;
  
  // Sort debts by creation date descending (newest first)
  $: sortedDebts = [...debts].sort((a, b) => {
    const aTime = a.createdAt?.toMillis() || 0;
    const bTime = b.createdAt?.toMillis() || 0;
    return bTime - aTime;
  });
  
  // Handle add debt
  function handleAddDebt() {
    uiStore.openModal('debt');
  }
  
  // Handle edit debt
  function handleEditDebt(debtId: string) {
    uiStore.openModal('debt', { editId: debtId });
  }
  
  // Handle add payment
  function handleAddPayment(debtId: string) {
    uiStore.openModal('debtPayment', { debtId });
  }
  
  // Handle delete debt
  async function handleDeleteDebt(debtId: string) {
    if (!userId) return;
    
    const confirmed = confirm(currentTranslations['confirm_delete_debt'] || 'Are you sure you want to delete this debt?');
    if (!confirmed) return;
    
    try {
      await deleteDebt(userId, debtId);
    } catch (error) {
      console.error('Error deleting debt:', error);
      alert(currentTranslations['error_delete_debt'] || 'Failed to delete debt. Please try again.');
    }
  }
  
  // Handle comment update with debounce
  const debouncedUpdateComment = debounce(async (debtId: string, comment: string) => {
    if (!userId) return;
    
    try {
      await updateDebt(userId, debtId, { comment });
    } catch (error) {
      console.error('Error updating debt comment:', error);
      alert(currentTranslations['error_update_debt'] || 'Failed to update debt comment. Please try again.');
    }
  }, 500);
  
  function handleCommentChange(event: CustomEvent<{ debtId: string; comment: string }>) {
    const { debtId, comment } = event.detail;
    debouncedUpdateComment(debtId, comment);
  }
  
  // Handle CSV export
  function handleExportCSV() {
    try {
      const filename = `debts_${new Date().toISOString().split('T')[0]}.csv`;
      exportDebtsToCSV(sortedDebts, { filename });
    } catch (error) {
      console.error('Error exporting debts:', error);
      alert(currentTranslations['error_export'] || 'Failed to export debts. Please try again.');
    }
  }
</script>

<div class="debts-tab">
  <!-- Header with controls -->
  <div class="debts-header">
    <div class="header-left">
      <h2 class="tab-title">
        {currentTranslations['debts'] || 'Debts'}
      </h2>
    </div>
    
    <div class="header-right">
      <CurrencyToggle />
      <button
        class="btn-export"
        on:click={handleExportCSV}
        disabled={sortedDebts.length === 0}
        aria-label={currentTranslations['export_csv'] || 'Export to CSV'}
      >
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {currentTranslations['export'] || 'Export'}
      </button>
      <button
        class="btn-add"
        on:click={handleAddDebt}
        aria-label={currentTranslations['add_debt'] || 'Add Debt'}
      >
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {currentTranslations['add_debt'] || 'Add Debt'}
      </button>
    </div>
  </div>
  
  <!-- Content area -->
  <div class="debts-content">
    {#if sortedDebts.length === 0}
      <EmptyState
        icon="💳"
        message={currentTranslations['no_debts'] || 'No debts yet'}
        description={currentTranslations['no_debts_desc'] || 'Add your first debt to start tracking payments'}
      />
    {:else}
      <DebtsTable
        debts={sortedDebts}
        {currency}
        {exchangeRate}
        on:edit={(e) => handleEditDebt(e.detail)}
        on:delete={(e) => handleDeleteDebt(e.detail)}
        on:addPayment={(e) => handleAddPayment(e.detail)}
        on:commentChange={handleCommentChange}
      />
    {/if}
  </div>
</div>

<style>
  .debts-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0.75rem 1rem; /* УМЕНЬШЕНО: было 1.5rem */
    gap: 1rem; /* УМЕНЬШЕНО: было 1.5rem */
  }
  
  .debts-header {
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
  
  .debts-content {
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
  
  :global(.dark) .debts-content {
    background: rgba(31, 41, 55, 0.6);
    border-color: rgba(75, 85, 99, 0.8);
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .debts-tab {
      padding: 1rem;
    }
    
    .debts-header {
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
