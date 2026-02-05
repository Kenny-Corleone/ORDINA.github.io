<script lang="ts">
  import { tasksStore } from '../../lib/stores/tasksStore';
  import { financeStore } from '../../lib/stores/financeStore';
  import { translations } from '../../lib/i18n';
  import DailyTasksSection from '../tasks/DailyTasksSection.svelte';
  import MonthlyTasksSection from '../tasks/MonthlyTasksSection.svelte';
  import YearlyTasksSection from '../tasks/YearlyTasksSection.svelte';
  
  // Subscribe to stores
  $: dailyTasks = $tasksStore.dailyTasks;
  $: monthlyTasks = $tasksStore.monthlyTasks;
  $: yearlyTasks = $tasksStore.yearlyTasks;
  $: currentDailyDate = $tasksStore.currentDailyDate;
  $: selectedMonthId = $financeStore.selectedMonthId;
  $: currentTranslations = $translations;
</script>

<div class="tasks-tab">
  <!-- Header -->
  <div class="tasks-header">
    <h2 class="tab-title">
      {currentTranslations['tasks'] || 'Tasks'}
    </h2>
  </div>
  
  <!-- Content area with three sections -->
  <div class="tasks-content">
    <!-- Daily Tasks Section -->
    <div class="tasks-section">
      <DailyTasksSection />
    </div>
    
    <!-- Monthly Tasks Section -->
    <div class="tasks-section">
      <MonthlyTasksSection />
    </div>
    
    <!-- Yearly Tasks Section -->
    <div class="tasks-section">
      <YearlyTasksSection />
    </div>
  </div>
</div>

<style>
  .tasks-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
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
  
  .tasks-content {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .tasks-section {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);
    padding: 1.5rem;
  }
  
  /* Dark mode styles */
  :global(.dark) .tab-title {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  :global(.dark) .tasks-section {
    background: rgba(31, 41, 55, 0.6);
    border-color: rgba(75, 85, 99, 0.8);
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .tasks-tab {
      padding: 1rem;
    }
    
    .tab-title {
      font-size: 1.5rem;
    }
    
    .tasks-section {
      padding: 1rem;
    }
  }
</style>
