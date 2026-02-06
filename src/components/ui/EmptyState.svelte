<script lang="ts">
  export let message: string = 'No items found';
  export let icon: string = '📭';
  export let description: string = '';
</script>

<div class="empty-state">
  <div class="empty-state-icon">{icon}</div>
  <h3 class="empty-state-message">{message}</h3>
  {#if description}
    <p class="empty-state-description">{description}</p>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
    min-height: 300px;
  }

  .empty-state-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.6;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .empty-state-message {
    font-size: 1.25rem;
    font-weight: 600;
    color: #4b5563;
    margin: 0 0 0.5rem 0;
  }

  .empty-state-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
    max-width: 400px;
  }

  /* Dark mode styles */
  :global(.dark) .empty-state-message {
    color: #d1d5db;
  }

  :global(.dark) .empty-state-description {
    color: #9ca3af;
  }
</style>
