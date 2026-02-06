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
  $: radio = $radioStore;
</script>

<div class="mobile-app-container mobile-view">
  <!-- Offline indicator -->
  {#if $uiStore.isOffline}
    <div class="mobile-offline-indicator" role="alert" aria-live="polite">
      <span>Offline</span>
    </div>
  {/if}

  <!-- Mobile Header -->
  <MobileHeader />

  <!-- Main content area -->
  <div class="mobile-content-wrapper" class:has-player={radio.isPlaying}>
    <MainContent />
  </div>

  <!-- Sticky Player Bar (Only when playing) -->
  {#if radio.isPlaying}
    <div class="mobile-player-bar" transition:slide>
      <div class="player-icon-pulse">🎵</div>
      <div class="player-track-info">
        <div class="player-marquee">
          <span>{radio.trackTitle || 'Loading...'}</span>
          <!-- Duplicate for seamless scroll -->
          <span aria-hidden="true">{radio.trackTitle || 'Loading...'}</span>
        </div>
      </div>
      <button class="player-control-btn" on:click={() => radioStore.toggle()}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>
    </div>
  {/if}

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
    padding-bottom: calc(
      var(--mobile-bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px) + 1rem
    ); /* +1rem safe buffer */
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
    transition: padding-bottom 0.3s ease;
  }

  .mobile-content-wrapper.has-player {
    /* Add extra padding when player is visible (player height ~48px) */
    padding-bottom: calc(
      var(--mobile-bottom-nav-height, 64px) + 48px + env(safe-area-inset-bottom, 0px) + 1rem
    );
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

  /* Player Bar */
  .mobile-player-bar {
    height: 48px;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    padding: 0 1rem;
    gap: 0.75rem;
    color: white;
    z-index: 90; /* Below MobileBottomNav if nav uses z-index 100? No, this is flex flow */
    /* If flex flow, this sits ABOVE Nav visually in stack, so physically above it on screen? */
    /* Yes, flex-direction column: Header -> Content -> Player -> Nav. Correct order. */
    flex-shrink: 0;
  }

  :global(.dark) .mobile-player-bar {
    background: rgba(15, 23, 42, 0.95);
    border-top-color: rgba(255, 255, 255, 0.05);
  }

  .player-icon-pulse {
    animation: pulse 2s infinite;
    font-size: 1.25rem;
  }

  .player-track-info {
    flex: 1;
    overflow: hidden;
    position: relative;
    mask-image: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
  }

  .player-marquee {
    display: flex;
    gap: 2rem;
    white-space: nowrap;
    animation: marquee 15s linear infinite;
  }

  .player-control-btn {
    background: none;
    border: none;
    color: white;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(0.9);
    }
  }

  /* Global Mobile Table Fixes */
  :global(.mobile-view table) {
    font-size: 0.75rem !important;
  }

  :global(.mobile-view th),
  :global(.mobile-view td) {
    padding: 0.5rem 0.25rem !important;
    white-space: nowrap; /* Prevent wrapping overlap somewhat */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Allow name column to wrap if needed or truncate cleaner */
  :global(.mobile-view td:first-child) {
    max-width: 120px;
  }
</style>
