<script lang="ts">
  import { loginWithEmail, signupWithEmail, loginWithGoogle } from '../../lib/services/firebase/auth';
  import { translations } from '../../lib/i18n';
  import { logger } from '../../lib/utils/logger';
  
  let email = '';
  let password = '';
  let isLogin = true;
  let error = '';
  let isSubmitting = false;

  // Validation functions
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  // Handle email/password login
  async function handleEmailLogin() {
    error = '';
    
    // Validation
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    if (!validateEmail(email)) {
      error = $translations.authInvalidEmail || 'Invalid email format';
      return;
    }

    if (!validatePassword(password)) {
      error = $translations.authWeakPassword || 'Password must be at least 6 characters';
      return;
    }

    isSubmitting = true;

    try {
      await loginWithEmail(email, password);
      // Success - Firebase auth state change will be handled by App.svelte
    } catch (err: unknown) {
      logger.error('Login error:', err);
      
      const firebaseError = err as { code?: string };
      
      // Handle specific Firebase error codes
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          error = $translations.authInvalidCredentials || 'Invalid email or password';
          break;
        case 'auth/invalid-email':
          error = $translations.authInvalidEmail || 'Invalid email format';
          break;
        case 'auth/network-request-failed':
          error = 'Network error. Please check your connection';
          break;
        default:
          error = $translations.authGenericError || 'An error occurred. Please try again';
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Handle signup
  async function handleSignup() {
    error = '';
    
    // Validation
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    if (!validateEmail(email)) {
      error = $translations.authInvalidEmail || 'Invalid email format';
      return;
    }

    if (!validatePassword(password)) {
      error = $translations.authWeakPassword || 'Password must be at least 6 characters';
      return;
    }

    isSubmitting = true;

    try {
      await signupWithEmail(email, password);
      // Success - Firebase auth state change will be handled by App.svelte
    } catch (err: unknown) {
      logger.error('Signup error:', err);
      
      const firebaseError = err as { code?: string };

      // Handle specific Firebase error codes
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          error = $translations.authEmailInUse || 'This email is already in use';
          break;
        case 'auth/invalid-email':
          error = $translations.authInvalidEmail || 'Invalid email format';
          break;
        case 'auth/weak-password':
          error = $translations.authWeakPassword || 'Password is too weak';
          break;
        case 'auth/network-request-failed':
          error = 'Network error. Please check your connection';
          break;
        default:
          error = $translations.authGenericError || 'An error occurred. Please try again';
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Handle Google OAuth login
  async function handleGoogleLogin() {
    error = '';
    isSubmitting = true;

    try {
      await loginWithGoogle();
      // Success - Firebase auth state change will be handled by App.svelte
    } catch (err: unknown) {
      logger.error('Google login error:', err);
      
      const firebaseError = err as { code?: string };

      // Handle specific Firebase error codes
      switch (firebaseError.code) {
        case 'auth/popup-closed-by-user':
          error = 'Sign-in popup was closed';
          break;
        case 'auth/popup-blocked':
          error = 'Sign-in popup was blocked by browser';
          break;
        case 'auth/network-request-failed':
          error = 'Network error. Please check your connection';
          break;
        default:
          error = $translations.authGenericError || 'An error occurred. Please try again';
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Toggle between login and signup
  function toggleMode() {
    isLogin = !isLogin;
    error = '';
    email = '';
    password = '';
  }

  // Handle form submission
  function handleSubmit(e: Event) {
    e.preventDefault();
    if (isLogin) {
      handleEmailLogin();
    } else {
      handleSignup();
    }
  }

  // Handle Enter key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(e);
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card premium-card">
    <!-- Logo and Title -->
    <div class="auth-header">
      <h1 class="auth-title">ORDINA</h1>
      <p class="auth-subtitle">{$translations.appSubtitle || 'Manage your life with ease'}</p>
    </div>

    <!-- Tab Toggle -->
    <div class="auth-tabs">
      <button 
        class="auth-tab" 
        class:active={isLogin}
        on:click={() => { isLogin = true; error = ''; }}
        disabled={isSubmitting}
      >
        {$translations.login || 'Sign in'}
      </button>
      <button 
        class="auth-tab" 
        class:active={!isLogin}
        on:click={() => { isLogin = false; error = ''; }}
        disabled={isSubmitting}
      >
        {$translations.register || 'Register'}
      </button>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="auth-error">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 13c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-.5-9h1v5h-1V5zm0 6h1v1h-1v-1z" fill="currentColor"/>
        </svg>
        <span>{error}</span>
      </div>
    {/if}

    <!-- Email/Password Form -->
    <form class="auth-form" on:submit={handleSubmit}>
      <div class="form-group">
        <label for="email" class="form-label">
          {$translations.placeholderEmail || 'Email'}
        </label>
        <input
          id="email"
          type="email"
          class="premium-input"
          placeholder={$translations.placeholderEmail || 'Enter your email'}
          bind:value={email}
          on:keydown={handleKeydown}
          disabled={isSubmitting}
          autocomplete="email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password" class="form-label">
          {$translations.placeholderPassword || 'Password'}
        </label>
        <input
          id="password"
          type="password"
          class="premium-input"
          placeholder={$translations.placeholderPassword || 'Enter your password'}
          bind:value={password}
          on:keydown={handleKeydown}
          disabled={isSubmitting}
          autocomplete={isLogin ? 'current-password' : 'new-password'}
          required
        />
      </div>

      <button 
        type="submit" 
        class="auth-button primary"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <span class="spinner"></span>
          {$translations.loading || 'Loading...'}
        {:else}
          {isLogin ? ($translations.login || 'Sign in') : ($translations.register || 'Register')}
        {/if}
      </button>
    </form>

    <!-- Divider -->
    <div class="auth-divider">
      <span>or</span>
    </div>

    <!-- Google OAuth Button -->
    <button 
      class="auth-button google"
      on:click={handleGoogleLogin}
      disabled={isSubmitting}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
        <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
      </svg>
      {$translations.loginWithGoogle || 'Sign in with Google'}
    </button>

    <!-- Toggle Mode Link -->
    <div class="auth-footer">
      <p>
        {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
        <button 
          class="auth-link" 
          on:click={toggleMode}
          disabled={isSubmitting}
        >
          {isLogin ? ($translations.register || 'Register') : ($translations.login || 'Sign in')}
        </button>
      </p>
    </div>
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-attachment: fixed;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    background: var(--glass-bg-light);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border-light);
    border-radius: var(--card-radius-xl);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    animation: fadeInUp 0.5s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .auth-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    letter-spacing: 0.5px;
  }

  .auth-subtitle {
    color: var(--text-secondary-light);
    font-size: 0.95rem;
    margin: 0;
  }

  .auth-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    background: rgba(148, 163, 184, 0.1);
    padding: 0.25rem;
    border-radius: 0.75rem;
  }

  .auth-tab {
    flex: 1;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-secondary-light);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .auth-tab:hover:not(:disabled) {
    background: rgba(148, 163, 184, 0.15);
  }

  .auth-tab.active {
    background: white;
    color: #4c5fd5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .auth-tab:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .auth-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.75rem;
    color: #dc2626;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .auth-error svg {
    flex-shrink: 0;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary-light);
  }

  .premium-input {
    width: 100%;
    padding: 0.875rem 1rem;
    background: var(--glass-bg-light);
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    border: 1px solid var(--glass-border-light);
    border-radius: var(--input-radius);
    font-size: 0.95rem;
    color: var(--text-primary-light);
    transition: all 0.2s ease;
  }

  .premium-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .premium-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .premium-input::placeholder {
    color: var(--text-secondary-light);
  }

  .auth-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.875rem 1rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .auth-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .auth-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .auth-button.primary:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    transform: translateY(-1px);
  }

  .auth-button.primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .auth-button.google {
    background: white;
    color: var(--text-primary-light);
    border: 1px solid var(--glass-border-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .auth-button.google:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }

  .auth-button.google:active:not(:disabled) {
    transform: translateY(0);
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .auth-divider {
    display: flex;
    align-items: center;
    margin: 1.5rem 0;
    color: var(--text-secondary-light);
    font-size: 0.875rem;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--glass-border-light);
  }

  .auth-divider span {
    padding: 0 1rem;
  }

  .auth-footer {
    text-align: center;
    margin-top: 1.5rem;
  }

  .auth-footer p {
    color: var(--text-secondary-light);
    font-size: 0.875rem;
    margin: 0;
  }

  .auth-link {
    background: none;
    border: none;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-left: 0.25rem;
    transition: color 0.2s ease;
  }

  .auth-link:hover:not(:disabled) {
    color: #5568d3;
    text-decoration: underline;
  }

  .auth-link:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Responsive Design */
  @media (max-width: 480px) {
    .auth-card {
      padding: 2rem 1.5rem;
    }

    .auth-title {
      font-size: 2rem;
    }

    .auth-subtitle {
      font-size: 0.875rem;
    }
  }

  /* Dark Mode Support */
  :global(.dark) .auth-card {
    background: var(--glass-bg-dark);
    border-color: var(--glass-border-dark);
  }

  :global(.dark) .auth-subtitle {
    color: var(--text-secondary-dark);
  }

  :global(.dark) .auth-tab {
    color: var(--text-secondary-dark);
  }

  :global(.dark) .auth-tab.active {
    background: rgba(255, 255, 255, 0.1);
    color: #8b9aee;
  }

  :global(.dark) .form-label {
    color: var(--text-primary-dark);
  }

  :global(.dark) .premium-input {
    background: var(--glass-bg-dark);
    border-color: var(--glass-border-dark);
    color: var(--text-primary-dark);
  }

  :global(.dark) .premium-input::placeholder {
    color: var(--text-secondary-dark);
  }

  :global(.dark) .auth-button.google {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary-dark);
    border-color: var(--glass-border-dark);
  }

  :global(.dark) .auth-divider::before,
  :global(.dark) .auth-divider::after {
    background: var(--glass-border-dark);
  }

  :global(.dark) .auth-divider {
    color: var(--text-secondary-dark);
  }

  :global(.dark) .auth-footer p {
    color: var(--text-secondary-dark);
  }

  :global(.dark) .auth-link {
    color: #8b9aee;
  }

  :global(.dark) .auth-link:hover:not(:disabled) {
    color: #a5b4f6;
  }
</style>
