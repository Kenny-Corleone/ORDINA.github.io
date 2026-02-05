/**
 * Keyboard Shortcuts Utility Module
 * 
 * Provides keyboard shortcut handling for the ORDINA application.
 * Supports common shortcuts like Ctrl+E (Add Expense), Ctrl+T (Add Task), etc.
 */

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: () => void;
  description?: string;
}

export interface KeyboardShortcutOptions {
  /**
   * Whether to prevent default browser behavior when shortcut is triggered
   * @default true
   */
  preventDefault?: boolean;
  
  /**
   * Whether to ignore shortcuts when user is typing in input fields
   * @default true
   */
  ignoreInputFields?: boolean;
}

/**
 * Checks if the event target is an input field where typing is expected
 */
function isInputField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  
  const tagName = target.tagName.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
}

/**
 * Checks if a keyboard event matches a shortcut definition
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  // Check key match (case-insensitive)
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false;
  }
  
  // Check modifier keys
  if (shortcut.ctrl !== undefined && event.ctrlKey !== shortcut.ctrl) {
    return false;
  }
  if (shortcut.shift !== undefined && event.shiftKey !== shortcut.shift) {
    return false;
  }
  if (shortcut.alt !== undefined && event.altKey !== shortcut.alt) {
    return false;
  }
  if (shortcut.meta !== undefined && event.metaKey !== shortcut.meta) {
    return false;
  }
  
  return true;
}

/**
 * Creates a keyboard shortcut handler function
 * 
 * @param shortcuts - Array of keyboard shortcuts to handle
 * @param options - Configuration options
 * @returns Handler function to be attached to keydown event
 * 
 * @example
 * ```typescript
 * const shortcuts = [
 *   { key: 'e', ctrl: true, callback: () => openExpenseModal() },
 *   { key: 't', ctrl: true, callback: () => openTaskModal() }
 * ];
 * const handler = createKeyboardShortcutHandler(shortcuts);
 * window.addEventListener('keydown', handler);
 * ```
 */
export function createKeyboardShortcutHandler(
  shortcuts: KeyboardShortcut[],
  options: KeyboardShortcutOptions = {}
): (event: KeyboardEvent) => void {
  const {
    preventDefault = true,
    ignoreInputFields = true
  } = options;
  
  return (event: KeyboardEvent) => {
    // Ignore shortcuts when typing in input fields (if enabled)
    if (ignoreInputFields && isInputField(event.target)) {
      return;
    }
    
    // Find matching shortcut
    const matchedShortcut = shortcuts.find(shortcut => matchesShortcut(event, shortcut));
    
    if (matchedShortcut) {
      if (preventDefault) {
        event.preventDefault();
      }
      matchedShortcut.callback();
    }
  };
}

/**
 * Creates a keyboard shortcut manager that can be easily attached/detached
 * 
 * @example
 * ```typescript
 * const manager = createKeyboardShortcutManager([
 *   { key: 'e', ctrl: true, callback: () => console.log('Add expense') }
 * ]);
 * 
 * // In Svelte component
 * onMount(() => {
 *   manager.attach();
 * });
 * 
 * onDestroy(() => {
 *   manager.detach();
 * });
 * ```
 */
export function createKeyboardShortcutManager(
  shortcuts: KeyboardShortcut[],
  options: KeyboardShortcutOptions = {}
) {
  const handler = createKeyboardShortcutHandler(shortcuts, options);
  let isAttached = false;
  
  return {
    /**
     * Attach the keyboard shortcut handler to the window
     */
    attach() {
      if (!isAttached) {
        window.addEventListener('keydown', handler);
        isAttached = true;
      }
    },
    
    /**
     * Detach the keyboard shortcut handler from the window
     */
    detach() {
      if (isAttached) {
        window.removeEventListener('keydown', handler);
        isAttached = false;
      }
    },
    
    /**
     * Check if the handler is currently attached
     */
    isAttached() {
      return isAttached;
    }
  };
}

/**
 * Focus trap utility for modals
 * Keeps focus within a container element (e.g., modal dialog)
 * 
 * @param container - The container element to trap focus within
 * @returns Object with attach/detach methods and focus restoration
 * 
 * @example
 * ```typescript
 * const modal = document.getElementById('my-modal');
 * const focusTrap = createFocusTrap(modal);
 * 
 * // When modal opens
 * focusTrap.attach();
 * 
 * // When modal closes
 * focusTrap.detach();
 * ```
 */
export function createFocusTrap(container: HTMLElement | null) {
  if (!container) {
    return {
      attach: () => {},
      detach: () => {},
      restoreFocus: () => {}
    };
  }
  
  let previouslyFocusedElement: HTMLElement | null = null;
  
  /**
   * Get all focusable elements within the container
   */
  function getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors));
  }
  
  /**
   * Handle Tab key to trap focus within container
   */
  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Shift+Tab on first element - go to last
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // Tab on last element - go to first
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
  
  return {
    /**
     * Attach the focus trap
     * Saves the currently focused element and focuses the first focusable element in the container
     */
    attach() {
      // Save currently focused element
      previouslyFocusedElement = document.activeElement as HTMLElement;
      
      // Add event listener
      container.addEventListener('keydown', handleKeydown);
      
      // Focus first focusable element
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    },
    
    /**
     * Detach the focus trap
     */
    detach() {
      container.removeEventListener('keydown', handleKeydown);
    },
    
    /**
     * Restore focus to the previously focused element
     */
    restoreFocus() {
      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
      }
    }
  };
}

/**
 * Common keyboard shortcuts for ORDINA application
 */
export const ORDINA_SHORTCUTS = {
  ADD_EXPENSE: { key: 'e', ctrl: true, description: 'Add Expense' },
  ADD_TASK: { key: 't', ctrl: true, description: 'Add Task' },
  ADD_DEBT: { key: 'd', ctrl: true, description: 'Add Debt' },
  ADD_RECURRING: { key: 'r', ctrl: true, description: 'Add Recurring Expense' },
  TOGGLE_RADIO: { key: ' ', description: 'Toggle Radio' },
  CLOSE_MODAL: { key: 'Escape', description: 'Close Modal' }
} as const;
