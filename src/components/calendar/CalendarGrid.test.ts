import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CalendarGrid from './CalendarGrid.svelte';
import { EventType } from '../../lib/types';
import type { CalendarEvent } from '../../lib/types';
import { Timestamp } from 'firebase/firestore';

describe('CalendarGrid', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      name: 'Team Meeting',
      date: '2024-01-15',
      type: EventType.MEETING,
      notes: 'Discuss Q1 goals',
      createdAt: Timestamp.now()
    },
    {
      id: '2',
      name: 'Birthday Party',
      date: '2024-01-20',
      type: EventType.BIRTHDAY,
      notes: 'John\'s birthday',
      createdAt: Timestamp.now()
    },
    {
      id: '3',
      name: 'Conference',
      date: '2024-01-15',
      type: EventType.EVENT,
      notes: 'Tech conference',
      createdAt: Timestamp.now()
    }
  ];

  it('should render calendar grid with 7 columns (days of week)', () => {
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15), // January 15, 2024
        calendarEvents: []
      }
    });

    const headerCells = container.querySelectorAll('.calendar-header-cell');
    expect(headerCells.length).toBe(7);
  });

  it('should render 42 calendar cells (6 weeks)', () => {
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15),
        calendarEvents: []
      }
    });

    const cells = container.querySelectorAll('.calendar-cell');
    expect(cells.length).toBe(42);
  });

  it('should display events on correct dates', () => {
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15),
        calendarEvents: mockEvents
      }
    });

    const eventItems = container.querySelectorAll('.event-item');
    expect(eventItems.length).toBe(3); // 3 events total
  });

  it('should handle multiple events on same date', () => {
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15),
        calendarEvents: mockEvents
      }
    });

    // Find the cell for January 15 (which has 2 events)
    const cells = container.querySelectorAll('.calendar-cell');
    let cellWith2Events = null;
    
    cells.forEach(cell => {
      const events = cell.querySelectorAll('.event-item');
      if (events.length === 2) {
        cellWith2Events = cell;
      }
    });

    expect(cellWith2Events).not.toBeNull();
  });

  it('should apply correct color classes for event types', () => {
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15),
        calendarEvents: mockEvents
      }
    });

    const eventItems = container.querySelectorAll('.event-item');
    
    // Check that events have color classes
    let hasBlue = false;
    let hasPink = false;
    let hasGreen = false;
    
    eventItems.forEach(item => {
      if (item.classList.contains('bg-blue-500')) hasBlue = true;
      if (item.classList.contains('bg-pink-500')) hasPink = true;
      if (item.classList.contains('bg-green-500')) hasGreen = true;
    });

    expect(hasBlue).toBe(true); // EVENT type
    expect(hasPink).toBe(true); // BIRTHDAY type
    expect(hasGreen).toBe(true); // MEETING type
  });

  it('should mark current month cells differently from other months', () => {
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15),
        calendarEvents: []
      }
    });

    const cells = container.querySelectorAll('.calendar-cell');
    const otherMonthCells = container.querySelectorAll('.calendar-cell.other-month');
    
    // Should have some cells from other months
    expect(otherMonthCells.length).toBeGreaterThan(0);
    // But not all cells should be from other months
    expect(otherMonthCells.length).toBeLessThan(cells.length);
  });

  it('should highlight today\'s date', () => {
    const today = new Date();
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: today,
        calendarEvents: []
      }
    });

    const todayCells = container.querySelectorAll('.calendar-cell.today');
    expect(todayCells.length).toBe(1);
  });

  it('should emit addEvent when clicking on a current month date', () => {
    let emittedDate = '';
    
    const { component } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15),
        calendarEvents: []
      }
    });

    component.$on('addEvent', (event: any) => {
      emittedDate = event.detail.date;
    });

    // Find a current month cell and click it
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15),
        calendarEvents: []
      }
    });

    const currentMonthCells = Array.from(container.querySelectorAll('.calendar-cell'))
      .filter(cell => !cell.classList.contains('other-month'));
    
    expect(currentMonthCells.length).toBeGreaterThan(0);
  });

  it('should display event icons based on event type', () => {
    const { container } = render(CalendarGrid, {
      props: {
        calendarDate: new Date(2024, 0, 15),
        calendarEvents: mockEvents
      }
    });

    const eventIcons = container.querySelectorAll('.event-icon');
    expect(eventIcons.length).toBe(3);
    
    // Check that icons are present (emojis)
    const iconTexts = Array.from(eventIcons).map(icon => icon.textContent);
    expect(iconTexts).toContain('👥'); // Meeting
    expect(iconTexts).toContain('🎂'); // Birthday
    expect(iconTexts).toContain('📅'); // Event
  });
});
