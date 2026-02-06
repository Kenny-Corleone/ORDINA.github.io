<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { financeStore } from '../../lib/stores/financeStore';
  import { userStore } from '../../lib/stores/userStore';
  import { addDebtPayment } from '../../lib/services/firebase/debts';
  import { validateNumber, validateDate } from '../../lib/utils/validation';
  import { getTodayISOString } from '../../lib/utils/formatting';
  import type { Debt } from '../../lib/types';
  
  export let debtId: string;
  
  const dispatch = createEventDispatcher();
  
  // Form state
  let paymentAmount = '';
  let paymentDate = getTodayISOString();
  
  // Validation errors
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Get data from stores
  $: userId = $userStore.userId;
  $: selectedMonthId = $financeStore.selectedMonthId;
  $: debts = $financeStore.debts;
  
  // Get the debt being paid
  $: debt = debts.find(d => d.id === debtId);
  $: remainingAmount = debt ? debt.totalAmount - debt.paidAmount : 0;
  
  // Validate individual field
  function validateField(field: string): boolean {
    delete errors[field];
    
    switch (field) {
      case 'paymentAmount': {
        const result = validateNumber(paymentAmount, { 
          min: 0.01, 
          max: remainingAmount,
          required: true, 
          allowZero: false 
        });
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
        }
        // Additional check for remaining amount
        const amount = parseFloat(paymentAmount);
        if (!isNaN(amount) && amount > remainingAmount) {
          errors[field] = `Payment cannot exceed remaining amount (${remainingAmount.toFixed(2)})`;
          return false;
        }
        break;
      }
      case 'paymentDate': {
        const result = validateDate(paymentDate, { required: true });
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
    
    if (!validateField('paymentAmount')) isValid = false;
    if (!validateField('paymentDate')) isValid = false;
    
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
    
    if (!debt) {
      errors.submit = 'Debt not found';
      return;
    }
    
    isSubmitting = true;
    errors = {};
    
    try {
      await addDebtPayment(
        userId,
        selectedMonthId,
        debtId,
        parseFloat(paymentAmount),
        paymentDate
      );
      
      // Close modal on success
      dispatch('close');
    } catch (error: any) {
      console.error('Error adding debt payment:', error);
      errors.submit = error.message || 'Failed to add payment. Please try again.';
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
  
  // Handle input for payment amount - filter to allow only numeric input
  function handlePaymentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Allow only numbers and decimal point
    value = value.replace(/[^\d.]/g, '');
    
    // Allow only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Update the bound value
    paymentAmount = value;
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <!-- Debt info -->
  {#if debt}
    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
      <h3 class="font-medium text-blue-900 dark:text-blue-100 mb-2">{debt.name}</h3>
      <div class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
        <p>Total Amount: <span class="font-semibold">{debt.totalAmount.toFixed(2)}</span></p>
        <p>Paid Amount: <span class="font-semibold">{debt.paidAmount.toFixed(2)}</span></p>
        <p>Remaining: <span class="font-semibold">{remainingAmount.toFixed(2)}</span></p>
      </div>
    </div>
  {/if}
  
  <!-- Payment Amount field -->
  <div>
    <label for="payment-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Payment Amount *
    </label>
    <input
      id="payment-amount"
      type="text"
      inputmode="decimal"
      bind:value={paymentAmount}
      on:input={handlePaymentInput}
      on:blur={() => handleBlur('paymentAmount')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="0.00"
      disabled={isSubmitting}
      required
      aria-label="Payment amount"
      aria-describedby="payment-amount-help"
    />
    {#if errors.paymentAmount}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paymentAmount}</p>
    {/if}
    <p id="payment-amount-help" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      Maximum: {remainingAmount.toFixed(2)}
    </p>
  </div>
  
  <!-- Payment Date field -->
  <div>
    <label for="payment-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Payment Date *
    </label>
    <input
      id="payment-date"
      type="date"
      bind:value={paymentDate}
      on:blur={() => handleBlur('paymentDate')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      disabled={isSubmitting}
      required
    />
    {#if errors.paymentDate}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paymentDate}</p>
    {/if}
  </div>
  
  <!-- Info message -->
  <div class="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      This payment will be recorded as an expense in the "{selectedMonthId}" month with the category "Debt Payment".
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
        Processing...
      {:else}
        Add Payment
      {/if}
    </button>
  </div>
</form>
