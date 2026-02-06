<script lang="ts">
  /**
   * Error Boundary Component for Svelte
   * 
   * Catches errors in child components and displays a fallback UI
   * instead of crashing the entire application.
   * 
   * Requirements: 8.1, 8.2, 12.1, 12.2
   * Validates: Property 25 (Console Error-Free Execution)
   * Validates: Property 26 (Exception-Free Event Handlers)
   */
  
  import { onMount, onDestroy } from 'svelte';
  import { handleError } from '../../lib/utils/logger';
  import { trackComponentLifecycle } from '../../lib/utils/errorHandler';
  
  export let fallbackMessage = 'Something went wrong. Please refresh the page.';
  export let showDetails = false;
  export let componentName = 'ErrorBoundary';
  
  let hasError = false;
  let errorMessage = '';
  let errorStack = '';
  let cleanup: (() => void) | null = null;
  
  // Track component lifecycle for memory leak detection
  onMount(() => {
    cleanup = trackComponentLifecycle(componentName);
  });
  
  onDestroy(() => {
    if (cleanup) {
      cleanup();
    }
  });
  
  /**
   * Handle errors from child components
   * 
   * Note: Svelte doesn't have built-in error boundaries like React,
   * so this component provides a pattern for wrapping potentially
   * error-prone sections with try-catch handling.
   */
  export function catchError(error: Error | any): void {
    hasError = true;
    errorMessage = error?.message || String(error);
    errorStack = error?.stack || '';
    
    // Log the error with context
    handleError(error, {
      module: componentName,
      action: 'component-error',
      showToUser: false // We're showing our own UI
    });
  }
  
  /**
   * Reset error state
   */
  export function reset(): void {
    hasError = false;
    errorMessage = '';
    errorStack = '';
  }
</script>

{#if hasError}
  <div class="error-boundary" role="alert" aria-live="assertive">
    <div class="error-boundary-content">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      
      <h2 class="error-title">Oops! Something went wrong</h2>
      
      <p class="error-message">{fallbackMessage}</p>
      
      {#if showDetails && import.meta.env.DEV}
        <details class="error-details">
          <summary>Error Details (Development Only)</summary>
          <div class="error-details-content">
            <p><strong>Message:</strong> {errorMessage}</p>
            {#if errorStack}
              <pre class="error-stack">{errorStack}</pre>
            {/if}
          </div>
        </details>
      {/if}
      
      <div class="error-actions">
        <button 
          class="btn-primary" 
          on:click={() => window.location.reload()}
          aria-label="Reload page"
        >
          Reload Page
        </button>
        
        <button 
          class="btn-secondary" 
          on:click={reset}
          aria-label="Try again"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 2rem;
    background: var(--bg-primary, #ffffff);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .error-boundary-content {
    max-width: 500px;
    text-align: center;
  }
  
  .error-icon {
    color: var(--color-error, #ef4444);
    margin-bottom: 1rem;
  }
  
  .error-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary, #1f2937);
    margin-bottom: 0.5rem;
  }
  
  .error-message {
    font-size: 1rem;
    color: var(--text-secondary, #6b7280);
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  
  .error-details {
    text-align: left;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 4px;
    border: 1px solid var(--border-color, #e5e7eb);
  }
  
  .error-details summary {
    cursor: pointer;
    font-weight: 500;
    color: var(--text-primary, #1f2937);
    user-select: none;
  }
  
  .error-details summary:hover {
    color: var(--color-primary, #3b82f6);
  }
  
  .error-details-content {
    margin-top: 1rem;
    font-size: 0.875rem;
  }
  
  .error-stack {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: var(--bg-tertiary, #ffffff);
    border-radius: 4px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--text-secondary, #6b7280);
  }
  
  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    outline: none;
  }
  
  .btn-primary {
    background: var(--color-primary, #3b82f6);
    color: white;
  }
  
  .btn-primary:hover {
    background: var(--color-primary-dark, #2563eb);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .btn-secondary {
    background: var(--bg-secondary, #f9fafb);
    color: var(--text-primary, #1f2937);
    border: 1px solid var(--border-color, #e5e7eb);
  }
  
  .btn-secondary:hover {
    background: var(--bg-tertiary, #f3f4f6);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  /* Dark theme support */
  :global(.dark) .error-boundary {
    background: var(--bg-primary-dark, #1f2937);
  }
  
  :global(.dark) .error-title {
    color: var(--text-primary-dark, #f9fafb);
  }
  
  :global(.dark) .error-message {
    color: var(--text-secondary-dark, #d1d5db);
  }
  
  :global(.dark) .error-details {
    background: var(--bg-secondary-dark, #374151);
    border-color: var(--border-color-dark, #4b5563);
  }
  
  :global(.dark) .error-details summary {
    color: var(--text-primary-dark, #f9fafb);
  }
  
  :global(.dark) .error-stack {
    background: var(--bg-tertiary-dark, #111827);
    color: var(--text-secondary-dark, #d1d5db);
  }
  
  :global(.dark) .btn-secondary {
    background: var(--bg-secondary-dark, #374151);
    color: var(--text-primary-dark, #f9fafb);
    border-color: var(--border-color-dark, #4b5563);
  }
  
  :global(.dark) .btn-secondary:hover {
    background: var(--bg-tertiary-dark, #4b5563);
  }
</style>
