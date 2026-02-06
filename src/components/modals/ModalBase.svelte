<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let isOpen: boolean = false;
  export let title: string = '';
  export let modalId: string = '';
  
  const dispatch = createEventDispatcher();
  
  let modalElement: HTMLElement;
  let previouslyFocusedElement: HTMLElement | null = null;
  let focusableElements: HTMLElement[] = [];
  
  // Handle Escape key to close modal
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      handleClose();
    }
    
    // Handle Tab key for focus trapping
    if (event.key === 'Tab' && isOpen && focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (!firstElement || !lastElement) return;
      
      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
  
  // Handle backdrop click to close modal
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClose();
    }
  }
  
  // Close modal and dispatch event
  function handleClose() {
    dispatch('close');
  }
  
  // Update focusable elements list
  function updateFocusableElements() {
    if (!modalElement) return;
    
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    focusableElements = Array.from(modalElement.querySelectorAll(selector)) as HTMLElement[];
  }
  
  // Focus first input/textarea/select so user can type immediately; else first focusable
  function focusFirstInput() {
    if (!modalElement) return;
    const firstInput = modalElement.querySelector('input:not([type="hidden"]), textarea, select') as HTMLElement | null;
    if (firstInput && typeof firstInput.focus === 'function') {
      firstInput.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
  
  // Handle modal open/close
  $: if (isOpen) {
    // Store currently focused element
    previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Update focusable elements and focus first input (so user can type in form)
    setTimeout(() => {
      updateFocusableElements();
      focusFirstInput();
    }, 100);
  } else {
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Restore focus to previously focused element
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  }
  
  onMount(() => {
    // Attach keyboard event listener
    window.addEventListener('keydown', handleKeydown);
  });
  
  onDestroy(() => {
    // Remove keyboard event listener
    window.removeEventListener('keydown', handleKeydown);
    
    // Restore body scroll if modal was open
    document.body.style.overflow = '';
  });
</script>

{#if isOpen}
  <!-- Modal backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div
    class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 animate-fade-in"
    on:click={handleBackdropClick}
    on:keydown={handleBackdropKeydown}
    role="button"
    tabindex="0"
    aria-label="Close modal"
  >
    <!-- Modal container: stop propagation so clicks on inputs/buttons don't bubble to backdrop -->
    <div
      bind:this={modalElement}
      id={modalId}
      class="modal-container bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="{modalId}-title"
      on:click|stopPropagation
  >
      <!-- Modal header -->
      <div class="modal-header sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
        <h2 id="{modalId}-title" class="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          on:click={handleClose}
          aria-label="Close modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Modal content (slot) -->
      <div class="modal-content px-6 py-4">
        <slot />
      </div>
      
      <!-- Modal footer (optional slot) -->
      {#if $$slots.footer}
        <div class="modal-footer sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Fade in animation for backdrop */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  /* Slide up animation for modal */
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
  
  /* Smooth scrolling and ensure inputs receive clicks */
  .modal-container {
    scroll-behavior: smooth;
    pointer-events: auto;
  }
  .modal-content {
    pointer-events: auto;
  }
  
  /* Custom scrollbar for modal */
  .modal-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .modal-container::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .modal-container::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
  }
  
  .modal-container::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.7);
  }
  
  /* Dark mode scrollbar */
  :global(.dark) .modal-container::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5);
  }
  
  :global(.dark) .modal-container::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.7);
  }
</style>
