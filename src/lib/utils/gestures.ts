/**
 * Gesture Detection Utility Module
 * 
 * Provides touch gesture detection for mobile devices.
 * Supports swipe gestures (left, right, up, down) for navigation.
 */

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface SwipeGestureOptions {
  /**
   * Minimum distance (in pixels) for a swipe to be recognized
   * @default 50
   */
  threshold?: number;
  
  /**
   * Maximum time (in milliseconds) for a swipe to be recognized
   * @default 500
   */
  maxDuration?: number;
  
  /**
   * Callback function when a swipe is detected
   */
  onSwipe?: (event: SwipeEvent) => void;
  
  /**
   * Callback function when a left swipe is detected
   */
  onSwipeLeft?: (event: SwipeEvent) => void;
  
  /**
   * Callback function when a right swipe is detected
   */
  onSwipeRight?: (event: SwipeEvent) => void;
  
  /**
   * Callback function when an up swipe is detected
   */
  onSwipeUp?: (event: SwipeEvent) => void;
  
  /**
   * Callback function when a down swipe is detected
   */
  onSwipeDown?: (event: SwipeEvent) => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  endX: number;
  endY: number;
  endTime: number;
}

/**
 * Determines the swipe direction based on touch coordinates
 */
function getSwipeDirection(startX: number, startY: number, endX: number, endY: number): SwipeDirection {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  
  // Determine if swipe is more horizontal or vertical
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    return deltaX > 0 ? 'right' : 'left';
  } else {
    // Vertical swipe
    return deltaY > 0 ? 'down' : 'up';
  }
}

/**
 * Calculates the distance of a swipe
 */
function getSwipeDistance(startX: number, startY: number, endX: number, endY: number): number {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

/**
 * Creates a swipe gesture detector
 * 
 * @param options - Configuration options for swipe detection
 * @returns Object with attach/detach methods
 * 
 * @example
 * ```typescript
 * const swipeDetector = createSwipeGestureDetector({
 *   threshold: 50,
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right')
 * });
 * 
 * // In Svelte component
 * onMount(() => {
 *   swipeDetector.attach();
 * });
 * 
 * onDestroy(() => {
 *   swipeDetector.detach();
 * });
 * ```
 */
export function createSwipeGestureDetector(options: SwipeGestureOptions = {}) {
  const {
    threshold = 50,
    maxDuration = 500,
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;
  
  let touchState: TouchState | null = null;
  let isAttached = false;
  
  function handleTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0];
    touchState = {
      startX: touch.screenX,
      startY: touch.screenY,
      startTime: Date.now(),
      endX: touch.screenX,
      endY: touch.screenY,
      endTime: Date.now()
    };
  }
  
  function handleTouchMove(event: TouchEvent) {
    if (!touchState) return;
    
    const touch = event.changedTouches[0];
    touchState.endX = touch.screenX;
    touchState.endY = touch.screenY;
    touchState.endTime = Date.now();
  }
  
  function handleTouchEnd(event: TouchEvent) {
    if (!touchState) return;
    
    const touch = event.changedTouches[0];
    touchState.endX = touch.screenX;
    touchState.endY = touch.screenY;
    touchState.endTime = Date.now();
    
    // Calculate swipe properties
    const distance = getSwipeDistance(
      touchState.startX,
      touchState.startY,
      touchState.endX,
      touchState.endY
    );
    const duration = touchState.endTime - touchState.startTime;
    
    // Check if swipe meets threshold and duration requirements
    if (distance >= threshold && duration <= maxDuration) {
      const direction = getSwipeDirection(
        touchState.startX,
        touchState.startY,
        touchState.endX,
        touchState.endY
      );
      
      const swipeEvent: SwipeEvent = {
        direction,
        distance,
        duration,
        startX: touchState.startX,
        startY: touchState.startY,
        endX: touchState.endX,
        endY: touchState.endY
      };
      
      // Call appropriate callbacks
      if (onSwipe) {
        onSwipe(swipeEvent);
      }
      
      switch (direction) {
        case 'left':
          if (onSwipeLeft) onSwipeLeft(swipeEvent);
          break;
        case 'right':
          if (onSwipeRight) onSwipeRight(swipeEvent);
          break;
        case 'up':
          if (onSwipeUp) onSwipeUp(swipeEvent);
          break;
        case 'down':
          if (onSwipeDown) onSwipeDown(swipeEvent);
          break;
      }
    }
    
    // Reset touch state
    touchState = null;
  }
  
  return {
    /**
     * Attach the swipe gesture detector to the window
     */
    attach() {
      if (!isAttached) {
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        isAttached = true;
      }
    },
    
    /**
     * Detach the swipe gesture detector from the window
     */
    detach() {
      if (isAttached) {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        isAttached = false;
      }
    },
    
    /**
     * Check if the detector is currently attached
     */
    isAttached() {
      return isAttached;
    }
  };
}

/**
 * Creates a tab navigation swipe handler for ORDINA application
 * 
 * @param tabs - Array of tab names in order
 * @param getCurrentTab - Function that returns the current active tab
 * @param setTab - Function to set the active tab
 * @param options - Additional swipe gesture options
 * @returns Swipe gesture detector configured for tab navigation
 * 
 * @example
 * ```typescript
 * const tabs = ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'];
 * const tabSwipeHandler = createTabSwipeHandler(
 *   tabs,
 *   () => $uiStore.activeTab,
 *   (tab) => uiStore.setActiveTab(tab)
 * );
 * 
 * onMount(() => {
 *   tabSwipeHandler.attach();
 * });
 * 
 * onDestroy(() => {
 *   tabSwipeHandler.detach();
 * });
 * ```
 */
export function createTabSwipeHandler(
  tabs: string[],
  getCurrentTab: () => string,
  setTab: (tab: string) => void,
  options: Omit<SwipeGestureOptions, 'onSwipeLeft' | 'onSwipeRight'> = {}
) {
  const threshold = options.threshold ?? 50;
  return createSwipeGestureDetector({
    ...options,
    onSwipeLeft: (event) => {
      // Align with parity rule: distance must be strictly greater than threshold
      if (event.distance <= threshold) return;
      // Swipe left - go to next tab
      const currentTab = getCurrentTab();
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex >= 0 && currentIndex < tabs.length - 1) {
        setTab(tabs[currentIndex + 1]);
      }
    },
    onSwipeRight: (event) => {
      // Align with parity rule: distance must be strictly greater than threshold
      if (event.distance <= threshold) return;
      // Swipe right - go to previous tab
      const currentTab = getCurrentTab();
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex > 0) {
        setTab(tabs[currentIndex - 1]);
      }
    }
  });
}

/**
 * Creates a swipe gesture detector for a specific element (instead of window)
 * 
 * @param element - The element to attach swipe detection to
 * @param options - Configuration options for swipe detection
 * @returns Object with attach/detach methods
 * 
 * @example
 * ```typescript
 * const container = document.getElementById('swipeable-container');
 * const swipeDetector = createElementSwipeDetector(container, {
 *   onSwipeLeft: () => console.log('Swiped left on container')
 * });
 * 
 * swipeDetector.attach();
 * ```
 */
export function createElementSwipeDetector(
  element: HTMLElement | null,
  options: SwipeGestureOptions = {}
) {
  if (!element) {
    return {
      attach: () => {},
      detach: () => {},
      isAttached: () => false
    };
  }
  
  const {
    threshold = 50,
    maxDuration = 500,
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;
  
  let touchState: TouchState | null = null;
  let isAttached = false;
  
  function handleTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0];
    touchState = {
      startX: touch.screenX,
      startY: touch.screenY,
      startTime: Date.now(),
      endX: touch.screenX,
      endY: touch.screenY,
      endTime: Date.now()
    };
  }
  
  function handleTouchMove(event: TouchEvent) {
    if (!touchState) return;
    
    const touch = event.changedTouches[0];
    touchState.endX = touch.screenX;
    touchState.endY = touch.screenY;
    touchState.endTime = Date.now();
  }
  
  function handleTouchEnd(event: TouchEvent) {
    if (!touchState) return;
    
    const touch = event.changedTouches[0];
    touchState.endX = touch.screenX;
    touchState.endY = touch.screenY;
    touchState.endTime = Date.now();
    
    const distance = getSwipeDistance(
      touchState.startX,
      touchState.startY,
      touchState.endX,
      touchState.endY
    );
    const duration = touchState.endTime - touchState.startTime;
    
    if (distance >= threshold && duration <= maxDuration) {
      const direction = getSwipeDirection(
        touchState.startX,
        touchState.startY,
        touchState.endX,
        touchState.endY
      );
      
      const swipeEvent: SwipeEvent = {
        direction,
        distance,
        duration,
        startX: touchState.startX,
        startY: touchState.startY,
        endX: touchState.endX,
        endY: touchState.endY
      };
      
      if (onSwipe) {
        onSwipe(swipeEvent);
      }
      
      switch (direction) {
        case 'left':
          if (onSwipeLeft) onSwipeLeft(swipeEvent);
          break;
        case 'right':
          if (onSwipeRight) onSwipeRight(swipeEvent);
          break;
        case 'up':
          if (onSwipeUp) onSwipeUp(swipeEvent);
          break;
        case 'down':
          if (onSwipeDown) onSwipeDown(swipeEvent);
          break;
      }
    }
    
    touchState = null;
  }
  
  return {
    attach() {
      if (!isAttached) {
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        isAttached = true;
      }
    },
    
    detach() {
      if (isAttached) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        isAttached = false;
      }
    },
    
    isAttached() {
      return isAttached;
    }
  };
}
