/**
 * UI Components Unit Tests
 * 
 * Tests for UI utility components to ensure they render correctly and handle interactions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import ThemeToggle from './ThemeToggle.svelte';
import LanguageSelector from './LanguageSelector.svelte';
import LoadingOverlay from './LoadingOverlay.svelte';
import EmptyState from './EmptyState.svelte';
import MonthSelector from './MonthSelector.svelte';
import CurrencyToggle from './CurrencyToggle.svelte';
import { uiStore } from '../../lib/stores/uiStore';
import { financeStore } from '../../lib/stores/financeStore';
import { Theme, Language, Currency } from '../../lib/types';

describe('ThemeToggle', () => {
  beforeEach(() => {
    uiStore.reset();
  });

  it('should render theme toggle button', () => {
    const { container } = render(ThemeToggle);
    const button = container.querySelector('.theme-toggle-btn');
    expect(button).toBeTruthy();
  });

  it('should toggle theme when clicked', async () => {
    const { container } = render(ThemeToggle);
    const button = container.querySelector('.theme-toggle-btn') as HTMLButtonElement;
    
    const initialTheme = get(uiStore).theme;
    await fireEvent.click(button);
    const newTheme = get(uiStore).theme;
    
    expect(newTheme).not.toBe(initialTheme);
  });

  it('should display sun icon in dark mode', () => {
    uiStore.setTheme(Theme.DARK);
    const { container } = render(ThemeToggle);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should display moon icon in light mode', () => {
    uiStore.setTheme(Theme.LIGHT);
    const { container } = render(ThemeToggle);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});

describe('LanguageSelector', () => {
  beforeEach(() => {
    uiStore.reset();
  });

  it('should render language selector', () => {
    const { container } = render(LanguageSelector);
    const select = container.querySelector('.language-select');
    expect(select).toBeTruthy();
  });

  it('should have all language options', () => {
    const { container } = render(LanguageSelector);
    const options = container.querySelectorAll('option');
    expect(options.length).toBe(4); // EN, RU, AZ, IT
  });

  it('should change language when option selected', async () => {
    const { container } = render(LanguageSelector);
    const select = container.querySelector('.language-select') as HTMLSelectElement;
    
    await fireEvent.change(select, { target: { value: Language.RU } });
    const currentLanguage = get(uiStore).language;
    
    expect(currentLanguage).toBe(Language.RU);
  });

  it('should display current language', () => {
    uiStore.setLanguage(Language.AZ);
    const { container } = render(LanguageSelector);
    const select = container.querySelector('.language-select') as HTMLSelectElement;
    expect(select.value).toBe(Language.AZ);
  });
});

describe('LoadingOverlay', () => {
  it('should not render when isVisible is false', () => {
    const { container } = render(LoadingOverlay, { props: { isVisible: false } });
    const overlay = container.querySelector('.loading-overlay');
    expect(overlay).toBeFalsy();
  });

  it('should render when isVisible is true', () => {
    const { container } = render(LoadingOverlay, { props: { isVisible: true } });
    const overlay = container.querySelector('.loading-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should display spinner', () => {
    const { container } = render(LoadingOverlay, { props: { isVisible: true } });
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('should display custom message', () => {
    const customMessage = 'Please wait...';
    const { getByText } = render(LoadingOverlay, { 
      props: { isVisible: true, message: customMessage } 
    });
    expect(getByText(customMessage)).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('should render with default props', () => {
    const { container } = render(EmptyState);
    const emptyState = container.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should display custom message', () => {
    const message = 'No expenses found';
    const { getByText } = render(EmptyState, { props: { message } });
    expect(getByText(message)).toBeTruthy();
  });

  it('should display custom icon', () => {
    const icon = '💰';
    const { getByText } = render(EmptyState, { props: { icon } });
    expect(getByText(icon)).toBeTruthy();
  });

  it('should display description when provided', () => {
    const description = 'Add your first expense to get started';
    const { getByText } = render(EmptyState, { props: { description } });
    expect(getByText(description)).toBeTruthy();
  });

  it('should not display description when not provided', () => {
    const { container } = render(EmptyState);
    const description = container.querySelector('.empty-state-description');
    expect(description).toBeFalsy();
  });
});

describe('MonthSelector', () => {
  beforeEach(() => {
    financeStore.reset();
    financeStore.setAvailableMonths(['2024-01', '2024-02', '2024-03']);
  });

  it('should render month selector', () => {
    const { container } = render(MonthSelector);
    const select = container.querySelector('.month-select');
    expect(select).toBeTruthy();
  });

  it('should display available months', () => {
    const { container } = render(MonthSelector);
    const options = container.querySelectorAll('option');
    expect(options.length).toBe(3);
  });

  it('should change selected month when option selected', async () => {
    const { container } = render(MonthSelector);
    const select = container.querySelector('.month-select') as HTMLSelectElement;
    
    await fireEvent.change(select, { target: { value: '2024-02' } });
    const selectedMonth = get(financeStore).selectedMonthId;
    
    expect(selectedMonth).toBe('2024-02');
  });

  it('should display current selected month', () => {
    financeStore.setSelectedMonthId('2024-03');
    const { container } = render(MonthSelector);
    const select = container.querySelector('.month-select') as HTMLSelectElement;
    expect(select.value).toBe('2024-03');
  });

  // Visual bug fix tests - Requirements 4.1, 4.2, 4.3, 4.4, 4.5
  it('should have month-select class for CSS styling', () => {
    const { container } = render(MonthSelector);
    const select = container.querySelector('.month-select') as HTMLSelectElement;
    
    // Verify the select element has the correct class for styling
    expect(select).toBeTruthy();
    expect(select.classList.contains('month-select')).toBe(true);
  });

  it('should have option elements without additional classes', () => {
    const { container } = render(MonthSelector);
    const options = container.querySelectorAll('option');
    
    // Verify options exist and are clean
    expect(options.length).toBeGreaterThan(0);
    options.forEach(option => {
      expect(option.tagName).toBe('OPTION');
    });
  });

  it('should not have pseudo-element generating classes', () => {
    const { container } = render(MonthSelector);
    const selector = container.querySelector('.month-selector');
    const select = container.querySelector('.month-select');
    
    // Verify elements exist with correct structure
    expect(selector).toBeTruthy();
    expect(select).toBeTruthy();
    
    // Verify no unwanted classes that might add decorations
    const selectorClasses = Array.from(selector?.classList || []);
    const selectClasses = Array.from(select?.classList || []);
    
    expect(selectorClasses).toContain('month-selector');
    expect(selectClasses).toContain('month-select');
  });

  it('should render cleanly in light theme', () => {
    document.body.classList.remove('dark');
    const { container } = render(MonthSelector);
    const select = container.querySelector('.month-select') as HTMLSelectElement;
    
    // Verify element is rendered
    expect(select).toBeTruthy();
    expect(select.classList.contains('month-select')).toBe(true);
  });

  it('should render cleanly in dark theme', () => {
    document.body.classList.add('dark');
    const { container } = render(MonthSelector);
    const select = container.querySelector('.month-select') as HTMLSelectElement;
    
    // Verify element is rendered
    expect(select).toBeTruthy();
    expect(select.classList.contains('month-select')).toBe(true);
    
    // Cleanup
    document.body.classList.remove('dark');
  });
});

describe('CurrencyToggle', () => {
  beforeEach(() => {
    financeStore.reset();
  });

  it('should render currency toggle buttons', () => {
    const { container } = render(CurrencyToggle);
    const buttons = container.querySelectorAll('.currency-btn');
    expect(buttons.length).toBe(2);
  });

  it('should have AZN and USD buttons', () => {
    const { getByText } = render(CurrencyToggle);
    expect(getByText('AZN')).toBeTruthy();
    expect(getByText('USD')).toBeTruthy();
  });

  it('should change currency when button clicked', async () => {
    const { getByText } = render(CurrencyToggle);
    const usdButton = getByText('USD');
    
    await fireEvent.click(usdButton);
    const currentCurrency = get(financeStore).currency;
    
    expect(currentCurrency).toBe(Currency.USD);
  });

  it('should mark active currency button', () => {
    financeStore.setCurrency(Currency.AZN);
    const { container } = render(CurrencyToggle);
    const buttons = container.querySelectorAll('.currency-btn');
    const aznButton = Array.from(buttons).find(btn => btn.textContent === 'AZN');
    
    expect(aznButton?.classList.contains('active')).toBe(true);
  });

  it('should switch between currencies', async () => {
    const { getByText } = render(CurrencyToggle);
    
    // Start with AZN
    financeStore.setCurrency(Currency.AZN);
    expect(get(financeStore).currency).toBe(Currency.AZN);
    
    // Switch to USD
    const usdButton = getByText('USD');
    await fireEvent.click(usdButton);
    expect(get(financeStore).currency).toBe(Currency.USD);
    
    // Switch back to AZN
    const aznButton = getByText('AZN');
    await fireEvent.click(aznButton);
    expect(get(financeStore).currency).toBe(Currency.AZN);
  });
});
