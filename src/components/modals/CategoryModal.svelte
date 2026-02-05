<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { financeStore } from '../../lib/stores/financeStore';
  import { userStore } from '../../lib/stores/userStore';
  import { addCategory, updateCategory, deleteCategory } from '../../lib/services/firebase/categories';
  import { validateString } from '../../lib/utils/validation';
  import type { Category } from '../../lib/types';
  
  const dispatch = createEventDispatcher();
  
  // Form state for adding new category
  let newCategoryName = '';
  let editingCategoryId: string | null = null;
  let editingCategoryName = '';
  
  // Validation errors
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Get data from stores
  $: userId = $userStore.userId;
  $: categories = $financeStore.categories;
  
  // Validate category name
  function validateCategoryName(name: string, field: string): boolean {
    delete errors[field];
    
    const result = validateString(name, { minLength: 1, maxLength: 100, required: true });
    if (!result.valid) {
      errors[field] = result.error!;
      return false;
    }
    
    // Check for duplicate names (case-insensitive)
    const trimmedName = name.trim().toLowerCase();
    const isDuplicate = categories.some(cat => {
      // Skip the category being edited
      if (editingCategoryId && cat.id === editingCategoryId) {
        return false;
      }
      return cat.name.toLowerCase() === trimmedName;
    });
    
    if (isDuplicate) {
      errors[field] = 'A category with this name already exists';
      return false;
    }
    
    return true;
  }
  
  // Handle adding new category
  async function handleAddCategory() {
    if (!validateCategoryName(newCategoryName, 'newCategory')) {
      return;
    }
    
    if (!userId) {
      errors.newCategory = 'User not authenticated';
      return;
    }
    
    isSubmitting = true;
    errors = {};
    
    try {
      await addCategory(userId, { name: newCategoryName.trim() });
      newCategoryName = '';
    } catch (error: any) {
      console.error('Error adding category:', error);
      errors.newCategory = error.message || 'Failed to add category. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Start editing a category
  function startEdit(category: Category) {
    editingCategoryId = category.id;
    editingCategoryName = category.name;
    errors = {};
  }
  
  // Cancel editing
  function cancelEdit() {
    editingCategoryId = null;
    editingCategoryName = '';
    errors = {};
  }
  
  // Handle updating category
  async function handleUpdateCategory(categoryId: string) {
    if (!validateCategoryName(editingCategoryName, 'editCategory')) {
      return;
    }
    
    if (!userId) {
      errors.editCategory = 'User not authenticated';
      return;
    }
    
    isSubmitting = true;
    errors = {};
    
    try {
      await updateCategory(userId, categoryId, { name: editingCategoryName.trim() });
      editingCategoryId = null;
      editingCategoryName = '';
    } catch (error: any) {
      console.error('Error updating category:', error);
      errors.editCategory = error.message || 'Failed to update category. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Handle deleting category
  async function handleDeleteCategory(categoryId: string, categoryName: string) {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }
    
    if (!userId) {
      errors.delete = 'User not authenticated';
      return;
    }
    
    isSubmitting = true;
    errors = {};
    
    try {
      await deleteCategory(userId, categoryId);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      errors.delete = error.message || 'Failed to delete category. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Handle close
  function handleClose() {
    dispatch('close');
  }
</script>

<div class="space-y-6">
  <!-- Add new category section -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Add New Category</h3>
    <form on:submit|preventDefault={handleAddCategory} class="flex gap-2">
      <div class="flex-1">
        <input
          type="text"
          bind:value={newCategoryName}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter category name"
          disabled={isSubmitting}
        />
        {#if errors.newCategory}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newCategory}</p>
        {/if}
      </div>
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        disabled={isSubmitting || !newCategoryName.trim()}
      >
        Add Category
      </button>
    </form>
  </div>
  
  <!-- Existing categories list -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Existing Categories</h3>
    
    {#if categories.length === 0}
      <div class="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No categories yet. Add your first category above.</p>
      </div>
    {:else}
      <div class="space-y-2 max-h-96 overflow-y-auto">
        {#each categories as category (category.id)}
          <div class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            {#if editingCategoryId === category.id}
              <!-- Edit mode -->
              <input
                type="text"
                bind:value={editingCategoryName}
                class="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isSubmitting}
              />
              <button
                type="button"
                on:click={() => handleUpdateCategory(category.id)}
                class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Save
              </button>
              <button
                type="button"
                on:click={cancelEdit}
                class="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            {:else}
              <!-- View mode -->
              <span class="flex-1 text-gray-900 dark:text-white">{category.name}</span>
              <button
                type="button"
                on:click={() => startEdit(category)}
                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
                title="Edit category"
              >
                Edit
              </button>
              <button
                type="button"
                on:click={() => handleDeleteCategory(category.id, category.name)}
                class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
                title="Delete category"
              >
                Delete
              </button>
            {/if}
          </div>
        {/each}
      </div>
      
      {#if errors.editCategory}
        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{errors.editCategory}</p>
      {/if}
      {#if errors.delete}
        <p class="mt-2 text-sm text-red-600 dark:text-red-400">{errors.delete}</p>
      {/if}
    {/if}
  </div>
  
  <!-- Info message -->
  <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
    <p class="text-sm text-blue-700 dark:text-blue-300">
      Categories help you organize your expenses. They will appear as suggestions when adding expenses.
    </p>
  </div>
  
  <!-- Close button -->
  <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
    <button
      type="button"
      on:click={handleClose}
      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      Close
    </button>
  </div>
</div>

<style>
  /* Custom scrollbar for categories list */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.7);
  }
  
  /* Dark mode scrollbar */
  :global(.dark) .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5);
  }
  
  :global(.dark) .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.7);
  }
</style>
