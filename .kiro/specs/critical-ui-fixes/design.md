# Design Document: Critical UI/UX Fixes

## Overview

This design addresses critical UI/UX bugs in the ORDINA Svelte finance management application. The fixes target layout issues (sticky positioning, header placement), functional failures (news widget, input fields, mobile responsiveness), and visual bugs (month selector artifacts, translation errors).

The application architecture consists of:
- **Frontend**: Svelte 4 + TypeScript + Vite
- **Backend**: Firebase (Firestore, Auth)
- **Styling**: Tailwind CSS + Custom CSS with glassmorphism effects
- **i18n**: Custom translation system supporting 4 languages
- **Responsive**: Mobile-first design with breakpoints at 768px and 1024px

### Key Design Principles

1. **Minimal Invasive Changes**: Fix bugs without refactoring working code
2. **CSS-First Solutions**: Prefer CSS fixes over JavaScript when possible
3. **Backward Compatibility**: Maintain existing functionality while fixing bugs
4. **Performance**: Ensure fixes don't degrade performance
5. **Accessibility**: Maintain or improve WCAG AA compliance

## Architecture

### Component Hierarchy

```
App.svelte
├── AuthContainer.svelte (when not authenticated)
└── AppContainer.svelte (when authenticated)
    ├── Header.svelte (FIXED POSITIONING)
    │   ├── Logo
    │   ├── WeatherWidget
    │   ├── RadioWidget
    │   ├── ThemeToggle
    │   ├── LanguageSelector
    │   ├── CurrencyToggle
    │   └── LogoutButton
    ├── TabPanel (FIXED POSITIONING - in Header.svelte nav)
    │   └── Tab buttons (Dashboard, Expenses, Debts, etc.)
    ├── MobileSidebar (overlay navigation)
    └── Content Area (tab-specific content)
        ├── DashboardTab
        │   └── NewsWidget (BROKEN - needs fix)
        ├── ExpensesTab
        │   └── MonthSelector (VISUAL BUG - yellow dots)
        ├── DebtsTab
        │   └── DebtPaymentModal (INPUT BUG - can't enter numbers)
        └── Other tabs...
```

### CSS Architecture

The application uses a layered CSS system:
1. **app.css**: Main entry point, imports all CSS files
2. **styles/main.css**: Core styles, variables, components (TRUNCATED - needs full review)
3. **styles/responsive.css**: Responsive utilities and mobile sidebar
4. **styles/device-*.css**: Device-specific overrides
5. **styles/dashboard-fixes.css**: Dashboard-specific fixes

### Responsive System

The application uses a JavaScript-driven responsive system (`lib/utils/responsive.ts`) that:
- Detects viewport width on load and resize
- Adds device class to body (`device-mobile`, `device-tablet`, `device-desktop`)
- Enables CSS utility classes (`.device-mobile\:block`, etc.)


## Components and Interfaces

### 1. Header Component (Header.svelte)

**Current Issues:**
- Not positioned at absolute top (gap above header)
- Not sticky during scrolling
- Tab panel (nav element) not sticky

**Design Solution:**
```css
/* Fix 1: Remove top gap */
#fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  margin: 0; /* Ensure no margin */
}

/* Fix 2: Ensure body accounts for fixed header */
body {
  padding-top: var(--header-total-height); /* header + nav height */
  margin-top: 0;
}

/* Fix 3: Make tab panel sticky */
header nav {
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  z-index: 999;
}
```

**CSS Variables to Define:**
- `--header-height`: Height of main header (e.g., 120px)
- `--nav-height`: Height of tab panel (e.g., 50px)
- `--header-total-height`: Sum of both (e.g., 170px)

**Interface:**
```typescript
// No TypeScript changes needed - CSS-only fix
```

### 2. News Widget Component (NewsWidget.svelte)

**Current Issues:**
- Component exists but the RSS feed fetching implementation needs to be integrated
- The user has provided a working vanilla JS implementation with RSS parsing
- Need to adapt the RSS feed approach to work with Svelte component

**Design Solution:**

The user has provided a comprehensive RSS feed implementation that includes:
- Multi-language RSS sources (Russian, Azerbaijani, English, Italian)
- CORS proxy handling with fallbacks
- Image extraction from RSS feeds
- Caching mechanism
- Search and favorites functionality
- Category filtering

**Integration Approach:**

1. **Create RSS Service Module** (`lib/services/rss.ts`):
   - Port the RSS feed sources and parsing logic
   - Implement CORS proxy handling
   - Add timeout and retry logic
   - Extract images from RSS feeds using multiple strategies

2. **Update News Service** (`lib/services/news.ts`):
   - Replace current API with RSS feed fetching
   - Use the RSS_SOURCES configuration
   - Implement parseRSSFeed function with DOMParser
   - Handle multiple proxy attempts

3. **Enhanced NewsWidget Component**:
```typescript
// lib/services/rss.ts
const RSS_SOURCES = {
  'ru': {
    'all': [
      'https://lenta.ru/rss',
      'https://www.kommersant.ru/RSS/news.xml',
      'https://ria.ru/export/rss2/index.xml'
    ],
    'technology': ['https://habr.com/ru/rss/flows/develop/all/'],
    // ... other categories
  },
  'az': {
    'all': [
      'https://oxu.az/rss',
      'https://apa.az/rss',
      'https://azertag.az/rss/az'
    ],
    // ... other categories
  },
  'en': {
    'all': [
      'https://rss.cnn.com/rss/edition.rss',
      'https://feeds.bbci.co.uk/news/world/rss.xml'
    ],
    // ... other categories
  },
  'it': {
    'all': [
      'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',
      'https://www.repubblica.it/rss/homepage/rss2.0.xml'
    ],
    // ... other categories
  }
};

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

async function parseRSSFeed(url: string, retries = 2): Promise<NewsArticle[]> {
  // Implementation with CORS proxy fallback
  // DOMParser for XML parsing
  // Image extraction from multiple sources
  // Error handling with retries
}

export async function fetchNewsFromRSS(
  language: string,
  category: string = 'all'
): Promise<NewsArticle[]> {
  const sources = RSS_SOURCES[language]?.[category] || RSS_SOURCES['en']['all'];
  const urlsToFetch = sources.slice(0, 2);
  
  const results = await Promise.allSettled(
    urlsToFetch.map(url => parseRSSFeed(url, 1))
  );
  
  const articles: NewsArticle[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      articles.push(...result.value);
    }
  });
  
  return articles;
}
```

**Key Features to Implement:**
1. Multi-proxy CORS handling with automatic fallback
2. Image extraction from RSS feeds (media:content, enclosure, description HTML)
3. Timeout handling (12 seconds per request)
4. Retry logic with exponential backoff
5. Caching with 30-minute expiration
6. Search and favorites functionality

### 3. Month Selector Component (MonthSelector.svelte)

**Current Issues:**
- Yellow dots appearing (likely CSS pseudo-elements or list markers)

**Design Solution:**

Investigate and remove unwanted visual elements:

```css
/* Remove list markers if using <ul> */
.month-selector ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Remove any pseudo-elements that might create dots */
.month-selector::before,
.month-selector::after,
.month-selector *::before,
.month-selector *::after {
  content: none !important;
}

/* Ensure select element has no decorations */
.month-selector select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
}

/* Remove any text-decoration that might appear as dots */
.month-selector * {
  text-decoration: none;
  list-style: none;
}
```

### 4. Debt Payment Modal (DebtPaymentModal.svelte)

**Current Issues:**
- Input field not accepting numeric input
- Shows "0.00" but user cannot type

**Root Cause Analysis:**
The input has `type="text"` with `inputmode="decimal"` which should work, but may have:
1. Event handler preventing input
2. Validation blocking input
3. Disabled state not properly managed
4. Value binding issue

**Design Solution:**

```svelte
<input
  id="payment-amount"
  type="number"
  step="0.01"
  min="0.01"
  max={remainingAmount}
  bind:value={paymentAmount}
  on:input={handleInput}
  on:blur={() => handleBlur('paymentAmount')}
  class="w-full px-3 py-2 border rounded-md"
  placeholder="0.00"
  disabled={isSubmitting}
  required
  aria-label="Payment amount"
  aria-describedby="payment-amount-help"
/>
```

**Alternative Solution (if type="number" causes issues):**
```typescript
function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Allow only numbers and decimal point
  value = value.replace(/[^\d.]/g, '');
  
  // Allow only one decimal point
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts[1] && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  paymentAmount = value;
}
```


### 5. Mobile Responsive System

**Current Issues:**
- Mobile version not working properly
- Responsive breakpoints may not be triggering correctly

**Design Solution:**

**Responsive System Enhancement:**
```typescript
// lib/utils/responsive.ts
export function initResponsiveSystem() {
  function updateDeviceClass() {
    const width = window.innerWidth;
    const body = document.body;
    
    // Remove all device classes
    body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    
    // Add appropriate class
    if (width < 768) {
      body.classList.add('device-mobile');
    } else if (width < 1024) {
      body.classList.add('device-tablet');
    } else {
      body.classList.add('device-desktop');
    }
    
    // Update CSS variable for header height (mobile has smaller header)
    const headerHeight = width < 768 ? '150px' : '170px';
    document.documentElement.style.setProperty('--header-total-height', headerHeight);
  }
  
  // Initial update
  updateDeviceClass();
  
  // Update on resize with debounce
  let resizeTimeout: number;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(updateDeviceClass, 150);
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}
```

**Mobile-Specific CSS Fixes:**
```css
/* Ensure mobile sidebar works */
@media (max-width: 767px) {
  /* Hide desktop navigation */
  .header-nav {
    display: none;
  }
  
  /* Show mobile menu button */
  #mobile-menu-toggle {
    display: flex;
  }
  
  /* Adjust header for mobile */
  #fixed-header {
    padding: 0.5rem;
  }
  
  /* Ensure touch targets are 44px minimum */
  button, a, input, select {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 6. Translation System

**Current Issues:**
- Mixed or incorrect translations
- Missing translation keys

**Design Solution:**

**Translation Validation:**
```typescript
// lib/i18n/validator.ts
export function validateTranslations() {
  const locales = ['en', 'ru', 'az', 'it'];
  const baseLocale = 'en';
  
  // Load all locale files
  const translations: Record<string, Record<string, string>> = {};
  for (const locale of locales) {
    translations[locale] = require(`../locales/locale-${locale}.json`);
  }
  
  const baseKeys = Object.keys(translations[baseLocale]);
  const issues: string[] = [];
  
  // Check each locale for missing keys
  for (const locale of locales) {
    if (locale === baseLocale) continue;
    
    const localeKeys = Object.keys(translations[locale]);
    const missing = baseKeys.filter(key => !localeKeys.includes(key));
    
    if (missing.length > 0) {
      issues.push(`${locale}: Missing keys: ${missing.join(', ')}`);
    }
  }
  
  if (issues.length > 0) {
    console.warn('Translation issues found:', issues);
  }
  
  return issues;
}
```

**Enhanced Translation Function:**
```typescript
export function t(
  translations: Record<string, string>,
  key: string,
  fallback?: string
): string {
  if (translations[key]) {
    return translations[key];
  }
  
  // Log missing translation
  console.warn(`Missing translation key: ${key}`);
  
  // Return fallback or key
  return fallback || key;
}
```

## Data Models

No new data models are required for these fixes. All fixes are UI/UX improvements that work with existing data structures.

### Existing Models Used:

```typescript
// Debt model (for DebtPaymentModal)
interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  category: string;
}

// News article model (for NewsWidget)
interface NewsArticle {
  url: string;
  title: string;
  desc: string;
  source: string;
  publishedAt: string;
  image?: string;
}

// Translation model
type Translations = Record<string, string>;
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Fixed Header and Tab Panel Positioning

*For any* scroll position in the viewport, both the Header and Tab_Panel SHALL maintain fixed positioning at the top of the viewport, with the Header at top: 0 and the Tab_Panel immediately below it.

**Validates: Requirements 1.1, 1.2**

### Property 2: Header Glassmorphism Persistence

*For any* positioning state (static, fixed, sticky), the Header SHALL maintain its glassmorphism styling including backdrop-filter and semi-transparent background.

**Validates: Requirements 1.3**

### Property 3: Z-Index Layering Hierarchy

*For any* combination of visible UI elements, the z-index layering SHALL follow the hierarchy: modals (1000+) > fixed header (1000) > tab panel (999) > content (1-10), ensuring proper visual stacking.

**Validates: Requirements 1.4, 9.2**

### Property 4: Content Non-Overlap

*For any* scroll position, the fixed Header and Tab_Panel SHALL not obscure page content, with body padding-top >= (header height + tab panel height).

**Validates: Requirements 1.5, 2.5**

### Property 5: Header Top Positioning

*For any* viewport size, the Header SHALL be positioned at the absolute top with computed top: 0, margin-top: 0, and getBoundingClientRect().top === 0.

**Validates: Requirements 2.1, 2.2, 2.4**

### Property 6: Cross-Device Header Consistency

*For any* device type (mobile, tablet, desktop), the Header SHALL maintain top positioning without gaps or spacing above it.

**Validates: Requirements 2.3**

### Property 7: News Widget Data Fetching

*For any* valid language and category selection, the News_Widget SHALL fetch news data and either display articles or show an appropriate error/empty state.

**Validates: Requirements 3.1**

### Property 8: News Widget Loading State

*For any* news fetch operation, the News_Widget SHALL display a loading indicator while the async operation is in progress.

**Validates: Requirements 3.3**

### Property 9: News Article Formatting

*For any* displayed news article, the rendered HTML SHALL contain the article's title, date, and description fields.

**Validates: Requirements 3.4**

### Property 10: News Widget Error Handling

*For any* error during news fetching, the News_Widget SHALL log the error to console and display a user-friendly error message in the UI.

**Validates: Requirements 3.5**

### Property 11: Month Selector Visual Cleanliness

*For any* theme (light or dark), the Month_Selector SHALL render without yellow dots, unexpected pseudo-elements, or visual artifacts.

**Validates: Requirements 4.1, 4.4**

### Property 12: Month Selector State Updates

*For any* month selection change, the Month_Selector SHALL update its visual state without console errors or rendering failures.

**Validates: Requirements 4.2**

### Property 13: Month Selector CSS Hygiene

*For any* applied style, the Month_Selector SHALL use only defined CSS classes and variables from the application's stylesheets.

**Validates: Requirements 4.3**

### Property 14: Month Selector Theme Consistency

*For any* theme toggle, the Month_Selector SHALL maintain clean visual appearance in both light and dark modes without artifacts.

**Validates: Requirements 4.5**

### Property 15: Language Selection Correctness

*For any* supported language selection (Russian, English, Italian, Azerbaijani), all UI text SHALL display in the correct language using the appropriate translation keys.

**Validates: Requirements 5.1**

### Property 16: Translation Fallback Behavior

*For any* missing translation key, the system SHALL fall back to the English translation and log a warning to the console.

**Validates: Requirements 5.2**

### Property 17: Translation Completeness Validation

*For any* locale file, all translation keys present in the English locale SHALL also be present in that locale file.

**Validates: Requirements 5.3**

### Property 18: Numeric Input Acceptance

*For any* numeric character (0-9) or decimal point entered in the Debt_Payment_Modal input field, the field SHALL accept and display the character.

**Validates: Requirements 6.1, 6.2**

### Property 19: Decimal Input Support

*For any* valid decimal number (e.g., 123.45) entered in the payment input field, the field SHALL accept the value including the decimal point.

**Validates: Requirements 6.3**

### Property 20: Invalid Character Rejection

*For any* non-numeric character (letters, symbols except decimal point) entered in the payment input field, the field SHALL reject the character and maintain the previous valid value.

**Validates: Requirements 6.4**

### Property 21: Mobile Layout Rendering

*For any* viewport width < 768px, all components SHALL render using mobile-optimized layouts with appropriate spacing and sizing.

**Validates: Requirements 7.1**

### Property 22: Mobile Sidebar Animation

*For any* mobile sidebar open action, the sidebar SHALL slide in from the left with transform: translateX(0) and overlay the content with appropriate z-index.

**Validates: Requirements 7.2**

### Property 23: Touch Target Minimum Size

*For any* interactive element (button, link, input), the element SHALL have minimum dimensions of 44px × 44px for touch accessibility.

**Validates: Requirements 7.3**

### Property 24: Responsive Device Class Updates

*For any* viewport width change that crosses a breakpoint (768px, 1024px), the body element SHALL update its device class (device-mobile, device-tablet, device-desktop) accordingly.

**Validates: Requirements 7.4**

### Property 25: Console Error-Free Execution

*For any* application load or user interaction, the browser console SHALL not display JavaScript errors originating from application code.

**Validates: Requirements 8.1, 12.1**

### Property 26: Exception-Free Event Handlers

*For any* user interaction that triggers an event handler, the handler SHALL execute without throwing uncaught exceptions.

**Validates: Requirements 8.2, 12.2**

### Property 27: Graceful Firebase Error Handling

*For any* Firebase operation error, the application SHALL catch the error, log it with context, and display a user-friendly message to the user.

**Validates: Requirements 8.3**

### Property 28: Memory Leak Prevention

*For any* component mount and unmount cycle, the component SHALL properly clean up event listeners, timers, and subscriptions to prevent memory leaks.

**Validates: Requirements 8.4**

### Property 29: Critical Flow Completion

*For any* critical user flow (add expense, pay debt, create task), the flow SHALL complete successfully without errors when valid data is provided.

**Validates: Requirements 8.5**

### Property 30: Consistent Positioning Strategy

*For any* element requiring sticky behavior, the CSS SHALL use either position: sticky or position: fixed consistently throughout the application.

**Validates: Requirements 9.1**

### Property 31: CSS Variable Usage for Layout

*For any* layout container that needs to account for fixed header height, the CSS SHALL use CSS variables (--header-height, --header-total-height) rather than hard-coded values.

**Validates: Requirements 9.3**


### Property 32: Input Field Type Validation

*For any* input field with a specified type (numeric, text, email), the field SHALL validate entered data against that type and provide feedback.

**Validates: Requirements 10.1**

### Property 33: Invalid Input Visual Feedback

*For any* invalid input detected, the input field SHALL display a visual indicator (red border, error icon, or error message).

**Validates: Requirements 10.2**

### Property 34: Valid Input Success Feedback

*For any* input that becomes valid after being invalid, the visual indicator SHALL update to show success state (green border or checkmark).

**Validates: Requirements 10.3**

### Property 35: Form Validation Before Submission

*For any* form submission attempt, all input fields SHALL be validated, and submission SHALL be blocked if any field is invalid.

**Validates: Requirements 10.4**

### Property 36: Clear Validation Error Messages

*For any* validation failure, the user SHALL receive a clear, specific error message explaining what needs to be corrected.

**Validates: Requirements 10.5**

### Property 37: Theme-Based CSS Variable Updates

*For any* theme toggle, all components SHALL update their colors using CSS variables, with dark theme styles taking precedence when .dark class is present on body.

**Validates: Requirements 11.1, 11.5**

### Property 38: Glassmorphism Cross-Theme Compatibility

*For any* theme (light or dark), glassmorphism effects (backdrop-filter, semi-transparent backgrounds) SHALL render correctly and be visible.

**Validates: Requirements 11.2**

### Property 39: WCAG AA Contrast Compliance

*For any* text element in either theme, the contrast ratio between text and background SHALL meet WCAG AA requirements (minimum 4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 11.3**

### Property 40: Theme-Appropriate Borders and Shadows

*For any* theme, borders and shadows SHALL be visible and appropriate for that theme (lighter in light mode, darker/more prominent in dark mode).

**Validates: Requirements 11.4**

### Property 41: Graceful Error Logging

*For any* error that occurs during execution, the error SHALL be caught, logged to console with context (component, action, timestamp), and handled gracefully without crashing the application.

**Validates: Requirements 12.5**

### Property 42: GPU-Accelerated Animations

*For any* CSS animation or transition, the animation SHALL use transform and opacity properties (GPU-accelerated) rather than layout properties (left, top, width, height).

**Validates: Requirements 13.2**

### Property 43: Large List Optimization

*For any* list with more than 100 items, the list SHALL implement virtualization or pagination to limit DOM nodes and maintain performance.

**Validates: Requirements 13.3**

### Property 44: Lazy Image Loading

*For any* image element, the image SHALL have loading="lazy" attribute and use appropriate formats (WebP with fallbacks) for optimization.

**Validates: Requirements 13.4**

### Property 45: ARIA Labels for Interactive Elements

*For any* interactive element (button, link, input, select), the element SHALL have an appropriate ARIA label or aria-label attribute for screen reader accessibility.

**Validates: Requirements 14.1**

### Property 46: Keyboard Navigation Completeness

*For any* interactive element in the interface, the element SHALL be reachable and operable using only keyboard navigation (Tab, Enter, Space, Arrow keys).

**Validates: Requirements 14.2**

### Property 47: Visible Focus Indicators

*For any* focused interactive element, a focus indicator SHALL be visible with sufficient contrast (minimum 3:1) against the background.

**Validates: Requirements 14.3**

### Property 48: Logical Screen Reader Order

*For any* page content, the DOM order SHALL match the visual order, ensuring screen readers announce content in a logical sequence.

**Validates: Requirements 14.4**

### Property 49: Non-Color-Only Information

*For any* information conveyed by color (success, error, warning), the information SHALL also be conveyed through text, icons, or patterns.

**Validates: Requirements 14.5**

### Property 50: Cross-Browser Feature Parity

*For any* feature in the application, the feature SHALL work identically in Chrome, Firefox, Safari, and Edge (latest two major versions).

**Validates: Requirements 15.1**

### Property 51: Vendor Prefix Inclusion

*For any* CSS property requiring vendor prefixes (backdrop-filter, appearance, etc.), the CSS SHALL include appropriate prefixes (-webkit-, -moz-, -ms-).

**Validates: Requirements 15.2**

### Property 52: Polyfill Availability

*For any* JavaScript API that requires polyfills for older browsers (IntersectionObserver, ResizeObserver, etc.), the polyfill SHALL be loaded conditionally when needed.

**Validates: Requirements 15.3**

## Error Handling

### Error Categories

1. **Layout Errors**: Fixed positioning failures, z-index conflicts, overflow issues
2. **Input Errors**: Validation failures, type mismatches, blocked input
3. **Network Errors**: API failures, timeouts, CORS issues
4. **Rendering Errors**: Component mount failures, infinite loops, memory leaks
5. **Translation Errors**: Missing keys, incorrect fallbacks, mixed languages

### Error Handling Strategy

**1. CSS Errors (Layout, Visual)**
- Use browser DevTools to inspect computed styles
- Verify CSS specificity and cascade order
- Check for conflicting styles or !important overrides
- Validate CSS variables are defined and accessible

**2. Input Validation Errors**
```typescript
function handleValidationError(field: string, error: string) {
  // Update error state
  errors[field] = error;
  
  // Add visual indicator
  const input = document.getElementById(field);
  input?.classList.add('error');
  input?.setAttribute('aria-invalid', 'true');
  
  // Announce to screen readers
  const errorElement = document.getElementById(`${field}-error`);
  if (errorElement) {
    errorElement.textContent = error;
  }
}
```

**3. Network Errors**
```typescript
async function fetchWithErrorHandling<T>(
  fetchFn: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await fetchFn();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error:', error);
      showToast(t($translations, 'networkError', 'Network error. Please check your connection.'));
    } else if (error.name === 'AbortError') {
      console.error('Request timeout:', error);
      showToast(t($translations, 'timeout', 'Request timed out. Please try again.'));
    } else {
      console.error(errorMessage, error);
      showToast(errorMessage);
    }
    return null;
  }
}
```

**4. Component Lifecycle Errors**
```typescript
onMount(() => {
  // Setup
  const cleanup = setupComponent();
  
  // Return cleanup function
  return () => {
    try {
      cleanup();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };
});
```


## Testing Strategy

### Dual Testing Approach

This project will use both **unit tests** and **property-based tests** to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Together, they provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness

### Property-Based Testing Configuration

**Library**: We will use **fast-check** for property-based testing in TypeScript/JavaScript.

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: critical-ui-fixes, Property {number}: {property_text}`

**Example Property Test**:
```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Header Positioning', () => {
  // Feature: critical-ui-fixes, Property 5: Header Top Positioning
  it('should maintain top positioning at 0 for any viewport size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }), // viewport width
        fc.integer({ min: 568, max: 2160 }), // viewport height
        (width, height) => {
          // Set viewport size
          window.innerWidth = width;
          window.innerHeight = height;
          window.dispatchEvent(new Event('resize'));
          
          // Get header element
          const header = document.getElementById('fixed-header');
          expect(header).toBeTruthy();
          
          // Verify positioning
          const computed = window.getComputedStyle(header!);
          expect(computed.top).toBe('0px');
          expect(computed.marginTop).toBe('0px');
          
          const rect = header!.getBoundingClientRect();
          expect(rect.top).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Focus Areas for Unit Tests**:
1. **Specific Examples**: Test known bug scenarios (e.g., yellow dots in month selector)
2. **Edge Cases**: Test boundary conditions (e.g., empty news results, max debt payment)
3. **Integration Points**: Test component interactions (e.g., modal opening, theme switching)
4. **Error Conditions**: Test error handling (e.g., network failures, invalid input)

**Example Unit Test**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import DebtPaymentModal from './DebtPaymentModal.svelte';

describe('DebtPaymentModal', () => {
  it('should accept numeric input in payment field', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt' }
    });
    
    const input = getByLabelText('Payment Amount') as HTMLInputElement;
    
    // Type numeric value
    await fireEvent.input(input, { target: { value: '123.45' } });
    
    // Verify value is accepted
    expect(input.value).toBe('123.45');
  });
  
  it('should reject non-numeric input', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt' }
    });
    
    const input = getByLabelText('Payment Amount') as HTMLInputElement;
    
    // Try to type letters
    await fireEvent.input(input, { target: { value: 'abc' } });
    
    // Verify letters are rejected
    expect(input.value).toBe('');
  });
});
```

### Visual Regression Testing

For visual bugs (yellow dots, header positioning), we should use visual regression testing:

**Tool**: Playwright with screenshot comparison

```typescript
import { test, expect } from '@playwright/test';

test('month selector should not have yellow dots', async ({ page }) => {
  await page.goto('/expenses');
  
  // Wait for month selector to render
  const selector = page.locator('.month-selector');
  await selector.waitFor();
  
  // Take screenshot
  await expect(selector).toHaveScreenshot('month-selector.png', {
    maxDiffPixels: 100
  });
});

test('header should be at top with no gap', async ({ page }) => {
  await page.goto('/');
  
  // Get header position
  const header = page.locator('#fixed-header');
  const box = await header.boundingBox();
  
  // Verify top position is 0
  expect(box?.y).toBe(0);
  
  // Take screenshot
  await expect(page).toHaveScreenshot('header-position.png');
});
```

### Responsive Testing

Test responsive behavior across breakpoints:

```typescript
import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

for (const viewport of viewports) {
  test(`should render correctly on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    
    // Verify device class
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain(`device-${viewport.name}`);
    
    // Verify header is visible
    const header = page.locator('#fixed-header');
    await expect(header).toBeVisible();
    
    // Take screenshot
    await expect(page).toHaveScreenshot(`${viewport.name}-layout.png`);
  });
}
```

### Accessibility Testing

Use axe-core for automated accessibility testing:

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  
  // Check entire page
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  });
});

test('should have accessible form inputs', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-modal="debt-payment"]');
  
  await injectAxe(page);
  
  // Check modal specifically
  await checkA11y(page, '.modal', {
    rules: {
      'label': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true }
    }
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80% code coverage for components with bugs
- **Property Tests**: 100% coverage of correctness properties (52 properties)
- **Visual Regression**: 100% coverage of visual bug fixes (header, month selector)
- **Accessibility**: 100% WCAG AA compliance
- **Cross-Browser**: 100% feature parity across Chrome, Firefox, Safari, Edge

### Continuous Integration

All tests should run in CI pipeline:

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run property tests
        run: npm run test:property
      
      - name: Run e2e tests
        run: npm run test:e2e
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Implementation Notes

### Priority Order

Fixes should be implemented in this order based on severity:

1. **Critical (Blocking)**: Header positioning, sticky behavior, debt payment input
2. **High (Major UX)**: Mobile responsiveness, news widget, month selector visual bug
3. **Medium (Quality)**: Translation corrections, error handling improvements
4. **Low (Enhancement)**: Performance optimizations, accessibility improvements

### Browser Testing Matrix

| Browser | Versions | Priority |
|---------|----------|----------|
| Chrome  | Latest 2 | High     |
| Firefox | Latest 2 | High     |
| Safari  | Latest 2 | High     |
| Edge    | Latest 2 | Medium   |

### Device Testing Matrix

| Device Type | Viewport | Priority |
|-------------|----------|----------|
| Mobile      | 375×667  | High     |
| Tablet      | 768×1024 | Medium   |
| Desktop     | 1920×1080| High     |

### Performance Budgets

- **Initial Load**: < 2s on 3G
- **Time to Interactive**: < 3s on 3G
- **First Contentful Paint**: < 1s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Rollback Plan

If any fix causes regressions:

1. Revert the specific commit
2. Create a hotfix branch
3. Implement alternative solution
4. Test thoroughly before redeploying
5. Document the issue and solution

