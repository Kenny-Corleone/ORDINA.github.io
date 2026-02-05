/**
 * Mobile Store
 *
 * Manages mobile-specific UI state without affecting desktop.
 * Provides a single point to enable/disable mobile features.
 */

import { writable, derived } from 'svelte/store';
import { getDeviceType, type DeviceType } from '../utils/responsive';

// =====================================================
// FEATURE FLAG - Set to false to disable all mobile UI
// =====================================================
export const MOBILE_ENABLED = true;

// =====================================================
// Device Type Store (reactive)
// =====================================================
function createDeviceStore() {
  const { subscribe, set } = writable<DeviceType>(getDeviceType());

  // Update on resize (called from responsive system)
  function update() {
    set(getDeviceType());
  }

  return {
    subscribe,
    update,
  };
}

export const deviceType = createDeviceStore();

// Derived stores for convenience
export const isMobileDevice = derived(
  deviceType,
  ($deviceType) => MOBILE_ENABLED && $deviceType === 'mobile',
);

export const isTabletDevice = derived(deviceType, ($deviceType) => $deviceType === 'tablet');

export const isDesktopDevice = derived(deviceType, ($deviceType) => $deviceType === 'desktop');

// =====================================================
// Mobile UI State
// =====================================================
export type BottomSheetContent = 'more' | 'settings' | 'profile' | null;

interface MobileUIState {
  isBottomSheetOpen: boolean;
  bottomSheetContent: BottomSheetContent;
  isHeaderExpanded: boolean; // For pull-down widget expansion
}

function createMobileUIStore() {
  const { subscribe, set, update } = writable<MobileUIState>({
    isBottomSheetOpen: false,
    bottomSheetContent: null,
    isHeaderExpanded: false,
  });

  return {
    subscribe,

    openBottomSheet(content: BottomSheetContent) {
      update((state) => ({
        ...state,
        isBottomSheetOpen: true,
        bottomSheetContent: content,
      }));
    },

    closeBottomSheet() {
      update((state) => ({
        ...state,
        isBottomSheetOpen: false,
        bottomSheetContent: null,
      }));
    },

    toggleHeaderExpanded() {
      update((state) => ({
        ...state,
        isHeaderExpanded: !state.isHeaderExpanded,
      }));
    },

    collapseHeader() {
      update((state) => ({
        ...state,
        isHeaderExpanded: false,
      }));
    },

    reset() {
      set({
        isBottomSheetOpen: false,
        bottomSheetContent: null,
        isHeaderExpanded: false,
      });
    },
  };
}

export const mobileUIStore = createMobileUIStore();

// =====================================================
// Utility Functions
// =====================================================

/**
 * Check if mobile features are currently active
 */
export function isMobileActive(): boolean {
  return MOBILE_ENABLED && getDeviceType() === 'mobile';
}

/**
 * Subscribe to device type changes
 * Call this from responsive.ts when device type changes
 */
export function notifyDeviceTypeChange() {
  deviceType.update();
}
