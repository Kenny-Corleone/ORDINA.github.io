<script lang="ts">
  export let items: Record<string, any>[] = [];
  export let kind = 'expenses';
  export let onRemove: (kind: string, id: string) => void;
</script>

{#if items.length}
  <div class="data-table">
    {#each items as item}
      <div class="data-row">
        <div class="data-main"><strong>{item.name}</strong><small>{item.date || (item.dueDay ? `Due on day ${item.dueDay}` : item.comment || item.details || 'No details')}</small></div>
        {#if kind === 'debts'}<span class="amount">{item.paidAmount || 0} / {item.totalAmount || 0}</span>{:else if item.amount !== undefined}<span class="amount">{item.amount}</span>{/if}
        <button class="danger-link" on:click={() => onRemove(kind, item.id)}>Delete</button>
      </div>
    {/each}
  </div>
{:else}
  <div class="empty large">Nothing here yet. Use <strong>Add new</strong> to create your first record.</div>
{/if}
