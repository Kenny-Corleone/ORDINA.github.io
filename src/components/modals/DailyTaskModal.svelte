<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { tasksStore } from '../../lib/stores/tasksStore';
  import { userStore } from '../../lib/stores/userStore';
  import { addDailyTask, updateDailyTask } from '../../lib/services/firebase/tasks';
  import { validateString, validateDate } from '../../lib/utils/validation';
  import { getTodayISOString } from '../../lib/utils/formatting';
  import { TaskStatus } from '../../lib/types';
  
  export let editId: string | null = null;
  
  const dispatch = createEventDispatcher();
  
  // Form state
  let name = '';
  let date = getTodayISOString();
  let status = TaskStatus.NOT_DONE;
  let notes = '';

  let initializedEditId: string | null = null;
  
  // Validation errors
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Get data from stores
  $: userId = $userStore.userId;
  $: dailyTasks = $tasksStore.dailyTasks;
  
  // Task status options
  const statusOptions = [
    { value: TaskStatus.NOT_DONE, label: 'Не выполнено' },
    { value: TaskStatus.DONE, label: 'Выполнено' },
    { value: TaskStatus.SKIPPED, label: 'Пропущено' }
  ];
  
  // If editing, populate form with existing data (only once per editId)
  $: if (editId && initializedEditId !== editId) {
    const task = dailyTasks.find(t => t.id === editId);
    if (task) {
      name = task.name;
      date = task.date;
      status = task.status;
      notes = task.notes || '';
      initializedEditId = editId;
    }
  }

  $: if (!editId) {
    initializedEditId = null;
  }
  
  // Validate individual field
  function validateField(field: string): boolean {
    if (field in errors) {
      const nextErrors = { ...errors };
      delete nextErrors[field];
      errors = nextErrors;
    }
    
    switch (field) {
      case 'name': {
        const result = validateString(name, { minLength: 1, maxLength: 200, required: true });
        if (!result.valid) {
          errors = { ...errors, [field]: result.error! };
          return false;
        }
        break;
      }
      case 'date': {
        const result = validateDate(date, { required: true });
        if (!result.valid) {
          errors = { ...errors, [field]: result.error! };
          return false;
        }
        break;
      }
      case 'notes': {
        if (notes.trim().length > 0) {
          const result = validateString(notes, { minLength: 0, maxLength: 1000, required: false });
          if (!result.valid) {
            errors = { ...errors, [field]: result.error! };
            return false;
          }
        }
        break;
      }
    }
    
    return true;
  }
  
  // Validate all fields
  function validateForm(): boolean {
    errors = {};
    let isValid = true;
    
    if (!validateField('name')) isValid = false;
    if (!validateField('date')) isValid = false;
    if (!validateField('notes')) isValid = false;
    
    return isValid;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    if (!userId) {
      errors = { ...errors, submit: 'User not authenticated' };
      return;
    }
    
    isSubmitting = true;
    errors = {};
    
    try {
      const taskData = {
        name: name.trim(),
        date: date,
        status: status,
        notes: notes.trim() || undefined,
      };
      
      if (editId) {
        // Update existing task
        await updateDailyTask(userId, editId, taskData);
      } else {
        // Add new task
        await addDailyTask(userId, taskData);
      }
      
      // Close modal on success
      dispatch('close');
    } catch (error: any) {
      console.error('Error saving daily task:', error);
      errors = { ...errors, submit: error.message || 'Failed to save task. Please try again.' };
    } finally {
      isSubmitting = false;
    }
  }
  
  // Handle cancel
  function handleCancel() {
    dispatch('close');
  }
  
  // Handle field blur for validation
  function handleBlur(field: string) {
    validateField(field);
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4" novalidate>
  <!-- Name field -->
  <div>
    <label for="daily-task-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Task Name *
    </label>
    <input
      id="daily-task-name"
      type="text"
      bind:value={name}
      on:blur={() => handleBlur('name')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="Enter task name"
      disabled={isSubmitting}
      required
    />
    {#if errors.name}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
    {/if}
  </div>
  
  <!-- Date field -->
  <div>
    <label for="daily-task-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Date *
    </label>
    <input
      id="daily-task-date"
      type="date"
      bind:value={date}
      on:blur={() => handleBlur('date')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      disabled={isSubmitting}
      required
    />
    {#if errors.date}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
    {/if}
  </div>
  
  <!-- Status field -->
  <div>
    <label for="daily-task-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Status *
    </label>
    <select
      id="daily-task-status"
      bind:value={status}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      disabled={isSubmitting}
      required
    >
      {#each statusOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
  
  <!-- Notes field -->
  <div>
    <label for="daily-task-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Notes
    </label>
    <textarea
      id="daily-task-notes"
      bind:value={notes}
      on:blur={() => handleBlur('notes')}
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
      placeholder="Optional notes"
      disabled={isSubmitting}
    />
    {#if errors.notes}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
    {/if}
  </div>
  
  <!-- Submit error -->
  {#if errors.submit}
    <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
      <p class="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
    </div>
  {/if}
  
  <!-- Form actions -->
  <div class="flex justify-end gap-2 pt-4">
    <button
      type="button"
      on:click={handleCancel}
      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      disabled={isSubmitting}
    >
      Cancel
    </button>
    <button
      type="submit"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isSubmitting}
    >
      {#if isSubmitting}
        Saving...
      {:else}
        {editId ? 'Update' : 'Add'} Task
      {/if}
    </button>
  </div>
</form>
