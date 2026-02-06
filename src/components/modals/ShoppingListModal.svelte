<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  interface ShoppingItem {
    id: string;
    name: string;
    quantity: number;
    checked: boolean;
  }
  
  let items: ShoppingItem[] = [];
  let itemName = '';
  let itemQuantity = 1;
  
  // Load items from localStorage
  onMount(() => {
    const saved = localStorage.getItem('shoppingList');
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load shopping list:', e);
        items = [];
      }
    }
  });
  
  // Save items to localStorage
  function saveItems() {
    localStorage.setItem('shoppingList', JSON.stringify(items));
  }
  
  // Add new item
  function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!itemName.trim()) return;
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      quantity: itemQuantity || 1,
      checked: false,
    };
    
    items = [...items, newItem];
    saveItems();
    
    // Reset form
    itemName = '';
    itemQuantity = 1;
  }
  
  // Toggle item checked state
  function toggleItem(id: string) {
    items = items.map(item => {
      if (item.id === id) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    
    // Remove checked items after a short delay
    setTimeout(() => {
      items = items.filter(item => !item.checked);
      saveItems();
    }, 500);
  }
  
  // Delete item
  function deleteItem(id: string) {
    items = items.filter(item => item.id !== id);
    saveItems();
  }
  
  function handleClose() {
    dispatch('close');
  }
</script>

<div class="shopping-list-modal">
  <!-- Add item form -->
  <form id="shopping-form" class="mb-4" on:submit={handleSubmit}>
    <div class="grid grid-cols-3 gap-2">
      <input
        type="text"
        id="shop-name"
        placeholder="Наименование"
        class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-full p-2.5 text-gray-900 dark:text-gray-100"
        bind:value={itemName}
        required
      />
      <input
        type="number"
        id="shop-qty"
        placeholder="Кол-во"
        min="1"
        class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-full p-2.5 text-gray-900 dark:text-gray-100"
        bind:value={itemQuantity}
        required
      />
      <button
        type="submit"
        class="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Добавить
      </button>
    </div>
  </form>
  
  <!-- Shopping list -->
  <div id="shopping-list" class="space-y-2 max-h-64 overflow-y-auto">
    {#if items.length === 0}
      <p class="text-center text-gray-500 dark:text-gray-400 py-4">Список пуст</p>
    {:else}
      {#each items as item (item.id)}
        <div
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all {item.checked ? 'opacity-50' : ''}"
        >
          <div class="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              checked={item.checked}
              on:change={() => toggleItem(item.id)}
              class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div class="flex-1">
              <span class="text-gray-900 dark:text-gray-100 {item.checked ? 'line-through' : ''}">
                {item.name}
              </span>
              <span class="text-gray-500 dark:text-gray-400 ml-2">
                × {item.quantity}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            on:click={() => deleteItem(item.id)}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      {/each}
    {/if}
  </div>
  
  <!-- Info text -->
  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
    Купленные позиции исчезают из списка. Остальные сохраняются.
  </p>
  
  <!-- Close button -->
  <div class="flex justify-end gap-4 mt-6">
    <button
      type="button"
      class="cancel-btn text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      on:click={handleClose}
    >
      Закрыть
    </button>
  </div>
</div>

<style>
  .shopping-list-modal {
    padding: 0;
  }
  
  /* Smooth transition for checked items */
  .space-y-2 > div {
    transition: opacity 0.3s ease;
  }
</style>
