<script lang="ts">
  import { uiStore } from '../../../lib/stores/uiStore';
  import { translations, t } from '../../../lib/i18n';
  import { mobileUIStore } from '../../../lib/stores/mobileStore';

  // Current active tab
  $: activeTab = $uiStore.activeTab;

  // Navigation items - 5 items max for thumb zone
  const navItems = [
    { id: 'dashboard', icon: 'dashboard', labelKey: 'tabDashboard' },
    { id: 'expenses', icon: 'expenses', labelKey: 'tabExpenses' },
    { id: 'tasks', icon: 'tasks', labelKey: 'tabTasks' },
    { id: 'calendar', icon: 'calendar', labelKey: 'tabCalendar' },
    { id: 'more', icon: 'more', labelKey: 'more' },
  ];

  // Icons SVG
  const icons: Record<string, string> = {
    dashboard:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    expenses:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    tasks:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  };

  function handleNavClick(id: string) {
    if (id === 'more') {
      mobileUIStore.openBottomSheet('more');
    } else {
      uiStore.setActiveTab(id);
    }
  }

  function isActive(id: string): boolean {
    if (id === 'more') {
      // Highlight "more" when debts or recurring are active
      return activeTab === 'debts' || activeTab === 'recurring';
    }
    return activeTab === id;
  }
</script>

<nav class="mobile-bottom-nav" aria-label="Main Navigation">
  {#each navItems as item}
    <button
      class="nav-item"
      class:active={isActive(item.id)}
      on:click={() => handleNavClick(item.id)}
      aria-current={isActive(item.id) ? 'page' : undefined}
    >
      <div class="nav-icon">
        {@html icons[item.icon]}
      </div>
      <span class="nav-label">{t($translations, item.labelKey) || item.id}</span>
      {#if isActive(item.id)}
        <div class="active-dot"></div>
      {/if}
    </button>
  {/each}
</nav>

<style>
  .mobile-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--mobile-bottom-nav-height, 64px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--glass-bg-light);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--glass-border-light);
    display: flex;
    align-items: stretch;
    justify-content: space-around;
    z-index: 100;
  }

  :global(.dark) .mobile-bottom-nav {
    background: var(--glass-bg-dark);
    border-top-color: var(--glass-border-dark);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.5rem 0;
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s;
    position: relative;
    min-width: 0;
    min-height: 44px;
  }

  :global(.dark) .nav-item {
    color: #94a3b8;
  }

  .nav-item:active {
    background: rgba(0, 0, 0, 0.03);
  }

  :global(.dark) .nav-item:active {
    background: rgba(255, 255, 255, 0.05);
  }

  .nav-item.active {
    color: var(--primary, #4f46e5);
  }

  :global(.dark) .nav-item.active {
    color: var(--primary-light, #818cf8);
  }

  .nav-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .nav-label {
    font-size: 0.5rem; /* Reduced further to prevent overlap */
    font-weight: 700;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    padding: 0 0.25rem;
  }

  .active-dot {
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--primary, #4f46e5);
  }

  :global(.dark) .active-dot {
    background: var(--primary-light, #818cf8);
  }
</style>
