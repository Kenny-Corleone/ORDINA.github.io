<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { uiStore } from '../../../lib/stores/uiStore';
  import { weatherStore } from '../../../lib/stores/weatherStore';
  import { radioStore } from '../../../lib/stores/radioStore';
  import { createKeyboardShortcutManager } from '../../../lib/utils/keyboard';
  import { createTabSwipeHandler } from '../../../lib/utils/gestures';
  import { getRadioPlayer } from '../../../lib/services/radio';
  import MobileHeader from './MobileHeader.svelte';
  import MobileBottomNav from './MobileBottomNav.svelte';
  import MobileSheet from './MobileSheet.svelte';
  import MainContent from '../MainContent.svelte';
  import ModalSystem from '../../modals/ModalSystem.svelte';

  // Define tab order for swipe navigation
  const tabs = ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'];

  // Get radio player instance
  const radioPlayer = getRadioPlayer();

  // Create keyboard shortcut manager
  const keyboardShortcuts = createKeyboardShortcutManager(
    [
      {
        key: 'e',
        ctrl: true,
        callback: () => uiStore.openModal('expense'),
        description: 'Add Expense',
      },
      {
        key: 't',
        ctrl: true,
        callback: () => uiStore.openModal('dailyTask'),
        description: 'Add Task',
      },
      {
        key: 'd',
        ctrl: true,
        callback: () => uiStore.openModal('debt'),
        description: 'Add Debt',
      },
      {
        key: 'r',
        ctrl: true,
        callback: () => uiStore.openModal('recurring'),
        description: 'Add Recurring Expense',
      },
      {
        key: ' ',
        callback: () => {
          radioPlayer.toggle().catch((err) => {
            console.error('Radio toggle error:', err);
          });
        },
        description: 'Toggle Radio',
      },
    ],
    { ignoreInputFields: true, preventDefault: true },
  );

  // Create swipe gesture handler for tab navigation
  const swipeHandler = createTabSwipeHandler(
    tabs,
    () => $uiStore.activeTab,
    (tab) => uiStore.setActiveTab(tab),
    { threshold: 50 },
  );

  let idleInitId: number | null = null;

  onMount(() => {
    // Attach keyboard shortcuts
    keyboardShortcuts.attach();

    // Attach swipe gesture handler
    swipeHandler.attach();

    // Initialize global stores/services (idle to reduce startup cost)
    const initHeavyWidgets = () => {
      weatherStore.init(undefined, $uiStore.language);
      radioStore.init();
    };
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (win.requestIdleCallback) {
      idleInitId = win.requestIdleCallback(initHeavyWidgets);
    } else {
      idleInitId = window.setTimeout(initHeavyWidgets, 0);
    }
  });

  onDestroy(() => {
    // Detach keyboard shortcuts
    keyboardShortcuts.detach();

    // Detach swipe gesture handler
    swipeHandler.detach();

    // Clean up global stores
    if (idleInitId !== null) {
      const win = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (win.cancelIdleCallback) {
        win.cancelIdleCallback(idleInitId);
      } else {
        clearTimeout(idleInitId);
      }
      idleInitId = null;
    }
    weatherStore.destroy();
    radioStore.destroy();
  });
</script>

<div class="mobile-app-container">
  <!-- Offline indicator -->
  {#if $uiStore.isOffline}
    <div class="mobile-offline-indicator" role="alert" aria-live="polite">
      <span>Offline</span>
    </div>
  {/if}

  <!-- Mobile Header -->
  <MobileHeader />

  <!-- Main content area -->
  <div class="mobile-content-wrapper">
    <MainContent />
  </div>

  <!-- Bottom Navigation -->
  <MobileBottomNav />

  <!-- More Menu Sheet -->
  <MobileSheet />

  <!-- Modal System -->
  <ModalSystem />
</div>

<style>
  .mobile-app-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary, #f8fafc);
  }

  :global(.dark) .mobile-app-container {
    background: var(--bg-primary-dark, #0f172a);
  }

  .mobile-content-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 1;
    /* Account for header and bottom nav */
    padding-top: var(--mobile-header-height, 56px);
    padding-bottom: calc(var(--mobile-bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px));
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .mobile-content-wrapper::-webkit-scrollbar {
    display: none;
  }

  .mobile-offline-indicator {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 24px;
    background: #f59e0b;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 150;
  }
</style>
