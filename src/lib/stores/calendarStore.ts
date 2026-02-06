import { writable, derived } from 'svelte/store';
import type { CalendarEvent } from '../types';

interface CalendarStore {
  calendarDate: Date;
  calendarEvents: CalendarEvent[];
}

const initialState: CalendarStore = {
  calendarDate: new Date(),
  calendarEvents: [],
};

function createCalendarStore() {
  const { subscribe, set, update } = writable<CalendarStore>(initialState);

  return {
    subscribe,
    
    // Calendar date management
    setCalendarDate: (date: Date) => {
      update(state => ({ ...state, calendarDate: date }));
    },
    navigateMonth: (direction: number) => {
      update(state => {
        const newDate = new Date(state.calendarDate);
        newDate.setMonth(newDate.getMonth() + direction);
        return { ...state, calendarDate: newDate };
      });
    },
    
    // Calendar events management
    setCalendarEvents: (events: CalendarEvent[]) => {
      update(state => ({ ...state, calendarEvents: events }));
    },
    addCalendarEvent: (event: CalendarEvent) => {
      update(state => ({ ...state, calendarEvents: [...state.calendarEvents, event] }));
    },
    updateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) => {
      update(state => ({
        ...state,
        calendarEvents: state.calendarEvents.map(e => 
          e.id === eventId ? { ...e, ...updates } : e
        ),
      }));
    },
    removeCalendarEvent: (eventId: string) => {
      update(state => ({
        ...state,
        calendarEvents: state.calendarEvents.filter(e => e.id !== eventId),
      }));
    },
    
    // Reset all data
    reset: () => {
      set({ ...initialState, calendarDate: new Date() });
    },
  };
}

export const calendarStore = createCalendarStore();

// Derived stores for filtered events
export const eventsForCurrentMonth = derived(
  calendarStore,
  $calendar => {
    const year = $calendar.calendarDate.getFullYear();
    const month = String($calendar.calendarDate.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${year}-${month}`;
    
    return $calendar.calendarEvents.filter(event => 
      event.date && event.date.startsWith(monthPrefix)
    );
  }
);

export const eventsByDate = derived(
  calendarStore,
  $calendar => {
    const eventMap: Record<string, CalendarEvent[]> = {};
    
    $calendar.calendarEvents.forEach(event => {
      const date = event.date;
      if (date) {
        if (!eventMap[date]) {
          eventMap[date] = [];
        }
        eventMap[date].push(event);
      }
    });
    
    return eventMap;
  }
);

export const upcomingEvents = derived(
  calendarStore,
  $calendar => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    return $calendar.calendarEvents
      .filter(event => event.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5); // Next 5 upcoming events
  }
);
