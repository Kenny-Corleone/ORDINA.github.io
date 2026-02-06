<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { calendarStore } from '../../lib/stores/calendarStore';
  import { userStore } from '../../lib/stores/userStore';
  import { uiStore } from '../../lib/stores/uiStore';
  import { addCalendarEvent, updateCalendarEvent } from '../../lib/services/firebase/calendar';
  import { validateString, validateDate } from '../../lib/utils/validation';
  import { getTodayISOString } from '../../lib/utils/formatting';
  import { EventType } from '../../lib/types';
  import type { CalendarEvent } from '../../lib/types';
  
  export let editId: string | null = null;
  
  const dispatch = createEventDispatcher();
  
  // Form state
  let name = '';
  let date = getTodayISOString();
  let type = EventType.EVENT;
  let notes = '';
  
  // Validation errors
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Get data from stores
  $: userId = $userStore.userId;
  $: calendarEvents = $calendarStore.calendarEvents;
  $: modalData = $uiStore.modalData;
  
  // Event type options
  const typeOptions = [
    { value: EventType.EVENT, label: 'Event', icon: '📅' },
    { value: EventType.BIRTHDAY, label: 'Birthday', icon: '🎂' },
    { value: EventType.MEETING, label: 'Meeting', icon: '👥' },
    { value: EventType.WEDDING, label: 'Wedding', icon: '💒' }
  ];
  
  // If editing, populate form with existing data
  $: if (editId) {
    const event = calendarEvents.find(e => e.id === editId);
    if (event) {
      name = event.name;
      date = event.date;
      type = event.type;
      notes = event.notes || '';
    }
  } else if (modalData?.date) {
    // If adding a new event with a specific date
    date = modalData.date;
  }
  
  // Validate individual field
  function validateField(field: string): boolean {
    delete errors[field];
    
    switch (field) {
      case 'name': {
        const result = validateString(name, { minLength: 1, maxLength: 200, required: true });
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
        }
        break;
      }
      case 'date': {
        const result = validateDate(date, { required: true });
        if (!result.valid) {
          errors[field] = result.error!;
          return false;
        }
        break;
      }
      case 'notes': {
        if (notes.trim().length > 0) {
          const result = validateString(notes, { minLength: 0, maxLength: 1000, required: false });
          if (!result.valid) {
            errors[field] = result.error!;
            return false;
          }
        }
        break;
      }
    }
    
    return true;
  }
  
  // Validate all fields
  function validateForm(): boolean {
    errors = {};
    let isValid = true;
    
    if (!validateField('name')) isValid = false;
    if (!validateField('date')) isValid = false;
    if (!validateField('notes')) isValid = false;
    
    return isValid;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    if (!userId) {
      errors.submit = 'User not authenticated';
      return;
    }
    
    isSubmitting = true;
    errors = {};
    
    try {
      const eventData = {
        name: name.trim(),
        date: date,
        type: type,
        notes: notes.trim() || undefined,
      };
      
      if (editId) {
        // Update existing event
        await updateCalendarEvent(userId, editId, eventData);
      } else {
        // Add new event
        await addCalendarEvent(userId, eventData);
      }
      
      // Close modal on success
      dispatch('close');
    } catch (error: any) {
      console.error('Error saving calendar event:', error);
      errors.submit = error.message || 'Failed to save event. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Handle cancel
  function handleCancel() {
    dispatch('close');
  }
  
  // Handle field blur for validation
  function handleBlur(field: string) {
    validateField(field);
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <!-- Name field -->
  <div>
    <label for="calendar-event-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Event Name *
    </label>
    <input
      id="calendar-event-name"
      type="text"
      bind:value={name}
      on:blur={() => handleBlur('name')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      placeholder="Enter event name"
      disabled={isSubmitting}
      required
    />
    {#if errors.name}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
    {/if}
  </div>
  
  <!-- Date field -->
  <div>
    <label for="calendar-event-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Date *
    </label>
    <input
      id="calendar-event-date"
      type="date"
      bind:value={date}
      on:blur={() => handleBlur('date')}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      disabled={isSubmitting}
      required
    />
    {#if errors.date}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
    {/if}
  </div>
  
  <!-- Type field -->
  <div>
    <label for="calendar-event-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Event Type *
    </label>
    <select
      id="calendar-event-type"
      bind:value={type}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      disabled={isSubmitting}
      required
    >
      {#each typeOptions as option}
        <option value={option.value}>
          {option.icon} {option.label}
        </option>
      {/each}
    </select>
  </div>
  
  <!-- Notes field -->
  <div>
    <label for="calendar-event-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Notes
    </label>
    <textarea
      id="calendar-event-notes"
      bind:value={notes}
      on:blur={() => handleBlur('notes')}
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
      placeholder="Optional notes"
      disabled={isSubmitting}
    />
    {#if errors.notes}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
    {/if}
  </div>
  
  <!-- Submit error -->
  {#if errors.submit}
    <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
      <p class="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
    </div>
  {/if}
  
  <!-- Form actions -->
  <div class="flex justify-end gap-2 pt-4">
    <button
      type="button"
      on:click={handleCancel}
      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      disabled={isSubmitting}
    >
      Cancel
    </button>
    <button
      type="submit"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isSubmitting}
    >
      {#if isSubmitting}
        Saving...
      {:else}
        {editId ? 'Update' : 'Add'} Event
      {/if}
    </button>
  </div>
</form>
