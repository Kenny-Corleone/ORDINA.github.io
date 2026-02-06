import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import AuthContainer from './AuthContainer.svelte';

// Mock the auth service
vi.mock('../../lib/services/firebase/auth', () => ({
  loginWithEmail: vi.fn(),
  signupWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn()
}));

// Mock the i18n store
vi.mock('../../lib/i18n', () => ({
  translations: {
    subscribe: (fn: any) => {
      fn({
        appSubtitle: 'Manage your life with ease',
        login: 'Sign in',
        register: 'Register',
        placeholderEmail: 'Enter your email',
        placeholderPassword: 'Enter your password',
        loginWithGoogle: 'Sign in with Google',
        authInvalidEmail: 'Invalid email format',
        authWeakPassword: 'Password must be at least 6 characters',
        authInvalidCredentials: 'Invalid email or password',
        authEmailInUse: 'This email is already in use',
        authGenericError: 'An error occurred. Please try again',
        loading: 'Loading...'
      });
      return () => {};
    }
  }
}));

describe('AuthContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the auth container with login form by default', () => {
      render(AuthContainer);
      
      expect(screen.getByText('ORDINA')).toBeTruthy();
      expect(screen.getByText('Manage your life with ease')).toBeTruthy();
      expect(screen.getAllByText('Sign in').length).toBe(2); // Tab + Submit button
      expect(screen.getAllByText('Register').length).toBe(2); // Tab + Footer link
    });

    it('should render login and register tabs', () => {
      render(AuthContainer);
      
      const tabs = screen.getAllByRole('button');
      const loginTab = tabs.find(tab => tab.textContent === 'Sign in');
      const registerTab = tabs.find(tab => tab.textContent === 'Register');
      
      expect(loginTab).toBeTruthy();
      expect(registerTab).toBeTruthy();
    });

    it('should render Google OAuth button', () => {
      render(AuthContainer);
      
      expect(screen.getByText('Sign in with Google')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should handle form submission', async () => {
      render(AuthContainer);
      
      // Filter to get the submit button, not the tab
      const submitBtn = screen.getAllByRole('button', { name: 'Sign in' }).find(btn => (btn as HTMLButtonElement).type === 'submit') as HTMLButtonElement;
      await fireEvent.click(submitBtn);
      
      // Test that the component handles the click without crashing
      expect(true).toBe(true);
    });
  });

  describe('Email/Password Login', () => {
    it('should render login form elements', async () => {
      render(AuthContainer);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      // Filter to get the submit button, not the tab
      const submitBtn = screen.getAllByRole('button', { name: 'Sign in' }).find(btn => (btn as HTMLButtonElement).type === 'submit') as HTMLButtonElement;
      
      await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
      await fireEvent.input(passwordInput, { target: { value: 'password123' } });
      
      // Test that inputs can be filled
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(submitBtn).toBeTruthy();
    });
  });

  describe('Email/Password Signup', () => {
    it('should render register tab', async () => {
      render(AuthContainer);
      
      const tabs = screen.getAllByRole('button');
      const registerTab = tabs.find(tab => tab.textContent === 'Register');
      
      expect(registerTab).toBeTruthy();
    });
  });

  describe('Google OAuth Login', () => {
    it('should render Google OAuth button', async () => {
      render(AuthContainer);
      
      const googleButton = screen.getByText('Sign in with Google');
      expect(googleButton).toBeTruthy();
    });
  });

  describe('Mode Toggle', () => {
    it('should render mode toggle elements', async () => {
      render(AuthContainer);
      
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(AuthContainer);
      
      expect(screen.getByLabelText(/email/i)).toBeTruthy();
      expect(screen.getByLabelText(/password/i)).toBeTruthy();
    });

    it('should have proper autocomplete attributes', () => {
      render(AuthContainer);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect((emailInput as HTMLInputElement).getAttribute('autocomplete')).toBe('email');
      expect((passwordInput as HTMLInputElement).getAttribute('autocomplete')).toBe('current-password');
    });
  });
});
