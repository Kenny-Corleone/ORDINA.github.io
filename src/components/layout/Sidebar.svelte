<script lang="ts">
  import { uiStore } from '../../lib/stores/uiStore';
  import { translations, t } from '../../lib/i18n';

  // Subscribe to active tab
  $: activeTab = $uiStore.activeTab;

  // Tab configuration
  const tabs = [
    { id: 'dashboard', icon: 'dashboard', labelKey: 'tabDashboard' },
    { id: 'expenses', icon: 'expenses', labelKey: 'tabExpenses' },
    { id: 'debts', icon: 'debts', labelKey: 'tabDebts' },
    { id: 'recurring', icon: 'recurring', labelKey: 'tabRecurring' },
    { id: 'tasks', icon: 'tasks', labelKey: 'tabTasks' },
    { id: 'calendar', icon: 'calendar', labelKey: 'tabCalendar' },
  ];

  // Switch tab
  function switchTab(tabId: string) {
    uiStore.setActiveTab(tabId);

    // Close mobile sidebar if open
    uiStore.closeMobileSidebar();
  }

  // Get icon SVG for each tab
  function getTabIcon(icon: string): string {
    const icons: Record<string, string> = {
      dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      expenses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      debts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="12" y1="2" x2="12" y2="6"/></svg>',
      recurring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
      tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
      calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    };
    return icons[icon] || '';
  }
</script>

<!-- Mobile Sidebar (vertical tabs) - Only visible on mobile -->
<aside id="mini-sidebar" class="block sm:hidden flex flex-col gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto w-full h-full">
  {#each tabs as tab}
    <button
      data-tab={tab.id}
      class="tab-button {activeTab === tab.id ? 'tab-active' : ''} text-xs px-1 py-3 rounded-lg text-center transition-all w-full"
      on:click={() => switchTab(tab.id)}
    >
      <div class="flex flex-col items-center gap-1">
        <div class="w-6 h-6 shrink-0">
          {@html getTabIcon(tab.icon)}
        </div>
        <span class="text-[10px] leading-tight break-words w-full">{t($translations, tab.labelKey)}</span>
      </div>
    </button>
  {/each}
</aside>

<!-- Mobile Sidebar Overlay (for full-screen menu) -->
<div 
  class="mobile-sidebar-overlay" 
  class:mobile-sidebar-overlay-visible={$uiStore.isMobileSidebarOpen}
  role="button"
  tabindex="0"
  aria-label="Close sidebar"
  on:click={() => {
    uiStore.closeMobileSidebar();
  }}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      uiStore.closeMobileSidebar();
    }
  }}
></div>

<!-- Mobile Sidebar (slide-in menu) -->
<aside class="mobile-sidebar" class:mobile-sidebar-open={$uiStore.isMobileSidebarOpen}>
  <div class="mobile-sidebar-header">
    <h2 class="text-lg font-bold">{t($translations, 'menu') || 'Menu'}</h2>
    <button 
      class="mobile-sidebar-close"
      on:click={() => {
        uiStore.closeMobileSidebar();
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
  <nav class="mobile-sidebar-nav">
    {#each tabs as tab}
      <button
        data-tab={tab.id}
        class="mobile-sidebar-item {activeTab === tab.id ? 'mobile-sidebar-item-active' : ''}"
        on:click={() => switchTab(tab.id)}
      >
        <div class="w-6 h-6">
          {@html getTabIcon(tab.icon)}
        </div>
        <span>{t($translations, tab.labelKey)}</span>
      </button>
    {/each}
  </nav>
</aside>

<style>
  /* Mobile sidebar styles */
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    max-width: 85vw;
    background: var(--glass-bg-light);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-right: 1px solid var(--glass-border-light);
    box-shadow: var(--glass-shadow-light);
    z-index: 1000;
    transform: translateX(-100%);
    /* Use cubic-bezier for smooth slide-in animation */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    /* Performance optimization */
    will-change: transform;
  }

  :global(.dark) .mobile-sidebar {
    background: var(--glass-bg-dark);
    border-right-color: var(--glass-border-dark);
    box-shadow: var(--glass-shadow-dark);
  }

  .mobile-sidebar-open {
    transform: translateX(0);
  }

  .mobile-sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--glass-border-light);
  }

  :global(.dark) .mobile-sidebar-header {
    border-bottom-color: var(--glass-border-dark);
  }

  .mobile-sidebar-close {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .mobile-sidebar-close:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .mobile-sidebar-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .mobile-sidebar-close svg {
    width: 20px;
    height: 20px;
  }

  .mobile-sidebar-nav {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-sidebar-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s;
    text-align: left;
    /* Ensure minimum touch target size */
    min-height: 56px;
    min-width: 44px;
  }

  .mobile-sidebar-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .mobile-sidebar-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .mobile-sidebar-item-active {
    background-color: rgba(var(--primary-rgb), 0.1);
    color: var(--primary);
  }

  .mobile-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
    opacity: 0;
    pointer-events: none;
    /* Use cubic-bezier for smooth fade-in animation */
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mobile-sidebar-overlay-visible {
    opacity: 1;
    pointer-events: auto;
  }
</style>
