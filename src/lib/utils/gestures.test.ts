import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  createSwipeGestureDetector,
  createTabSwipeHandler,
  createElementSwipeDetector
} from './gestures';

// Helper function to create touch events
function createTouchEvent(
  type: string,
  x: number,
  y: number
): TouchEvent {
  const touch = {
    screenX: x,
    screenY: y,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    identifier: 0,
    target: window,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 1
  } as Touch;

  return new TouchEvent(type, {
    changedTouches: [touch],
    touches: type === 'touchend' ? [] : [touch],
    targetTouches: type === 'touchend' ? [] : [touch],
    bubbles: true,
    cancelable: true
  });
}

describe('Gesture Utilities', () => {
  describe('createSwipeGestureDetector', () => {
    let addEventListenerSpy: any;
    let removeEventListenerSpy: any;

    beforeEach(() => {
      addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should attach event listeners when attach() is called', () => {
      const detector = createSwipeGestureDetector();
      detector.attach();

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true });
      expect(detector.isAttached()).toBe(true);
    });

    it('should detach event listeners when detach() is called', () => {
      const detector = createSwipeGestureDetector();
      detector.attach();
      detector.detach();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
      expect(detector.isAttached()).toBe(false);
    });

    it('should not attach multiple times', () => {
      const detector = createSwipeGestureDetector();
      detector.attach();
      detector.attach();

      expect(addEventListenerSpy).toHaveBeenCalledTimes(3); // touchstart, touchmove, touchend
    });

    it('should detect left swipe', () => {
      const onSwipeLeft = vi.fn();
      const detector = createSwipeGestureDetector({
        threshold: 50,
        onSwipeLeft
      });

      detector.attach();

      // Simulate swipe left (start at 200, end at 100)
      window.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
      expect(onSwipeLeft).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'left',
          distance: expect.any(Number)
        })
      );

      detector.detach();
    });

    it('should detect right swipe', () => {
      const onSwipeRight = vi.fn();
      const detector = createSwipeGestureDetector({
        threshold: 50,
        onSwipeRight
      });

      detector.attach();

      // Simulate swipe right (start at 100, end at 200)
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 200, 100));

      expect(onSwipeRight).toHaveBeenCalledTimes(1);
      expect(onSwipeRight).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'right',
          distance: expect.any(Number)
        })
      );

      detector.detach();
    });

    it('should detect up swipe', () => {
      const onSwipeUp = vi.fn();
      const detector = createSwipeGestureDetector({
        threshold: 50,
        onSwipeUp
      });

      detector.attach();

      // Simulate swipe up (start at y=200, end at y=100)
      window.dispatchEvent(createTouchEvent('touchstart', 100, 200));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));

      expect(onSwipeUp).toHaveBeenCalledTimes(1);
      expect(onSwipeUp).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'up',
          distance: expect.any(Number)
        })
      );

      detector.detach();
    });

    it('should detect down swipe', () => {
      const onSwipeDown = vi.fn();
      const detector = createSwipeGestureDetector({
        threshold: 50,
        onSwipeDown
      });

      detector.attach();

      // Simulate swipe down (start at y=100, end at y=200)
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 200));

      expect(onSwipeDown).toHaveBeenCalledTimes(1);
      expect(onSwipeDown).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'down',
          distance: expect.any(Number)
        })
      );

      detector.detach();
    });

    it('should not detect swipe below threshold', () => {
      const onSwipe = vi.fn();
      const detector = createSwipeGestureDetector({
        threshold: 50,
        onSwipe
      });

      detector.attach();

      // Simulate small swipe (only 30 pixels)
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 130, 100));

      expect(onSwipe).not.toHaveBeenCalled();

      detector.detach();
    });

    it('should call onSwipe callback for any direction', () => {
      const onSwipe = vi.fn();
      const detector = createSwipeGestureDetector({
        threshold: 50,
        onSwipe
      });

      detector.attach();

      // Simulate swipe left
      window.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));

      expect(onSwipe).toHaveBeenCalledTimes(1);
      expect(onSwipe).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'left',
          startX: 200,
          startY: 100,
          endX: 100,
          endY: 100
        })
      );

      detector.detach();
    });

    it('should handle touchmove events', () => {
      const onSwipe = vi.fn();
      const detector = createSwipeGestureDetector({
        threshold: 50,
        onSwipe
      });

      detector.attach();

      window.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      window.dispatchEvent(createTouchEvent('touchmove', 150, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));

      expect(onSwipe).toHaveBeenCalledTimes(1);

      detector.detach();
    });
  });

  describe('createTabSwipeHandler', () => {
    it('should navigate to next tab on left swipe', () => {
      const tabs = ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'];
      let currentTab = 'expenses';
      const setTab = vi.fn((tab: string) => {
        currentTab = tab;
      });

      const handler = createTabSwipeHandler(
        tabs,
        () => currentTab,
        setTab
      );

      handler.attach();

      // Simulate left swipe
      window.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));

      expect(setTab).toHaveBeenCalledWith('debts');

      handler.detach();
    });

    it('should navigate to previous tab on right swipe', () => {
      const tabs = ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'];
      let currentTab = 'debts';
      const setTab = vi.fn((tab: string) => {
        currentTab = tab;
      });

      const handler = createTabSwipeHandler(
        tabs,
        () => currentTab,
        setTab
      );

      handler.attach();

      // Simulate right swipe
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 200, 100));

      expect(setTab).toHaveBeenCalledWith('expenses');

      handler.detach();
    });

    it('should not navigate past first tab on right swipe', () => {
      const tabs = ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'];
      let currentTab = 'dashboard';
      const setTab = vi.fn();

      const handler = createTabSwipeHandler(
        tabs,
        () => currentTab,
        setTab
      );

      handler.attach();

      // Simulate right swipe
      window.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      window.dispatchEvent(createTouchEvent('touchend', 200, 100));

      expect(setTab).not.toHaveBeenCalled();

      handler.detach();
    });

    it('should not navigate past last tab on left swipe', () => {
      const tabs = ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'];
      let currentTab = 'calendar';
      const setTab = vi.fn();

      const handler = createTabSwipeHandler(
        tabs,
        () => currentTab,
        setTab
      );

      handler.attach();

      // Simulate left swipe
      window.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      window.dispatchEvent(createTouchEvent('touchend', 100, 100));

      expect(setTab).not.toHaveBeenCalled();

      handler.detach();
    });
  });

  describe('createElementSwipeDetector', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    it('should attach event listeners to element', () => {
      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
      const detector = createElementSwipeDetector(element);

      detector.attach();

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true });
      expect(detector.isAttached()).toBe(true);

      addEventListenerSpy.mockRestore();
    });

    it('should detect swipe on element', () => {
      const onSwipeLeft = vi.fn();
      const detector = createElementSwipeDetector(element, {
        threshold: 50,
        onSwipeLeft
      });

      detector.attach();

      // Simulate swipe left on element
      element.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      element.dispatchEvent(createTouchEvent('touchend', 100, 100));

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);

      detector.detach();
    });

    it('should handle null element gracefully', () => {
      const detector = createElementSwipeDetector(null);

      expect(() => {
        detector.attach();
        detector.detach();
      }).not.toThrow();

      expect(detector.isAttached()).toBe(false);
    });
  });
});


// Property-Based Tests

describe('Property-Based Tests', () => {
  describe('Property 25: Swipe Gesture Navigation', () => {
    /**
     * **Validates: Requirements 12.5**
     * 
     * Property: For any swipe gesture on a touch device with distance > 50px,
     * the system should navigate to the previous or next tab respectively.
     * 
     * This property verifies that:
     * 1. Left swipes (distance > threshold) navigate to next tab
     * 2. Right swipes (distance > threshold) navigate to previous tab
     * 3. Swipes below threshold do not trigger navigation
     * 4. Navigation respects tab boundaries (no wrap-around)
     */
    it('Feature: ordina-svelte-migration, Property 25: Swipe Gesture Navigation - For any swipe > 50px, should navigate to prev/next tab', () => {
      fc.assert(
        fc.property(
          // Generate tab index (0-5 for 6 tabs)
          fc.integer({ min: 0, max: 5 }),
          // Generate swipe distance (can be positive or negative)
          fc.integer({ min: -200, max: 200 }),
          // Generate Y coordinate (should not affect horizontal swipe)
          fc.integer({ min: 0, max: 500 }),
          (tabIndex: number, swipeDistance: number, yCoord: number) => {
            const tabs = ['dashboard', 'expenses', 'debts', 'recurring', 'tasks', 'calendar'];
            let currentTab = tabs[tabIndex] as string;
            let navigationCalled = false;
            let newTab: string | null = null;

            const setTab = (tab: string) => {
              navigationCalled = true;
              newTab = tab;
              currentTab = tab;
            };

            const handler = createTabSwipeHandler(
              tabs,
              () => currentTab,
              setTab,
              { threshold: 50 }
            );

            handler.attach();

            // Simulate swipe
            const startX = 200;
            const endX = startX + swipeDistance;

            window.dispatchEvent(createTouchEvent('touchstart', startX, yCoord));
            window.dispatchEvent(createTouchEvent('touchend', endX, yCoord));

            handler.detach();

            // Verify navigation behavior
            const absDistance = Math.abs(swipeDistance);

            if (absDistance > 50) {
              // Swipe exceeds threshold
              if (swipeDistance < 0) {
                // Left swipe - should go to next tab (if not at end)
                if (tabIndex < tabs.length - 1) {
                  expect(navigationCalled).toBe(true);
                  expect(newTab).toBe(tabs[tabIndex + 1]);
                } else {
                  // At last tab - should not navigate
                  expect(navigationCalled).toBe(false);
                }
              } else {
                // Right swipe - should go to previous tab (if not at start)
                if (tabIndex > 0) {
                  expect(navigationCalled).toBe(true);
                  expect(newTab).toBe(tabs[tabIndex - 1]);
                } else {
                  // At first tab - should not navigate
                  expect(navigationCalled).toBe(false);
                }
              }
            } else {
              // Swipe below threshold - should not navigate
              expect(navigationCalled).toBe(false);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Swipe direction is determined by larger delta (horizontal vs vertical)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 400 }),
          fc.integer({ min: 0, max: 400 }),
          fc.integer({ min: -200, max: 200 }),
          fc.integer({ min: -200, max: 200 }),
          (startX: number, startY: number, deltaX: number, deltaY: number) => {
            let detectedDirection: string | null = null;

            const detector = createSwipeGestureDetector({
              threshold: 50,
              onSwipe: (event) => {
                detectedDirection = event.direction;
              }
            });

            detector.attach();

            const endX = startX + deltaX;
            const endY = startY + deltaY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            window.dispatchEvent(createTouchEvent('touchstart', startX, startY));
            window.dispatchEvent(createTouchEvent('touchend', endX, endY));

            detector.detach();

            if (distance >= 50) {
              // Swipe should be detected
              expect(detectedDirection).not.toBeNull();

              // Verify direction is based on larger delta
              if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                  expect(detectedDirection).toBe('right');
                } else {
                  expect(detectedDirection).toBe('left');
                }
              } else {
                // Vertical swipe
                if (deltaY > 0) {
                  expect(detectedDirection).toBe('down');
                } else {
                  expect(detectedDirection).toBe('up');
                }
              }
            } else {
              // Swipe below threshold - should not be detected
              expect(detectedDirection).toBeNull();
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Swipe distance is calculated correctly using Pythagorean theorem', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 400 }),
          fc.integer({ min: 0, max: 400 }),
          fc.integer({ min: -200, max: 200 }),
          fc.integer({ min: -200, max: 200 }),
          (startX: number, startY: number, deltaX: number, deltaY: number) => {
            let detectedDistance: number | null = null;

            const detector = createSwipeGestureDetector({
              threshold: 0, // Set to 0 to detect all swipes
              onSwipe: (event) => {
                detectedDistance = event.distance;
              }
            });

            detector.attach();

            const endX = startX + deltaX;
            const endY = startY + deltaY;
            const expectedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            window.dispatchEvent(createTouchEvent('touchstart', startX, startY));
            window.dispatchEvent(createTouchEvent('touchend', endX, endY));

            detector.detach();

            if (detectedDistance !== null) {
              // Allow small floating point differences
              expect(Math.abs(detectedDistance - expectedDistance)).toBeLessThan(0.01);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
