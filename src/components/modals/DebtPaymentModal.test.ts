import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import DebtPaymentModal from './DebtPaymentModal.svelte';
import { financeStore } from '../../lib/stores/financeStore';
import { userStore } from '../../lib/stores/userStore';

// Mock the stores
vi.mock('../../lib/stores/financeStore', () => ({
  financeStore: {
    subscribe: vi.fn((callback) => {
      callback({
        selectedMonthId: '2024-01',
        debts: [
          {
            id: 'test-debt-1',
            name: 'Test Debt',
            totalAmount: 1000,
            paidAmount: 200,
            dueDate: '2024-12-31',
            category: 'loan'
          }
        ]
      });
      return () => {};
    })
  }
}));

vi.mock('../../lib/stores/userStore', () => ({
  userStore: {
    subscribe: vi.fn((callback) => {
      callback({ userId: 'test-user-123' });
      return () => {};
    })
  }
}));

vi.mock('../../lib/services/firebase/debts', () => ({
  addDebtPayment: vi.fn().mockResolvedValue(undefined)
}));

describe('DebtPaymentModal - Input Field Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept numeric input in payment field', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Type numeric value
    await fireEvent.input(input, { target: { value: '123.45' } });
    
    // Verify value is accepted
    expect(input.value).toBe('123.45');
  });

  it('should accept integer input', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Type integer value
    await fireEvent.input(input, { target: { value: '500' } });
    
    // Verify value is accepted
    expect(input.value).toBe('500');
  });

  it('should reject non-numeric characters', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Try to type letters
    await fireEvent.input(input, { target: { value: 'abc' } });
    
    // Verify letters are rejected (empty string)
    expect(input.value).toBe('');
  });

  it('should reject special characters except decimal point', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Try to type special characters
    await fireEvent.input(input, { target: { value: '12@#$34' } });
    
    // Verify special characters are filtered out
    expect(input.value).toBe('1234');
  });

  it('should allow only one decimal point', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Try to type multiple decimal points
    await fireEvent.input(input, { target: { value: '12.34.56' } });
    
    // Verify only first decimal point is kept
    expect(input.value).toBe('12.3456');
  });

  it('should limit decimal places to 2', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Try to type more than 2 decimal places
    await fireEvent.input(input, { target: { value: '12.999' } });
    
    // Verify decimal places are limited to 2
    expect(input.value).toBe('12.99');
  });

  it('should accept decimal input with leading zero', async () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Type decimal value with leading zero
    await fireEvent.input(input, { target: { value: '0.50' } });
    
    // Verify value is accepted
    expect(input.value).toBe('0.50');
  });

  it('should have inputmode="decimal" for mobile keyboard', () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Verify inputmode attribute
    expect(input.getAttribute('inputmode')).toBe('decimal');
  });

  it('should have proper ARIA attributes for accessibility', () => {
    const { getByLabelText } = render(DebtPaymentModal, {
      props: { debtId: 'test-debt-1' }
    });
    
    const input = getByLabelText('Payment amount') as HTMLInputElement;
    
    // Verify ARIA attributes
    expect(input.getAttribute('aria-label')).toBe('Payment amount');
    expect(input.getAttribute('aria-describedby')).toBe('payment-amount-help');
  });
});
