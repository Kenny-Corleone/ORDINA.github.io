<script lang="ts">
  import { uiStore } from '../../lib/stores/uiStore';
  import { translations, t } from '../../lib/i18n';

  // Import modal components
  import ModalBase from './ModalBase.svelte';
  import ExpenseModal from './ExpenseModal.svelte';
  import DebtModal from './DebtModal.svelte';
  import DebtPaymentModal from './DebtPaymentModal.svelte';
  import RecurringExpenseModal from './RecurringExpenseModal.svelte';
  import CategoryModal from './CategoryModal.svelte';
  import DailyTaskModal from './DailyTaskModal.svelte';
  import MonthlyTaskModal from './MonthlyTaskModal.svelte';
  import YearlyTaskModal from './YearlyTaskModal.svelte';
  import CalendarEventModal from './CalendarEventModal.svelte';
  import CalculatorModal from './CalculatorModal.svelte';
  import ShoppingListModal from './ShoppingListModal.svelte';
  import SettingsModal from './SettingsModal.svelte';
  import ProfileModal from './ProfileModal.svelte';
  
  // Get active modal from store
  $: activeModal = $uiStore.activeModal;
  $: modalData = $uiStore.modalData;
  
  // Close modal handler
  function closeModal() {
    uiStore.closeModal();
  }
  
  // Modal configurations
  const modalConfigs = {
    expense: { id: 'expense-modal', title: 'Add/Edit Expense' },
    debt: { id: 'debt-modal', title: 'Add/Edit Debt' },
    debtPayment: { id: 'debt-payment-modal', title: 'Add Debt Payment' },
    recurring: { id: 'recurring-modal', title: 'Add/Edit Recurring Expense' },
    dailyTask: { id: 'daily-task-modal', title: 'Add/Edit Daily Task' },
    monthlyTask: { id: 'monthly-task-modal', title: 'Add/Edit Monthly Task' },
    yearlyTask: { id: 'yearly-task-modal', title: 'Add/Edit Yearly Task' },
    calendarEvent: { id: 'calendar-event-modal', title: 'Add/Edit Calendar Event' },
    category: { id: 'category-modal', title: 'Manage Categories' },
    calculator: { id: 'calculator-modal', title: 'Calculator' },
    shoppingList: { id: 'shopping-list-modal', title: 'Shopping List' },
    settings: { id: 'settings-modal', title: 'Settings' },
    profile: { id: 'profile-modal', title: 'Profile' },
  };
</script>

<!-- Modal System Container -->
<div class="modal-system">
  <!-- Expense Modal -->
  {#if activeModal === 'expense'}
    <ModalBase
      isOpen={true}
      title={modalData?.editId ? t($translations, 'editExpense', 'Edit Expense') : t($translations, 'addExpense', 'Add Expense')}
      modalId={modalConfigs.expense.id}
      on:close={closeModal}
    >
      <ExpenseModal editId={modalData?.editId || null} on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Debt Modal -->
  {#if activeModal === 'debt'}
    <ModalBase
      isOpen={true}
      title={modalData?.editId ? 'Edit Debt' : 'Add Debt'}
      modalId={modalConfigs.debt.id}
      on:close={closeModal}
    >
      <DebtModal editId={modalData?.editId || null} on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Debt Payment Modal -->
  {#if activeModal === 'debtPayment'}
    <ModalBase
      isOpen={true}
      title="Add Debt Payment"
      modalId={modalConfigs.debtPayment.id}
      on:close={closeModal}
    >
      <DebtPaymentModal debtId={modalData?.debtId || ''} on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Recurring Expense Modal -->
  {#if activeModal === 'recurring'}
    <ModalBase
      isOpen={true}
      title={modalData?.editId ? t($translations, 'editTemplate', 'Edit Recurring Expense') : t($translations, 'addTemplate', 'Add Recurring Expense')}
      modalId={modalConfigs.recurring.id}
      on:close={closeModal}
    >
      <RecurringExpenseModal editId={modalData?.editId || null} on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Daily Task Modal -->
  {#if activeModal === 'dailyTask'}
    <ModalBase
      isOpen={true}
      title={modalData?.editId ? 'Edit Daily Task' : 'Add Daily Task'}
      modalId={modalConfigs.dailyTask.id}
      on:close={closeModal}
    >
      <DailyTaskModal editId={modalData?.editId || null} on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Monthly Task Modal -->
  {#if activeModal === 'monthlyTask'}
    <ModalBase
      isOpen={true}
      title={modalData?.editId ? 'Edit Monthly Task' : 'Add Monthly Task'}
      modalId={modalConfigs.monthlyTask.id}
      on:close={closeModal}
    >
      <MonthlyTaskModal editId={modalData?.editId || null} on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Yearly Task Modal -->
  {#if activeModal === 'yearlyTask'}
    <ModalBase
      isOpen={true}
      title={modalData?.editId ? 'Edit Yearly Task' : 'Add Yearly Task'}
      modalId={modalConfigs.yearlyTask.id}
      on:close={closeModal}
    >
      <YearlyTaskModal editId={modalData?.editId || null} on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Calendar Event Modal -->
  {#if activeModal === 'calendarEvent' || activeModal === 'calendar-event'}
    <ModalBase
      isOpen={true}
      title={modalData?.editId ? 'Edit Calendar Event' : 'Add Calendar Event'}
      modalId={modalConfigs.calendarEvent.id}
      on:close={closeModal}
    >
      <CalendarEventModal editId={modalData?.editId || null} on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Category Modal -->
  {#if activeModal === 'category'}
    <ModalBase
      isOpen={true}
      title="Manage Categories"
      modalId={modalConfigs.category.id}
      on:close={closeModal}
    >
      <CategoryModal on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Calculator Modal -->
  {#if activeModal === 'calculator'}
    <ModalBase
      isOpen={true}
      title={modalConfigs.calculator.title}
      modalId={modalConfigs.calculator.id}
      on:close={closeModal}
    >
      <CalculatorModal on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Shopping List Modal -->
  {#if activeModal === 'shoppingList'}
    <ModalBase
      isOpen={true}
      title={modalConfigs.shoppingList.title}
      modalId={modalConfigs.shoppingList.id}
      on:close={closeModal}
    >
      <ShoppingListModal on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Settings Modal -->
  {#if activeModal === 'settings'}
    <ModalBase
      isOpen={true}
      title={modalConfigs.settings.title}
      modalId={modalConfigs.settings.id}
      on:close={closeModal}
    >
      <SettingsModal on:close={closeModal} />
    </ModalBase>
  {/if}
  
  <!-- Profile Modal -->
  {#if activeModal === 'profile'}
    <ModalBase
      isOpen={true}
      title={modalConfigs.profile.title}
      modalId={modalConfigs.profile.id}
      on:close={closeModal}
    >
      <ProfileModal on:close={closeModal} />
    </ModalBase>
  {/if}
</div>

<style>
  .modal-system {
    /* Container for all modals */
    position: relative;
    z-index: 100;
  }
</style>
