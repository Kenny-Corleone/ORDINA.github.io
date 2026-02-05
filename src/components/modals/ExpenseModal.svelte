<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { financeStore } from '../../lib/stores/financeStore';
  import { userStore } from '../../lib/stores/userStore';
  import { addExpense, updateExpense } from '../../lib/services/firebase/expenses';
  import { validateString, validateNumber, validateDate } from '../../lib/utils/validation';
  import { getTodayISOString } from '../../lib/utils/formatting';
  import type { Expense } from '../../lib/types';
  
  export let editId: string | null = null;
  
  const dispatch = createEventDispatcher();
  
  // Form state
  let name = '';
  let category = '';
  let amount = '';
  let date = getTodayISOString();
  
  // Validation errors
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Get data from stores
  $: userId = $userStore.userId;
  $: selectedMonthId = $financeStore.selectedMonthId;
  $: categories = $financeStore.categories;
  $: expenses = $financeStore.expenses;
  
  // If editing, populate form with existing data
  $: if (editId) {
    const expense = expenses.find(e => e.id === editId);
    if (expense) {
      name = expense.name;
      category = expense.category;
      amount = String(expense.amount);
      date = expense.date;
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
      case 'category': {
        const result = validateString(category, { minLength: 1, maxLength: 100, required: true });
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
      case 'date': {
        const result = validateDate(date, { required: true });
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
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
    if (!validateField('category')) isValid = false;
    if (!validateField('amount')) isValid = false;
    if (!validateField('date')) isValid = false;
    
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
      const expenseData = {
        name: name.trim(),
        category: category.trim(),
        amount: parseFloat(amount),
        date: date,
      };
      
      if (editId) {
        // Update existing expense
        await updateExpense(userId, selectedMonthId, editId, expenseData);
      } else {
        // Add new expense
        await addExpense(userId, selectedMonthId, expenseData);
      }
      
      // Close modal on success
      dispatch('close');
    } catch (error: any) {
      console.error('Error saving expense:', error);
      errors.submit = error.message || 'Failed to save expense. Please try again.';
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
    <label for="expense-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Expense Name *
    </label>
    <input
      id="expense-name"
      type="text"
      bind:value={name}
      on:blur={() => handleBlur('name')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="Enter expense name"
      disabled={isSubmitting}
      required
    />
    {#if errors.name}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
    {/if}
  </div>
  
  <!-- Category field with datalist -->
  <div>
    <label for="expense-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Category *
    </label>
    <input
      id="expense-category"
      type="text"
      list="categories-list"
      bind:value={category}
      on:blur={() => handleBlur('category')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="Enter or select category"
      disabled={isSubmitting}
      required
    />
    <datalist id="categories-list">
      {#each categories as cat}
        <option value={cat.name}>{cat.name}</option>
      {/each}
    </datalist>
    {#if errors.category}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
    {/if}
  </div>
  
  <!-- Amount field -->
  <div>
    <label for="expense-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Amount *
    </label>
    <input
      id="expense-amount"
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
  
  <!-- Date field -->
  <div>
    <label for="expense-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Date *
    </label>
    <input
      id="expense-date"
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
        {editId ? 'Update' : 'Add'} Expense
      {/if}
    </button>
  </div>
</form>
