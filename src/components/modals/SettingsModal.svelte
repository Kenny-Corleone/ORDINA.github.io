<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { uiStore } from '../../lib/stores/uiStore';
  import { financeStore } from '../../lib/stores/financeStore';
  import { Theme, Language, Currency } from '../../lib/types';
  
  const dispatch = createEventDispatcher();
  
  // Get current settings from stores
  $: theme = $uiStore.theme;
  $: language = $uiStore.language;
  $: currency = $financeStore.currency;
  $: exchangeRate = $financeStore.exchangeRate;
  
  // Local state for exchange rate editing
  let editingExchangeRate = false;
  let newExchangeRate = String(exchangeRate);
  let exchangeRateError = '';
  
  // Handle theme change
  function handleThemeChange(newTheme: Theme) {
    uiStore.setTheme(newTheme);
  }
  
  // Handle language change
  function handleLanguageChange(newLanguage: Language) {
    uiStore.setLanguage(newLanguage);
  }
  
  // Handle currency change
  function handleCurrencyChange(newCurrency: Currency) {
    financeStore.setCurrency(newCurrency);
  }
  
  // Start editing exchange rate
  function startEditExchangeRate() {
    editingExchangeRate = true;
    newExchangeRate = String(exchangeRate);
    exchangeRateError = '';
  }
  
  // Cancel editing exchange rate
  function cancelEditExchangeRate() {
    editingExchangeRate = false;
    newExchangeRate = String(exchangeRate);
    exchangeRateError = '';
  }
  
  // Save exchange rate
  function saveExchangeRate() {
    const rate = parseFloat(newExchangeRate);
    
    if (isNaN(rate) || rate <= 0) {
      exchangeRateError = 'Please enter a valid positive number';
      return;
    }
    
    financeStore.setExchangeRate(rate);
    editingExchangeRate = false;
    exchangeRateError = '';
  }
  
  // Clear all local data
  function handleClearData() {
    if (confirm('Are you sure you want to clear all local settings? This will reset theme, language, and currency preferences. Your Firebase data will not be affected.')) {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('theme');
        localStorage.removeItem('language');
        localStorage.removeItem('currency');
        localStorage.removeItem('exchangeRate');
        localStorage.removeItem('shoppingList');
      }
      
      // Reset stores to defaults
      uiStore.setTheme(Theme.LIGHT);
      uiStore.setLanguage(Language.EN);
      financeStore.setCurrency(Currency.AZN);
      financeStore.setExchangeRate(1.7);
      
      alert('Local settings have been cleared and reset to defaults.');
    }
  }
  
  // Handle close
  function handleClose() {
    dispatch('close');
  }
  
  // Language options
  const languageOptions = [
    { value: Language.EN, label: 'English' },
    { value: Language.RU, label: 'Русский' },
    { value: Language.AZ, label: 'Azərbaycan' },
    { value: Language.IT, label: 'Italiano' },
  ];
  
  // Theme options
  const themeOptions = [
    { value: Theme.LIGHT, label: 'Light', icon: '☀️' },
    { value: Theme.DARK, label: 'Dark', icon: '🌙' },
  ];
  
  // Currency options
  const currencyOptions = [
    { value: Currency.AZN, label: 'AZN (Azerbaijani Manat)' },
    { value: Currency.USD, label: 'USD (US Dollar)' },
  ];
</script>

<div class="settings space-y-6">
  <!-- Theme Settings -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
    <div class="grid grid-cols-2 gap-3">
      {#each themeOptions as option}
        <button
          type="button"
          on:click={() => handleThemeChange(option.value)}
          class="p-4 rounded-lg border-2 transition-all text-left"
          class:border-blue-500={theme === option.value}
          class:bg-blue-50={theme === option.value}
          class:selected-dark={theme === option.value}
          class:border-gray-200={theme !== option.value}
          class:dark:border-gray-700={theme !== option.value}
          class:hover:border-gray-300={theme !== option.value}
          class:dark:hover:border-gray-600={theme !== option.value}
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl">{option.icon}</span>
            <span class="font-medium text-gray-900 dark:text-white">{option.label}</span>
          </div>
          {#if theme === option.value}
            <div class="mt-2 text-sm text-blue-600 dark:text-blue-400">✓ Active</div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Language Settings -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Language</h3>
    <div class="grid grid-cols-2 gap-3">
      {#each languageOptions as option}
        <button
          type="button"
          on:click={() => handleLanguageChange(option.value)}
          class="p-4 rounded-lg border-2 transition-all text-left"
          class:border-blue-500={language === option.value}
          class:bg-blue-50={language === option.value}
          class:selected-dark={language === option.value}
          class:border-gray-200={language !== option.value}
          class:dark:border-gray-700={language !== option.value}
          class:hover:border-gray-300={language !== option.value}
          class:dark:hover:border-gray-600={language !== option.value}
        >
          <div class="font-medium text-gray-900 dark:text-white">{option.label}</div>
          {#if language === option.value}
            <div class="mt-2 text-sm text-blue-600 dark:text-blue-400">✓ Active</div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Currency Settings -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Currency</h3>
    <div class="space-y-3">
      {#each currencyOptions as option}
        <button
          type="button"
          on:click={() => handleCurrencyChange(option.value)}
          class="w-full p-4 rounded-lg border-2 transition-all text-left"
          class:border-blue-500={currency === option.value}
          class:bg-blue-50={currency === option.value}
          class:selected-dark={currency === option.value}
          class:border-gray-200={currency !== option.value}
          class:dark:border-gray-700={currency !== option.value}
          class:hover:border-gray-300={currency !== option.value}
          class:dark:hover:border-gray-600={currency !== option.value}
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-900 dark:text-white">{option.label}</span>
            {#if currency === option.value}
              <span class="text-sm text-blue-600 dark:text-blue-400">✓ Active</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Exchange Rate Settings -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Exchange Rate (AZN to USD)</h3>
    {#if editingExchangeRate}
      <div class="space-y-2">
        <div class="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            bind:value={newExchangeRate}
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter exchange rate"
          />
          <button
            type="button"
            on:click={saveExchangeRate}
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            on:click={cancelEditExchangeRate}
            class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
        {#if exchangeRateError}
          <p class="text-sm text-red-600 dark:text-red-400">{exchangeRateError}</p>
        {/if}
      </div>
    {:else}
      <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <div class="text-gray-900 dark:text-white font-medium">
            1 USD = {exchangeRate} AZN
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Used for currency conversion in the app
          </div>
        </div>
        <button
          type="button"
          on:click={startEditExchangeRate}
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      </div>
    {/if}
  </div>
  
  <!-- Data Management -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Data Management</h3>
    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Clear all local settings and preferences stored in your browser. This will not affect your Firebase data (expenses, debts, tasks, etc.).
      </p>
      <button
        type="button"
        on:click={handleClearData}
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Clear Local Settings
      </button>
    </div>
  </div>
  
  <!-- Info message -->
  <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
    <p class="text-sm text-blue-700 dark:text-blue-300">
      Settings are saved automatically and persist across sessions. Changes take effect immediately.
    </p>
  </div>
  
  <!-- Close button -->
  <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
    <button
      type="button"
      on:click={handleClose}
      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      Close
    </button>
  </div>
</div>

<style>
  /* Selected option dark mode background */
  :global(.dark) .selected-dark {
    background: rgba(59, 130, 246, 0.2);
  }
</style>
