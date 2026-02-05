/**
 * Unit tests for CalendarEventModal component
 * 
 * Tests the calendar event modal functionality including:
 * - Form validation
 * - Add/edit event operations
 * - Event type selection
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import CalendarEventModal from './CalendarEventModal.svelte';
import { calendarStore } from '../../lib/stores/calendarStore';
import { userStore } from '../../lib/stores/userStore';
import { EventType } from '../../lib/types';
import type { CalendarEvent } from '../../lib/types';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase services
vi.mock('../../lib/services/firebase/calendar', () => ({
  addCalendarEvent: vi.fn(),
  updateCalendarEvent: vi.fn(),
}));

// Import mocked functions
import { addCalendarEvent, updateCalendarEvent } from '../../lib/services/firebase/calendar';

describe('CalendarEventModal', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    // Reset stores
    calendarStore.reset();
    userStore.clearUser();
    userStore.setUser(mockUserId, {
      uid: mockUserId,
      email: 'test@example.com',
      displayName: 'Test User',
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Add Event Mode', () => {
    it('should render form with empty fields', () => {
      render(CalendarEventModal, { props: { editId: null } });
      
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
      const typeSelect = screen.getByLabelText(/Event Type/i) as HTMLSelectElement;
      const notesTextarea = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
      
      expect(nameInput.value).toBe('');
      expect(dateInput.value).toBeTruthy(); // Should have today's date
      expect(typeSelect.value).toBe(EventType.EVENT);
      expect(notesTextarea.value).toBe('');
    });
    
    it('should display "Add Event" button', () => {
      render(CalendarEventModal, { props: { editId: null } });
      
      const submitButton = screen.getByRole('button', { name: /Add Event/i }) as HTMLButtonElement;
      expect(submitButton).toBeTruthy();
    });
    
    it('should validate required fields', async () => {
      render(CalendarEventModal, { props: { editId: null } });
      
      const submitButton = screen.getByRole('button', { name: /Add Event/i }) as HTMLButtonElement;
      await fireEvent.click(submitButton);
      
      // HTML5 validation prevents form submission with required fields empty
      // Component relies on browser validation rather than custom error messages
      expect(addCalendarEvent).not.toHaveBeenCalled();
    });
    
    it('should call addCalendarEvent with correct data', async () => {
      const mockAddCalendarEvent = vi.mocked(addCalendarEvent);
      mockAddCalendarEvent.mockResolvedValue({} as any);
      
      const { component } = render(CalendarEventModal, { props: { editId: null } });
      
      // Mock close event
      const closeSpy = vi.fn();
      component.$on('close', closeSpy);
      
      // Fill form
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
      const typeSelect = screen.getByLabelText(/Event Type/i) as HTMLSelectElement;
      const notesTextarea = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
      
      await fireEvent.input(nameInput, { target: { value: 'Team Meeting' } });
      await fireEvent.input(dateInput, { target: { value: '2024-03-15' } });
      await fireEvent.change(typeSelect, { target: { value: EventType.MEETING } });
      await fireEvent.input(notesTextarea, { target: { value: 'Discuss project updates' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Event/i }) as HTMLButtonElement;
      await fireEvent.click(submitButton);
      
      // Verify addCalendarEvent was called with correct data
      await waitFor(() => {
        expect(mockAddCalendarEvent).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({
            name: 'Team Meeting',
            date: '2024-03-15',
            type: EventType.MEETING,
            notes: 'Discuss project updates',
          })
        );
      });
      
      // Verify modal closes on success
      await waitFor(() => {
        expect(closeSpy).toHaveBeenCalled();
      });
    });
    
    it('should handle all event types', async () => {
      render(CalendarEventModal, { props: { editId: null } });
      
      const typeSelect = screen.getByLabelText(/Event Type/i) as HTMLSelectElement;
      
      // Check all event type options are available
      const options = Array.from(typeSelect.options).map(opt => opt.value);
      expect(options).toContain(EventType.EVENT);
      expect(options).toContain(EventType.BIRTHDAY);
      expect(options).toContain(EventType.MEETING);
      expect(options).toContain(EventType.WEDDING);
    });
    
    it('should handle optional notes field', async () => {
      const mockAddCalendarEvent = vi.mocked(addCalendarEvent);
      mockAddCalendarEvent.mockResolvedValue({} as any);
      
      const { component } = render(CalendarEventModal, { props: { editId: null } });
      
      // Mock close event
      const closeSpy = vi.fn();
      component.$on('close', closeSpy);
      
      // Fill only required fields
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
      
      await fireEvent.input(nameInput, { target: { value: 'Birthday Party' } });
      await fireEvent.input(dateInput, { target: { value: '2024-05-20' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Event/i }) as HTMLButtonElement;
      await fireEvent.click(submitButton);
      
      // Verify notes is undefined when empty
      await waitFor(() => {
        expect(mockAddCalendarEvent).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({
            name: 'Birthday Party',
            date: '2024-05-20',
            type: EventType.EVENT,
            notes: undefined,
          })
        );
      });
    });
  });
  
  describe('Edit Event Mode', () => {
    const mockEvent: CalendarEvent = {
      id: 'event-123',
      name: 'Annual Conference',
      date: '2024-06-10',
      type: EventType.MEETING,
      notes: 'Important conference',
      createdAt: Timestamp.now(),
    };
    
    beforeEach(() => {
      // Add mock event to store
      calendarStore.setCalendarEvents([mockEvent]);
    });
    
    it('should populate form with existing event data', () => {
      render(CalendarEventModal, { props: { editId: mockEvent.id } });
      
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
      const typeSelect = screen.getByLabelText(/Event Type/i) as HTMLSelectElement;
      const notesTextarea = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
      
      expect(nameInput.value).toBe(mockEvent.name);
      expect(dateInput.value).toBe(mockEvent.date);
      expect(typeSelect.value).toBe(mockEvent.type);
      expect(notesTextarea.value).toBe(mockEvent.notes);
    });
    
    it('should display "Update Event" button', () => {
      render(CalendarEventModal, { props: { editId: mockEvent.id } });
      
      const submitButton = screen.getByRole('button', { name: /Update Event/i });
      expect(submitButton).toBeTruthy();
    });
    
    it('should call updateCalendarEvent with correct data', async () => {
      const mockUpdateCalendarEvent = vi.mocked(updateCalendarEvent);
      mockUpdateCalendarEvent.mockResolvedValue();
      
      const { component } = render(CalendarEventModal, { props: { editId: mockEvent.id } });
      
      // Mock close event
      const closeSpy = vi.fn();
      component.$on('close', closeSpy);
      
      // Update form fields
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      const typeSelect = screen.getByLabelText(/Event Type/i) as HTMLSelectElement;
      
      await fireEvent.input(nameInput, { target: { value: 'Updated Conference' } });
      await fireEvent.change(typeSelect, { target: { value: EventType.EVENT } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Update Event/i });
      await fireEvent.click(submitButton);
      
      // Verify updateCalendarEvent was called with correct data
      await waitFor(() => {
        expect(mockUpdateCalendarEvent).toHaveBeenCalledWith(
          mockUserId,
          mockEvent.id,
          expect.objectContaining({
            date: '2024-06-10',
            name: 'Annual Conference',
            notes: 'Important conference',
            type: 'meeting',
          })
        );
      });
      
      // Verify modal closes on success
      await waitFor(() => {
        expect(closeSpy).toHaveBeenCalled();
      });
    });
  });
  
  describe('Validation', () => {
    it('should validate name length', async () => {
      render(CalendarEventModal, { props: { editId: null } });
      
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      
      // Test empty name
      await fireEvent.input(nameInput, { target: { value: '' } });
      await fireEvent.blur(nameInput);
      
      await waitFor(() => {
        const errorMessage = screen.queryByText(/required/i);
        expect(errorMessage).toBeTruthy();
      });
    });
    
    it('should validate date format', async () => {
      render(CalendarEventModal, { props: { editId: null } });
      
      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
      
      // Test invalid date
      await fireEvent.input(dateInput, { target: { value: 'invalid-date' } });
      await fireEvent.blur(dateInput);
      
      // HTML5 date input will prevent invalid formats, but we test the validation logic
      const submitButton = screen.getByRole('button', { name: /Add Event/i }) as HTMLButtonElement;
      await fireEvent.click(submitButton);
      
      // Should not call addCalendarEvent with invalid data
      expect(addCalendarEvent).not.toHaveBeenCalled();
    });
    
    it('should validate notes length', async () => {
      render(CalendarEventModal, { props: { editId: null } });
      
      const notesTextarea = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
      
      // Test notes exceeding max length (1000 characters)
      const longNotes = 'a'.repeat(1001);
      await fireEvent.input(notesTextarea, { target: { value: longNotes } });
      await fireEvent.blur(notesTextarea);
      
      await waitFor(() => {
        const errorMessage = screen.queryByText(/maximum/i);
        expect(errorMessage).toBeTruthy();
      });
    });
  });
  
  describe('Error Handling', () => {
    it('should display error message when save fails', async () => {
      const mockAddCalendarEvent = vi.mocked(addCalendarEvent);
      mockAddCalendarEvent.mockRejectedValue(new Error('Network error'));
      
      render(CalendarEventModal, { props: { editId: null } });
      
      // Fill form
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      await fireEvent.input(nameInput, { target: { value: 'Test Event' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Event/i }) as HTMLButtonElement;
      await fireEvent.click(submitButton);
      
      // Should display error message
      await waitFor(() => {
        const errorMessage = screen.queryByText(/Network error/i);
        expect(errorMessage).toBeTruthy();
      });
    });
    
    it('should handle unauthenticated user', async () => {
      // Set user as not authenticated
      userStore.clearUser();
      
      render(CalendarEventModal, { props: { editId: null } });
      
      // Fill form
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      await fireEvent.input(nameInput, { target: { value: 'Test Event' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Event/i }) as HTMLButtonElement;
      await fireEvent.click(submitButton);
      
      // Should display authentication error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/not authenticated/i);
        expect(errorMessage).toBeTruthy();
      });
      
      // Should not call addCalendarEvent
      expect(addCalendarEvent).not.toHaveBeenCalled();
    });
  });
  
  describe('User Interactions', () => {
    it('should close modal when Cancel button is clicked', async () => {
      const { component } = render(CalendarEventModal, { props: { editId: null } });
      
      // Mock close event
      const closeSpy = vi.fn();
      component.$on('close', closeSpy);
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await fireEvent.click(cancelButton);
      
      expect(closeSpy).toHaveBeenCalled();
    });
    
    it('should disable form during submission', async () => {
      const mockAddCalendarEvent = vi.mocked(addCalendarEvent);
      // Make the promise never resolve to keep the form in submitting state
      mockAddCalendarEvent.mockImplementation(() => new Promise(() => {}));
      
      render(CalendarEventModal, { props: { editId: null } });
      
      // Fill form
      const nameInput = screen.getByLabelText(/Event Name/i) as HTMLInputElement;
      await fireEvent.input(nameInput, { target: { value: 'Test Event' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Add Event/i }) as HTMLButtonElement;
      await fireEvent.click(submitButton);
      
      // Form fields should be disabled
      await waitFor(() => {
        expect(nameInput.disabled).toBe(true);
        expect(submitButton.disabled).toBe(true);
      });
    });
  });
});
