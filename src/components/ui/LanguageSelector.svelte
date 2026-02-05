<script lang="ts">
  import { uiStore } from '../../lib/stores/uiStore';
  import { translations } from '../../lib/i18n';
  import { Language } from '../../lib/types';

  let currentLanguage: Language;
  let currentTranslations: Record<string, any>;
  
  // Subscribe to language changes
  uiStore.subscribe(state => {
    currentLanguage = state.language;
  });

  // Subscribe to translations
  translations.subscribe(t => {
    currentTranslations = t;
  });

  function changeLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newLanguage = target.value as Language;
    uiStore.setLanguage(newLanguage);
  }

  // Language options with native names
  const languageOptions = [
    { value: Language.EN, label: 'English', flag: '🇬🇧' },
    { value: Language.RU, label: 'Русский', flag: '🇷🇺' },
    { value: Language.AZ, label: 'Azərbaycan', flag: '🇦🇿' },
    { value: Language.IT, label: 'Italiano', flag: '🇮🇹' }
  ];
</script>

<div class="language-selector">
  <select
    class="language-select"
    value={currentLanguage}
    on:change={changeLanguage}
    aria-label="Select language"
  >
    {#each languageOptions as option}
      <option value={option.value}>
        {option.flag} {option.label}
      </option>
    {/each}
  </select>
</div>

<style>
  .language-selector {
    position: relative;
  }

  .language-select {
    appearance: none;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: none;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: #667eea;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
  }

  .language-select:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .language-select:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  .language-select option {
    background: white;
    color: #333;
    padding: 0.5rem;
  }

  /* Dark mode styles */
  :global(.dark) .language-select {
    background-color: rgba(0, 0, 0, 0.2);
    color: #fbbf24;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fbbf24' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  }

  :global(.dark) .language-select:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }

  :global(.dark) .language-select option {
    background: #1f2937;
    color: #f3f4f6;
  }
</style>
