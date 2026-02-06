<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { financeStore } from '../../lib/stores/financeStore';
  import { userStore } from '../../lib/stores/userStore';
  import { addRecurringExpense, updateRecurringExpense } from '../../lib/services/firebase/recurring';
  import { validateString, validateNumber, validateDayOfMonth } from '../../lib/utils/validation';
  import type { RecurringExpense } from '../../lib/types';
  
  export let editId: string | null = null;
  
  const dispatch = createEventDispatcher();
  
  // Form state
  let name = '';
  let amount = '';
  let dueDay = '';
  let details = '';
  
  // Validation errors
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Get data from stores
  $: userId = $userStore.userId;
  $: recurringTemplates = $financeStore.recurringTemplates;
  
  // If editing, populate form with existing data
  $: if (editId) {
    const template = recurringTemplates.find(t => t.id === editId);
    if (template) {
      name = template.name;
      amount = String(template.amount);
      dueDay = String(template.dueDay);
      details = template.details || '';
    }
  }
  
  // Validate individual field
  function validateField(field: string): boolean {
    delete errors[field];
    
    switch (field) {
      case 'name': {
        const result = validateString(name, { minLength: 1, maxLength: 200, required: true });
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
        }
        break;
      }
      case 'amount': {
        const result = validateNumber(amount, { min: 0.01, required: true, allowZero: false });
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
        }
        break;
      }
      case 'dueDay': {
        const result = validateDayOfMonth(dueDay);
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
        }
        break;
      }
      case 'details': {
        if (details.trim().length > 0) {
          const result = validateString(details, { minLength: 0, maxLength: 500, required: false });
          if (!result.valid) {
            errors[field] = result.error!;
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
    if (!validateField('amount')) isValid = false;
    if (!validateField('dueDay')) isValid = false;
    if (!validateField('details')) isValid = false;
    
    return isValid;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    if (!userId) {
      errors.submit = 'User not authenticated';
      return;
    }
    
    isSubmitting = true;
    errors = {};
    
    try {
      const recurringData = {
        name: name.trim(),
        amount: parseFloat(amount),
        dueDay: parseInt(dueDay, 10),
        details: details.trim() || undefined,
      };
      
      if (editId) {
        // Update existing recurring expense
        await updateRecurringExpense(userId, editId, recurringData);
      } else {
        // Add new recurring expense
        await addRecurringExpense(userId, recurringData);
      }
      
      // Close modal on success
      dispatch('close');
    } catch (error: any) {
      console.error('Error saving recurring expense:', error);
      errors.submit = error.message || 'Failed to save recurring expense. Please try again.';
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

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <!-- Name field -->
  <div>
    <label for="recurring-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Expense Name *
    </label>
    <input
      id="recurring-name"
      type="text"
      bind:value={name}
      on:blur={() => handleBlur('name')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="Enter recurring expense name"
      disabled={isSubmitting}
      required
    />
    {#if errors.name}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
    {/if}
  </div>
  
  <!-- Amount field -->
  <div>
    <label for="recurring-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Amount *
    </label>
    <input
      id="recurring-amount"
      type="number"
      step="0.01"
      min="0.01"
      bind:value={amount}
      on:blur={() => handleBlur('amount')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="0.00"
      disabled={isSubmitting}
      required
    />
    {#if errors.amount}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
    {/if}
  </div>
  
  <!-- Due Day field -->
  <div>
    <label for="recurring-due-day" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Due Day of Month *
    </label>
    <input
      id="recurring-due-day"
      type="number"
      min="1"
      max="31"
      bind:value={dueDay}
      on:blur={() => handleBlur('dueDay')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="1-31"
      disabled={isSubmitting}
      required
    />
    {#if errors.dueDay}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDay}</p>
    {/if}
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      The day of the month when this expense is due (1-31)
    </p>
  </div>
  
  <!-- Details field -->
  <div>
    <label for="recurring-details" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Details
    </label>
    <textarea
      id="recurring-details"
      bind:value={details}
      on:blur={() => handleBlur('details')}
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
      placeholder="Optional details or notes"
      disabled={isSubmitting}
    />
    {#if errors.details}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.details}</p>
    {/if}
  </div>
  
  <!-- Info message -->
  <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
    <p class="text-sm text-blue-700 dark:text-blue-300">
      This recurring expense template will appear in the Recurring Expenses tab each month. You can mark it as paid, pending, or skipped for each month.
    </p>
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
        {editId ? 'Update' : 'Add'} Recurring Expense
      {/if}
    </button>
  </div>
</form>
