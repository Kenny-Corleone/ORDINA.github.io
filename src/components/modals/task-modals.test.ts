import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import DailyTaskModal from './DailyTaskModal.svelte';
import MonthlyTaskModal from './MonthlyTaskModal.svelte';
import YearlyTaskModal from './YearlyTaskModal.svelte';
import { userStore } from '../../lib/stores/userStore';
import { tasksStore } from '../../lib/stores/tasksStore';
import { financeStore } from '../../lib/stores/financeStore';
import * as tasksService from '../../lib/services/firebase/tasks';

// Mock Firebase services
vi.mock('../../lib/services/firebase/tasks', () => ({
  addDailyTask: vi.fn(),
  updateDailyTask: vi.fn(),
  addMonthlyTask: vi.fn(),
  updateMonthlyTask: vi.fn(),
  addYearlyTask: vi.fn(),
  updateYearlyTask: vi.fn(),
}));

describe('DailyTaskModal', () => {
  beforeEach(() => {
    // Reset stores
    userStore.setUser('test-user', { uid: 'test-user', email: 'test@example.com' });
    tasksStore.reset();
    vi.clearAllMocks();
  });

  it('should render with default values for new task', () => {
    render(DailyTaskModal, { props: { editId: null } });

    expect(screen.getByLabelText(/Task Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Date/i)).toBeTruthy();
    expect(screen.getByLabelText(/Status/i)).toBeTruthy();
    expect(screen.getByLabelText(/Notes/i)).toBeTruthy();
    expect(screen.getByText('Add Task')).toBeTruthy();
  });

  it('should validate required fields', async () => {
    render(DailyTaskModal, { props: { editId: null } });

    const submitButton = screen.getByText('Add Task');
    await fireEvent.click(submitButton);

    // Should show validation error for empty name
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeTruthy();
    });
  });

  it('should call addDailyTask when submitting new task', async () => {
    const mockAddDailyTask = vi.mocked(tasksService.addDailyTask);
    mockAddDailyTask.mockResolvedValue({ id: 'new-task-id' } as any);

    const { component } = render(DailyTaskModal, { props: { editId: null } });

    const closeHandler = vi.fn();
    component.$on('close', closeHandler);

    // Fill in form
    const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
    await fireEvent.input(nameInput, { target: { value: 'Test Daily Task' } });

    const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
    await fireEvent.input(dateInput, { target: { value: '2024-01-15' } });

    // Submit form
    const submitButton = screen.getByText('Add Task');
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddDailyTask).toHaveBeenCalledWith(
        'test-user',
        expect.objectContaining({
          name: 'Test Daily Task',
          date: '2024-01-15',
        })
      );
      expect(closeHandler).toHaveBeenCalled();
    });
  });

  it('should populate form when editing existing task', async () => {
    // Add a task to the store
    tasksStore.addDailyTask({
      id: 'task-1',
      name: 'Existing Task',
      date: '2024-01-10',
      status: 'Не выполнено' as any,
      notes: 'Test notes',
      createdAt: {} as any,
    });

    render(DailyTaskModal, { props: { editId: 'task-1' } });

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Existing Task');

      const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
      expect(dateInput.value).toBe('2024-01-10');

      const notesInput = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
      expect(notesInput.value).toBe('Test notes');

      expect(screen.getByText('Update Task')).toBeTruthy();
    });
  });

  it('should call updateDailyTask when editing task', async () => {
    const mockUpdateDailyTask = vi.mocked(tasksService.updateDailyTask);
    mockUpdateDailyTask.mockResolvedValue();

    // Add a task to the store
    tasksStore.addDailyTask({
      id: 'task-1',
      name: 'Existing Task',
      date: '2024-01-10',
      status: 'Не выполнено' as any,
      createdAt: {} as any,
    });

    const { component } = render(DailyTaskModal, { props: { editId: 'task-1' } });

    const closeHandler = vi.fn();
    component.$on('close', closeHandler);

    // Update name
    const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
    nameInput.value = 'Updated Task';
    await fireEvent.input(nameInput);
    await fireEvent.change(nameInput);
    expect(nameInput.value).toBe('Updated Task');

    // Submit form
    const submitButton = screen.getByText('Update Task');
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateDailyTask).toHaveBeenCalledWith(
        'test-user',
        'task-1',
        expect.objectContaining({ name: 'Updated Task' })
      );
      expect(closeHandler).toHaveBeenCalled();
    });
  });

  it('should dispatch close event when cancel is clicked', async () => {
    const { component } = render(DailyTaskModal, { props: { editId: null } });

    const closeHandler = vi.fn();
    component.$on('close', closeHandler);

    const cancelButton = screen.getByText('Cancel');
    await fireEvent.click(cancelButton);

    expect(closeHandler).toHaveBeenCalled();
  });
});

describe('MonthlyTaskModal', () => {
  beforeEach(() => {
    // Reset stores
    userStore.setUser('test-user', { uid: 'test-user', email: 'test@example.com' });
    tasksStore.reset();
    financeStore.setSelectedMonthId('2024-01');
    vi.clearAllMocks();
  });

  it('should render with default values for new task', () => {
    render(MonthlyTaskModal, { props: { editId: null } });

    expect(screen.getByLabelText(/Task Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Month/i)).toBeTruthy();
    expect(screen.getByLabelText(/Status/i)).toBeTruthy();
    expect(screen.getByLabelText(/Notes/i)).toBeTruthy();
    expect(screen.getByText('Add Task')).toBeTruthy();
  });

  it('should display selected month as read-only', () => {
    render(MonthlyTaskModal, { props: { editId: null } });

    const monthInput = screen.getByLabelText(/Month/i) as HTMLInputElement;
    expect(monthInput.value).toBe('2024-01');
    expect(monthInput.disabled).toBe(true);
  });

  it('should call addMonthlyTask when submitting new task', async () => {
    const mockAddMonthlyTask = vi.mocked(tasksService.addMonthlyTask);
    mockAddMonthlyTask.mockResolvedValue({ id: 'new-task-id' } as any);

    const { component } = render(MonthlyTaskModal, { props: { editId: null } });

    const closeHandler = vi.fn();
    component.$on('close', closeHandler);

    // Fill in form
    const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
    await fireEvent.input(nameInput, { target: { value: 'Test Monthly Task' } });

    // Submit form
    const submitButton = screen.getByText('Add Task');
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddMonthlyTask).toHaveBeenCalledWith(
        'test-user',
        '2024-01',
        expect.objectContaining({
          name: 'Test Monthly Task',
          month: '2024-01',
        })
      );
      expect(closeHandler).toHaveBeenCalled();
    });
  });

  it('should populate form when editing existing task', async () => {
    // Add a task to the store
    tasksStore.addMonthlyTask({
      id: 'task-1',
      name: 'Existing Monthly Task',
      month: '2024-01',
      status: 'Не выполнено' as any,
      notes: 'Monthly notes',
      createdAt: {} as any,
    });

    render(MonthlyTaskModal, { props: { editId: 'task-1' } });

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Existing Monthly Task');

      const notesInput = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
      expect(notesInput.value).toBe('Monthly notes');

      expect(screen.getByText('Update Task')).toBeTruthy();
    });
  });
});

describe('YearlyTaskModal', () => {
  beforeEach(() => {
    // Reset stores
    userStore.setUser('test-user', { uid: 'test-user', email: 'test@example.com' });
    tasksStore.reset();
    vi.clearAllMocks();
  });

  it('should render with default values for new task', () => {
    render(YearlyTaskModal, { props: { editId: null } });

    expect(screen.getByLabelText(/Task Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Year/i)).toBeTruthy();
    expect(screen.getByLabelText(/Status/i)).toBeTruthy();
    expect(screen.getByLabelText(/Notes/i)).toBeTruthy();
    expect(screen.getByText('Add Task')).toBeTruthy();
  });

  it('should default year to current year', () => {
    render(YearlyTaskModal, { props: { editId: null } });

    const yearInput = screen.getByLabelText(/Year/i) as HTMLInputElement;
    const currentYear = new Date().getFullYear();
    expect(yearInput.value).toBe(String(currentYear));
  });

  it('should validate year field', async () => {
    render(YearlyTaskModal, { props: { editId: null } });

    const yearInput = screen.getByLabelText(/Year/i) as HTMLInputElement;
    await fireEvent.input(yearInput, { target: { value: '1800' } });

    const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
    await fireEvent.input(nameInput, { target: { value: 'Test Task' } });

    const submitButton = screen.getByText('Add Task');
    await fireEvent.click(submitButton);

    // Should show validation error for invalid year
    await waitFor(() => {
      expect(screen.getByText(/must be at least 1900/i)).toBeTruthy();
    });
  });

  it('should call addYearlyTask when submitting new task', async () => {
    const mockAddYearlyTask = vi.mocked(tasksService.addYearlyTask);
    mockAddYearlyTask.mockResolvedValue({ id: 'new-task-id' } as any);

    const { component } = render(YearlyTaskModal, { props: { editId: null } });

    const closeHandler = vi.fn();
    component.$on('close', closeHandler);

    // Fill in form
    const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
    await fireEvent.input(nameInput, { target: { value: 'Test Yearly Task' } });

    const yearInput = screen.getByLabelText(/Year/i) as HTMLInputElement;
    await fireEvent.input(yearInput, { target: { value: '2024' } });

    // Submit form
    const submitButton = screen.getByText('Add Task');
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddYearlyTask).toHaveBeenCalledWith(
        'test-user',
        expect.objectContaining({
          name: 'Test Yearly Task',
          year: 2024,
        })
      );
      expect(closeHandler).toHaveBeenCalled();
    });
  });

  it('should populate form when editing existing task', async () => {
    // Add a task to the store
    tasksStore.addYearlyTask({
      id: 'task-1',
      name: 'Existing Yearly Task',
      year: 2024,
      status: 'Не выполнено' as any,
      notes: 'Yearly notes',
      createdAt: {} as any,
    });

    render(YearlyTaskModal, { props: { editId: 'task-1' } });

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Existing Yearly Task');

      const yearInput = screen.getByLabelText(/Year/i) as HTMLInputElement;
      expect(yearInput.value).toBe('2024');

      const notesInput = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
      expect(notesInput.value).toBe('Yearly notes');

      expect(screen.getByText('Update Task')).toBeTruthy();
    });
  });
});

describe('Task Modal Error Handling', () => {
  beforeEach(() => {
    userStore.setUser('test-user', { uid: 'test-user', email: 'test@example.com' });
    vi.clearAllMocks();
  });

  it('should display error when Firebase operation fails', async () => {
    const mockAddDailyTask = vi.mocked(tasksService.addDailyTask);
    mockAddDailyTask.mockRejectedValue(new Error('Firebase error'));

    render(DailyTaskModal, { props: { editId: null } });

    // Fill in form
    const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
    await fireEvent.input(nameInput, { target: { value: 'Test Task' } });

    // Submit form
    const submitButton = screen.getByText('Add Task');
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Firebase error/i)).toBeTruthy();
    });
  });

  it('should show error when user is not authenticated', async () => {
    userStore.clearUser();

    render(DailyTaskModal, { props: { editId: null } });

    // Fill in form
    const nameInput = screen.getByLabelText(/Task Name/i) as HTMLInputElement;
    await fireEvent.input(nameInput, { target: { value: 'Test Task' } });

    // Submit form
    const submitButton = screen.getByText('Add Task');
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/not authenticated/i)).toBeTruthy();
    });
  });
});
