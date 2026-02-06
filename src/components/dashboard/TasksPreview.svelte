<script lang="ts">
  import { incompleteDailyTasks } from '../../lib/stores/tasksStore';
  import { uiStore } from '../../lib/stores/uiStore';
  import { translations, t } from '../../lib/i18n';

  $: tasksPreview = $incompleteDailyTasks.slice(0, 4);
</script>

<div
  id="dashboard-tasks-panel-top"
  class="premium-card p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-blue-500"
  role="button"
  tabindex="0"
  on:click={() => uiStore.setActiveTab('tasks')}
  on:keydown={(e) => e.key === 'Enter' && uiStore.setActiveTab('tasks')}
>
  <div class="flex items-center justify-between mb-3">
    <h3
      class="text-sm font-extrabold uppercase tracking-tight opacity-80"
      style="color: var(--text-primary);"
    >
      {t($translations, 'tabTasks')}
    </h3>
    <svg
      class="w-4 h-4 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </div>

  <div class="space-y-2">
    {#if tasksPreview.length === 0}
      <div class="text-xs text-gray-500 italic py-2">
        {t($translations, 'noTasks', 'No pending tasks')}
      </div>
    {:else}
      {#each tasksPreview as task}
        <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
          <span class="truncate font-medium">{task.name}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>
