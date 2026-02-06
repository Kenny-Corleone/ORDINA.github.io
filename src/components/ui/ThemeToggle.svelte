<script lang="ts">
  import { uiStore } from '../../lib/stores/uiStore';
  import { Theme } from '../../lib/types';

  let theme: Theme;
  
  // Subscribe to theme changes
  uiStore.subscribe(state => {
    theme = state.theme;
  });

  function toggleTheme() {
    uiStore.toggleTheme();
  }
</script>

<button
  class="theme-toggle-btn"
  on:click={toggleTheme}
  aria-label="Toggle theme"
  title={theme === Theme.DARK ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if theme === Theme.DARK}
    <!-- Sun icon for light mode -->
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  {:else}
    <!-- Moon icon for dark mode -->
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  {/if}
</button>

<style>
  .theme-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: #667eea;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .theme-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .theme-toggle-btn:active {
    transform: translateY(0);
  }

  /* Dark mode styles */
  :global(.dark) .theme-toggle-btn {
    background: rgba(0, 0, 0, 0.2);
    color: #fbbf24;
  }

  :global(.dark) .theme-toggle-btn:hover {
    background: rgba(0, 0, 0, 0.3);
  }
</style>
