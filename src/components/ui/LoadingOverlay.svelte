<script lang="ts">
  import { translations } from '../../lib/i18n';

  export let isVisible: boolean = false;
  export let message: string = '';

  let currentTranslations: Record<string, any>;

  // Subscribe to translations
  translations.subscribe(t => {
    currentTranslations = t;
  });

  $: displayMessage = message || currentTranslations?.['loading'] || 'Loading...';
</script>

{#if isVisible}
  <div class="loading-overlay" role="alert" aria-live="assertive" aria-busy="true">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>{displayMessage}</p>
    </div>
  </div>
{/if}

<style>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .loading-spinner {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 1rem;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  p {
    margin: 0;
    color: #333;
    font-weight: 500;
    font-size: 0.875rem;
  }

  /* Dark mode styles */
  :global(.dark) .loading-spinner {
    background: #1f2937;
  }

  :global(.dark) .spinner {
    border-color: #374151;
    border-top-color: #fbbf24;
  }

  :global(.dark) p {
    color: #f3f4f6;
  }
</style>
