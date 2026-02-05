<script lang="ts">
  import { calendarStore } from '../../lib/stores/calendarStore';
  import { userStore } from '../../lib/stores/userStore';
  import { uiStore } from '../../lib/stores/uiStore';
  import { translations } from '../../lib/i18n';
  import { deleteCalendarEvent } from '../../lib/services/firebase/calendar';
  import CalendarGrid from '../calendar/CalendarGrid.svelte';
  
  // Subscribe to stores
  $: calendarDate = $calendarStore.calendarDate;
  $: calendarEvents = $calendarStore.calendarEvents;
  $: userId = $userStore.userId;
  $: currentTranslations = $translations;
  
  // Navigate to previous month
  function navigatePrevMonth() {
    calendarStore.navigateMonth(-1);
  }
  
  // Navigate to next month
  function navigateNextMonth() {
    calendarStore.navigateMonth(1);
  }
  
  // Navigate to today
  function navigateToday() {
    calendarStore.setCalendarDate(new Date());
  }
  
  // Open add event modal for a specific date
  function handleAddEvent(date: string) {
    uiStore.openModal('calendar-event', { date });
  }
  
  // Open edit event modal
  function handleEditEvent(eventId: string) {
    uiStore.openModal('calendar-event', { editId: eventId });
  }
  
  // Delete event with confirmation
  async function handleDeleteEvent(eventId: string) {
    if (!userId) return;
    
    const confirmed = confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;
    
    try {
      await deleteCalendarEvent(userId, eventId);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      alert('Failed to delete event. Please try again.');
    }
  }
  
  // Format month/year for display
  $: monthYearDisplay = calendarDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
</script>

<div class="calendar-tab">
  <!-- Header -->
  <div class="calendar-header">
    <h2 class="tab-title">
      {currentTranslations['calendar'] || 'Calendar'}
    </h2>
    
    <div class="calendar-controls">
      <!-- Month navigation -->
      <div class="month-navigation">
        <button
          on:click={navigatePrevMonth}
          class="nav-button"
          aria-label="Previous month"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span class="month-display">{monthYearDisplay}</span>
        
        <button
          on:click={navigateNextMonth}
          class="nav-button"
          aria-label="Next month"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Today button -->
      <button
        on:click={navigateToday}
        class="today-button"
      >
        {currentTranslations['today'] || 'Today'}
      </button>
    </div>
  </div>
  
  <!-- Calendar Grid -->
  <div class="calendar-content">
    <CalendarGrid
      {calendarDate}
      {calendarEvents}
      on:addEvent={(e) => handleAddEvent(e.detail.date)}
      on:editEvent={(e) => handleEditEvent(e.detail.eventId)}
      on:deleteEvent={(e) => handleDeleteEvent(e.detail.eventId)}
    />
  </div>
</div>

<style>
  .calendar-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .tab-title {
    font-size: 1.875rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }
  
  .calendar-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .month-navigation {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 0.5rem;
    padding: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
  
  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    background: transparent;
    color: #4b5563;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .nav-button:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
  }
  
  .month-display {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    min-width: 10rem;
    text-align: center;
  }
  
  .today-button {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  
  .today-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .calendar-content {
    flex: 1;
    overflow: auto;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);
    padding: 1.5rem;
  }
  
  /* Dark mode styles */
  :global(.dark) .tab-title {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  :global(.dark) .month-navigation {
    background: rgba(31, 41, 55, 0.6);
    border-color: rgba(75, 85, 99, 0.8);
  }
  
  :global(.dark) .nav-button {
    color: #9ca3af;
  }
  
  :global(.dark) .nav-button:hover {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }
  
  :global(.dark) .month-display {
    color: #f3f4f6;
  }
  
  :global(.dark) .today-button {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  }
  
  :global(.dark) .calendar-content {
    background: rgba(31, 41, 55, 0.6);
    border-color: rgba(75, 85, 99, 0.8);
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .calendar-tab {
      padding: 1rem;
    }
    
    .calendar-header {
      flex-direction: column;
      align-items: stretch;
    }
    
    .tab-title {
      font-size: 1.5rem;
      text-align: center;
    }
    
    .calendar-controls {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .month-navigation {
      justify-content: center;
    }
    
    .calendar-content {
      padding: 1rem;
    }
  }
</style>
