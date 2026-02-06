<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { financeStore } from '../../lib/stores/financeStore';
  import { userStore } from '../../lib/stores/userStore';
  import { addDebt, updateDebt } from '../../lib/services/firebase/debts';
  import { validateString, validateNumber } from '../../lib/utils/validation';
  import type { Debt } from '../../lib/types';
  
  export let editId: string | null = null;
  
  const dispatch = createEventDispatcher();
  
  // Form state
  let name = '';
  let totalAmount = '';
  let paidAmount = '';
  let comment = '';
  
  // Validation errors
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Get data from stores
  $: userId = $userStore.userId;
  $: debts = $financeStore.debts;
  
  // If editing, populate form with existing data
  $: if (editId) {
    const debt = debts.find(d => d.id === editId);
    if (debt) {
      name = debt.name;
      totalAmount = String(debt.totalAmount);
      paidAmount = String(debt.paidAmount);
      comment = debt.comment || '';
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
      case 'totalAmount': {
        const result = validateNumber(totalAmount, { min: 0.01, required: true, allowZero: false });
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
        }
        break;
      }
      case 'paidAmount': {
        const result = validateNumber(paidAmount, { min: 0, required: true, allowZero: true });
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
        }
        // Check that paid amount doesn't exceed total amount
        const total = parseFloat(totalAmount);
        const paid = parseFloat(paidAmount);
        if (!isNaN(total) && !isNaN(paid) && paid > total) {
          errors[field] = 'Paid amount cannot exceed total amount';
          return false;
        }
        break;
      }
      case 'comment': {
        if (comment.trim().length > 0) {
          const result = validateString(comment, { minLength: 0, maxLength: 500, required: false });
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
    if (!validateField('totalAmount')) isValid = false;
    if (!validateField('paidAmount')) isValid = false;
    if (!validateField('comment')) isValid = false;
    
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
      const debtData = {
        name: name.trim(),
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount),
        comment: comment.trim() || undefined,
      };
      
      if (editId) {
        // Update existing debt
        await updateDebt(userId, editId, debtData);
      } else {
        // Add new debt
        await addDebt(userId, debtData);
      }
      
      // Close modal on success
      dispatch('close');
    } catch (error: any) {
      console.error('Error saving debt:', error);
      errors.submit = error.message || 'Failed to save debt. Please try again.';
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
    <label for="debt-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Debt Name *
    </label>
    <input
      id="debt-name"
      type="text"
      bind:value={name}
      on:blur={() => handleBlur('name')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="Enter debt name"
      disabled={isSubmitting}
      required
    />
    {#if errors.name}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
    {/if}
  </div>
  
  <!-- Total Amount field -->
  <div>
    <label for="debt-total-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Total Amount *
    </label>
    <input
      id="debt-total-amount"
      type="number"
      step="0.01"
      min="0.01"
      bind:value={totalAmount}
      on:blur={() => handleBlur('totalAmount')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="0.00"
      disabled={isSubmitting}
      required
    />
    {#if errors.totalAmount}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.totalAmount}</p>
    {/if}
  </div>
  
  <!-- Paid Amount field -->
  <div>
    <label for="debt-paid-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Paid Amount *
    </label>
    <input
      id="debt-paid-amount"
      type="number"
      step="0.01"
      min="0"
      bind:value={paidAmount}
      on:blur={() => handleBlur('paidAmount')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="0.00"
      disabled={isSubmitting}
      required
    />
    {#if errors.paidAmount}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paidAmount}</p>
    {/if}
  </div>
  
  <!-- Comment field -->
  <div>
    <label for="debt-comment" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Comment
    </label>
    <textarea
      id="debt-comment"
      bind:value={comment}
      on:blur={() => handleBlur('comment')}
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
      placeholder="Optional comment or notes"
      disabled={isSubmitting}
    />
    {#if errors.comment}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.comment}</p>
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
        {editId ? 'Update' : 'Add'} Debt
      {/if}
    </button>
  </div>
</form>
