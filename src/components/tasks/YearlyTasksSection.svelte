<script lang="ts">
  import { tasksStore } from '../../lib/stores/tasksStore';
  import { userStore } from '../../lib/stores/userStore';
  import { uiStore } from '../../lib/stores/uiStore';
  import { translations } from '../../lib/i18n';
  import { updateYearlyTask, deleteYearlyTask } from '../../lib/services/firebase/tasks';
  import { debounce } from '../../lib/utils/performance';
  import { TaskStatus } from '../../lib/types';
  import type { YearlyTask } from '../../lib/types';
  import EmptyState from '../ui/EmptyState.svelte';
  import VirtualList from '../ui/VirtualList.svelte';
  
  // Subscribe to stores
  $: yearlyTasks = $tasksStore.yearlyTasks;
  $: userId = $userStore.userId;
  $: currentTranslations = $translations;
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Status options
  const statusOptions = [
    { value: TaskStatus.NOT_DONE, label: 'Не выполнено', color: 'gray' },
    { value: TaskStatus.DONE, label: 'Выполнено', color: 'green' },
    { value: TaskStatus.SKIPPED, label: 'Пропущено', color: 'yellow' }
  ];
  
  function getStatusColor(status: TaskStatus): string {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'gray';
  }
  
  // Handle add task
  function handleAddTask() {
    uiStore.openModal('yearlyTask');
  }
  
  // Handle edit task
  function handleEditTask(taskId: string) {
    uiStore.openModal('yearlyTask', { editId: taskId });
  }
  
  // Handle status change
  async function handleStatusChange(taskId: string, event: Event) {
    if (!userId) return;
    
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as TaskStatus;
    
    try {
      await updateYearlyTask(userId, taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
      alert(currentTranslations['error_update_task'] || 'Failed to update task status. Please try again.');
    }
  }
  
  // Handle notes change with debounce
  const debouncedNotesUpdate = debounce(async (taskId: string, notes: string) => {
    if (!userId) return;
    
    try {
      await updateYearlyTask(userId, taskId, { notes: notes.trim() || undefined });
    } catch (error) {
      console.error('Error updating task notes:', error);
    }
  }, 500);
  
  function handleNotesChange(taskId: string, event: Event) {
    const target = event.target as HTMLTextAreaElement;
    debouncedNotesUpdate(taskId, target.value);
  }
  
  // Handle delete task
  async function handleDeleteTask(taskId: string) {
    if (!userId) return;
    
    const confirmed = confirm(currentTranslations['confirm_delete_task'] || 'Are you sure you want to delete this task?');
    if (!confirmed) return;
    
    try {
      await deleteYearlyTask(userId, taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(currentTranslations['error_delete_task'] || 'Failed to delete task. Please try again.');
    }
  }
</script>

<div class="yearly-tasks-section">
  <!-- Section header -->
  <div class="section-header">
    <h3 class="section-title">
      {currentTranslations['yearly_tasks'] || 'Yearly Tasks'}
    </h3>
    <div class="header-controls">
      <span class="year-display">{currentYear}</span>
      <button
        class="btn-add"
        on:click={handleAddTask}
        aria-label={currentTranslations['add_task'] || 'Add Task'}
      >
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {currentTranslations['add_task'] || 'Add Task'}
      </button>
    </div>
  </div>
  
  <!-- Tasks table -->
  {#if yearlyTasks.length === 0}
    <EmptyState
      icon="🎯"
      message={currentTranslations['no_yearly_tasks'] || 'No yearly tasks'}
      description={currentTranslations['no_yearly_tasks_desc'] || 'Add a task to get started'}
    />
  {:else}
    <div class="tasks-table-wrapper">
      <table class="tasks-table">
        <thead>
          <tr>
            <th class="col-name">{currentTranslations['task_name'] || 'Task'}</th>
            <th class="col-year">{currentTranslations['year'] || 'Year'}</th>
            <th class="col-status">{currentTranslations['status'] || 'Status'}</th>
            <th class="col-notes">{currentTranslations['notes'] || 'Notes'}</th>
            <th class="col-actions">{currentTranslations['actions'] || 'Actions'}</th>
          </tr>
        </thead>
      </table>
      
      <VirtualList 
        items={yearlyTasks} 
        itemHeight={90} 
        bufferSize={10} 
        containerHeight="calc(100vh - 400px)"
        threshold={50}
        let:item={task}
      >
        <table class="tasks-table tasks-table-body">
          <tbody>
            <tr class="task-row">
              <td class="col-name" data-label={currentTranslations['task_name'] || 'Task'}>
                <span class="task-name">{task.name}</span>
              </td>
              <td class="col-year" data-label={currentTranslations['year'] || 'Year'}>
                <span class="year-badge">{task.year}</span>
              </td>
              <td class="col-status" data-label={currentTranslations['status'] || 'Status'}>
                <select
                  class="status-select status-{getStatusColor(task.status)}"
                  value={task.status}
                  on:change={(e) => handleStatusChange(task.id, e)}
                  aria-label="Status for {task.name}"
                >
                  {#each statusOptions as option}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </select>
              </td>
              <td class="col-notes" data-label={currentTranslations['notes'] || 'Notes'}>
                <textarea
                  class="notes-input"
                  value={task.notes || ''}
                  on:input={(e) => handleNotesChange(task.id, e)}
                  placeholder={currentTranslations['add_notes'] || 'Add notes...'}
                  rows="2"
                  aria-label="Notes for {task.name}"
                />
              </td>
              <td class="col-actions" data-label={currentTranslations['actions'] || 'Actions'}>
                <div class="action-buttons">
                  <button
                    class="btn-action btn-edit"
                    on:click={() => handleEditTask(task.id)}
                    aria-label={currentTranslations['edit'] || 'Edit'}
                    title={currentTranslations['edit'] || 'Edit'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    class="btn-action btn-delete"
                    on:click={() => handleDeleteTask(task.id)}
                    aria-label={currentTranslations['delete'] || 'Delete'}
                    title={currentTranslations['delete'] || 'Delete'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
  {/if}
</div>

<style>
  .yearly-tasks-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #667eea;
    margin: 0;
  }
  
  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .year-display {
    padding: 0.5rem 0.75rem;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .btn-add {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .btn-add:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a4291 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  .btn-add:active {
    transform: translateY(0);
  }
  
  .icon {
    width: 1rem;
    height: 1rem;
  }
  
  .tasks-table-wrapper {
    width: 100%;
  }
  
  .tasks-table {
    width: 100%;
    border-collapse: collapse;
    background: transparent;
  }
  
  .tasks-table-body {
    display: table;
    table-layout: fixed;
  }
  
  .tasks-table thead {
    background: rgba(102, 126, 234, 0.1);
    backdrop-filter: blur(10px);
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  
  .tasks-table th {
    padding: 0.75rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  }
  
  .tasks-table tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }
  
  .tasks-table tbody tr:hover {
    background: rgba(102, 126, 234, 0.05);
  }
  
  .tasks-table td {
    padding: 0.75rem;
    font-size: 0.875rem;
    color: #1f2937;
  }
  
  .col-name {
    width: 30%;
    min-width: 200px;
  }
  
  .col-year {
    width: 10%;
    min-width: 80px;
    text-align: center;
  }
  
  .col-status {
    width: 20%;
    min-width: 150px;
  }
  
  .col-notes {
    width: 30%;
    min-width: 200px;
  }
  
  .col-actions {
    width: 10%;
    min-width: 100px;
    text-align: center;
  }
  
  .task-name {
    font-weight: 500;
  }
  
  .year-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.75rem;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-radius: 0.375rem;
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
  
  .notes-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: inherit;
    resize: vertical;
    background: rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
  }
  
  .notes-input:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  :global(.dark) .section-header {
    border-bottom-color: rgba(251, 191, 36, 0.2);
  }
  
  :global(.dark) .section-title {
    color: #fbbf24;
  }
  
  :global(.dark) .year-display {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }
  
  :global(.dark) .btn-add {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1f2937;
  }
  
  :global(.dark) .btn-add:hover {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  }
  
  :global(.dark) .tasks-table thead {
    background: rgba(251, 191, 36, 0.1);
  }
  
  :global(.dark) .tasks-table th {
    color: #d1d5db;
    border-bottom-color: rgba(251, 191, 36, 0.2);
  }
  
  :global(.dark) .tasks-table tbody tr {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }
  
  :global(.dark) .tasks-table tbody tr:hover {
    background: rgba(251, 191, 36, 0.05);
  }
  
  :global(.dark) .tasks-table td {
    color: #f3f4f6;
  }
  
  :global(.dark) .year-badge {
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
  
  :global(.dark) .notes-input {
    background: rgba(31, 41, 55, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
    color: #f3f4f6;
  }
  
  :global(.dark) .notes-input:focus {
    border-color: #fbbf24;
    background: rgba(31, 41, 55, 0.9);
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
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
    .section-header {
      flex-direction: column;
      align-items: stretch;
    }
    
    .header-controls {
      width: 100%;
      justify-content: space-between;
    }
    
    .tasks-table thead {
      display: none;
    }
    
    .tasks-table,
    .tasks-table tbody,
    .tasks-table tr,
    .tasks-table td {
      display: block;
      width: 100%;
    }
    
    .task-row {
      margin-bottom: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    :global(.dark) .task-row {
      background: rgba(31, 41, 55, 0.8);
      border-color: rgba(255, 255, 255, 0.05);
    }
    
    .tasks-table td {
      padding: 0.5rem 0;
      text-align: left !important;
      border: none;
    }
    
    .tasks-table td::before {
      content: attr(data-label);
      display: block;
      font-weight: 600;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
    
    :global(.dark) .tasks-table td::before {
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
