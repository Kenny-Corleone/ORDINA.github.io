<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { EventType } from '../../lib/types';
  import type { CalendarEvent } from '../../lib/types';
  
  export let calendarDate: Date;
  export let calendarEvents: CalendarEvent[];
  
  const dispatch = createEventDispatcher();
  
  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  $: firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  
  // Get the number of days in the month
  $: daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  
  // Get the number of days in the previous month
  $: daysInPrevMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 0).getDate();
  
  // Build calendar grid (6 weeks x 7 days = 42 cells)
  $: calendarGrid = buildCalendarGrid(calendarDate, firstDayOfMonth, daysInMonth, daysInPrevMonth);
  
  // Group events by date
  $: eventsByDate = groupEventsByDate(calendarEvents);
  
  // Get today's date string for highlighting
  $: todayStr = getTodayString();
  
  function buildCalendarGrid(date: Date, firstDay: number, daysInMonth: number, daysInPrevMonth: number) {
    const grid: Array<{
      date: number;
      month: 'prev' | 'current' | 'next';
      dateStr: string;
    }> = [];
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      grid.push({
        date: day,
        month: 'prev',
        dateStr: formatDateStr(prevYear, prevMonth, day)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push({
        date: day,
        month: 'current',
        dateStr: formatDateStr(year, month, day)
      });
    }
    
    // Next month days (fill to 42 cells)
    const remainingCells = 42 - grid.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      grid.push({
        date: day,
        month: 'next',
        dateStr: formatDateStr(nextYear, nextMonth, day)
      });
    }
    
    return grid;
  }
  
  function formatDateStr(year: number, month: number, day: number): string {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  }
  
  function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }
  
  function getTodayString(): string {
    const today = new Date();
    return formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  }
  
  function getEventColor(type: EventType): string {
    switch (type) {
      case EventType.EVENT:
        return 'bg-blue-500';
      case EventType.BIRTHDAY:
        return 'bg-pink-500';
      case EventType.MEETING:
        return 'bg-green-500';
      case EventType.WEDDING:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  }
  
  function getEventIcon(type: EventType): string {
    switch (type) {
      case EventType.EVENT:
        return '📅';
      case EventType.BIRTHDAY:
        return '🎂';
      case EventType.MEETING:
        return '👥';
      case EventType.WEDDING:
        return '💒';
      default:
        return '📌';
    }
  }
  
  function handleDateClick(dateStr: string, month: 'prev' | 'current' | 'next') {
    // Only allow adding events to current month dates
    if (month === 'current') {
      dispatch('addEvent', { date: dateStr });
    }
  }
  
  function handleEventClick(event: Event, eventId: string) {
    event.stopPropagation();
    dispatch('editEvent', { eventId });
  }
  
  function handleEventDelete(event: Event, eventId: string) {
    event.stopPropagation();
    dispatch('deleteEvent', { eventId });
  }
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<div class="calendar-grid-container">
  <!-- Week day headers -->
  <div class="calendar-header-row">
    {#each weekDays as day}
      <div class="calendar-header-cell">{day}</div>
    {/each}
  </div>
  
  <!-- Calendar grid -->
  <div class="calendar-grid">
    {#each calendarGrid as cell}
      <div
        class="calendar-cell"
        class:other-month={cell.month !== 'current'}
        class:today={cell.dateStr === todayStr && cell.month === 'current'}
        on:click={() => handleDateClick(cell.dateStr, cell.month)}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && handleDateClick(cell.dateStr, cell.month)}
      >
        <div class="cell-date">{cell.date}</div>
        
        {#if eventsByDate[cell.dateStr]}
          <div class="cell-events">
            {#each eventsByDate[cell.dateStr] as event}
              <div
                class="event-item {getEventColor(event.type)}"
                on:click={(e) => handleEventClick(e, event.id)}
                on:keydown={(e) => e.key === 'Enter' && handleEventClick(e, event.id)}
                role="button"
                tabindex="0"
                title={event.name}
              >
                <span class="event-icon">{getEventIcon(event.type)}</span>
                <span class="event-name">{event.name}</span>
                <button
                  class="event-delete"
                  on:click={(e) => handleEventDelete(e, event.id)}
                  aria-label="Delete event"
                  title="Delete event"
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .calendar-grid-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .calendar-header-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  .calendar-header-cell {
    text-align: center;
    font-weight: 600;
    font-size: 0.875rem;
    color: #6b7280;
    padding: 0.5rem;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    min-height: 500px;
  }
  
  .calendar-cell {
    min-height: 80px;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: relative;
  }
  
  .calendar-cell:hover {
    background: rgba(243, 244, 246, 1);
    border-color: #6366f1;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .calendar-cell.other-month {
    opacity: 0.4;
    background: rgba(249, 250, 251, 0.5);
  }
  
  .calendar-cell.today {
    background: rgba(99, 102, 241, 0.1);
    border-color: #6366f1;
    border-width: 2px;
  }
  
  .cell-date {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
    text-align: right;
  }
  
  .cell-events {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow-y: auto;
    max-height: 60px;
  }
  
  .event-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  
  .event-item:hover {
    opacity: 0.9;
    transform: translateX(2px);
  }
  
  .event-icon {
    font-size: 0.875rem;
    flex-shrink: 0;
  }
  
  .event-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }
  
  .event-delete {
    display: none;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.2);
    border: none;
    color: white;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  
  .event-item:hover .event-delete {
    display: flex;
  }
  
  .event-delete:hover {
    background: rgba(0, 0, 0, 0.4);
  }
  
  /* Dark mode styles */
  :global(.dark) .calendar-header-cell {
    color: #9ca3af;
  }
  
  :global(.dark) .calendar-cell {
    background: rgba(31, 41, 55, 0.8);
    border-color: rgba(75, 85, 99, 0.8);
  }
  
  :global(.dark) .calendar-cell:hover {
    background: rgba(55, 65, 81, 1);
    border-color: #fbbf24;
  }
  
  :global(.dark) .calendar-cell.other-month {
    background: rgba(17, 24, 39, 0.5);
  }
  
  :global(.dark) .calendar-cell.today {
    background: rgba(251, 191, 36, 0.1);
    border-color: #fbbf24;
  }
  
  :global(.dark) .cell-date {
    color: #f3f4f6;
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .calendar-grid {
      min-height: 400px;
      gap: 0.125rem;
    }
    
    .calendar-cell {
      min-height: 60px;
      padding: 0.25rem;
    }
    
    .cell-date {
      font-size: 0.75rem;
    }
    
    .event-item {
      font-size: 0.625rem;
      padding: 0.125rem 0.25rem;
    }
    
    .event-icon {
      font-size: 0.75rem;
    }
    
    .cell-events {
      max-height: 40px;
    }
    
    .calendar-header-cell {
      font-size: 0.75rem;
      padding: 0.25rem;
    }
  }
  
  /* Tablet responsive */
  @media (min-width: 769px) and (max-width: 1024px) {
    .calendar-cell {
      min-height: 70px;
    }
    
    .cell-events {
      max-height: 50px;
    }
  }
</style>
