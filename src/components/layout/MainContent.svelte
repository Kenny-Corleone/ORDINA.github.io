<script lang="ts">
  import { uiStore } from '../../lib/stores/uiStore';
  import DashboardTab from '../tabs/DashboardTab.svelte';
  import ExpensesTab from '../tabs/ExpensesTab.svelte';
  import DebtsTab from '../tabs/DebtsTab.svelte';
  import RecurringExpensesTab from '../tabs/RecurringExpensesTab.svelte';
  import TasksTab from '../tabs/TasksTab.svelte';
  import CalendarTab from '../tabs/CalendarTab.svelte';

  // Subscribe to active tab
  $: activeTab = $uiStore.activeTab;
</script>

<main class="main-content-container">
  {#if activeTab === 'dashboard'}
    <div id="dashboard-page" class="page-content">
      <DashboardTab />
    </div>
  {:else if activeTab === 'expenses'}
    <div id="expenses-page" class="page-content">
      <ExpensesTab />
    </div>
  {:else if activeTab === 'debts'}
    <div id="debts-page" class="page-content">
      <DebtsTab />
    </div>
  {:else if activeTab === 'recurring'}
    <div id="recurring-page" class="page-content">
      <RecurringExpensesTab />
    </div>
  {:else if activeTab === 'tasks'}
    <div id="tasks-page" class="page-content">
      <TasksTab />
    </div>
  {:else if activeTab === 'calendar'}
    <div id="calendar-page" class="page-content">
      <CalendarTab />
    </div>
  {/if}
</main>

<style>
  /* КРИТИЧНО: Main content НЕ скроллится - скролл на родителе */
  .main-content-container {
    width: 100%;
    max-width: 100%;
    padding: 0;
    /* НЕТ overflow - скролл на content-wrapper */
    overflow: visible;
    /* НЕТ min-height - контент определяет высоту */
  }
  
  .page-content {
    width: 100%;
    max-width: 100%;
  }
</style>
