<script lang="ts">
  import { financeStore } from '../../lib/stores/financeStore';
  import { Currency } from '../../lib/types';

  let currentCurrency: Currency;

  // Subscribe to currency changes
  financeStore.subscribe(state => {
    currentCurrency = state.currency;
  });

  function setCurrency(currency: Currency) {
    financeStore.setCurrency(currency);
  }
</script>

<div class="currency-toggle">
  <button
    class="currency-btn"
    class:active={currentCurrency === Currency.AZN}
    on:click={() => setCurrency(Currency.AZN)}
    aria-label="Switch to AZN"
    aria-pressed={currentCurrency === Currency.AZN}
  >
    AZN
  </button>
  <button
    class="currency-btn"
    class:active={currentCurrency === Currency.USD}
    on:click={() => setCurrency(Currency.USD)}
    aria-label="Switch to USD"
    aria-pressed={currentCurrency === Currency.USD}
  >
    USD
  </button>
</div>

<style>
  .currency-toggle {
    display: inline-flex;
    gap: 0.5rem;
    padding: 0.25rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .currency-btn {
    padding: 0.5rem 1.25rem;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 0.025em;
  }

  .currency-btn:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  .currency-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transform: translateY(-1px);
  }

  .currency-btn.active:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a4291 100%);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  .currency-btn:active {
    transform: translateY(0);
  }

  .currency-btn:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  /* Dark mode styles */
  :global(.dark) .currency-toggle {
    background: rgba(0, 0, 0, 0.2);
  }

  :global(.dark) .currency-btn {
    color: #9ca3af;
  }

  :global(.dark) .currency-btn:hover {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
  }

  :global(.dark) .currency-btn.active {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1f2937;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  }

  :global(.dark) .currency-btn.active:hover {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
  }

  :global(.dark) .currency-btn:focus {
    outline-color: #fbbf24;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .currency-toggle {
      width: 100%;
    }

    .currency-btn {
      flex: 1;
      padding: 0.625rem 1rem;
    }
  }
</style>
