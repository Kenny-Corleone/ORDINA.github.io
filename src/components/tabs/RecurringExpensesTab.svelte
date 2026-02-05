<script lang="ts">
  import { financeStore } from "../../lib/stores/financeStore";
  import { uiStore } from "../../lib/stores/uiStore";
  import { userStore } from "../../lib/stores/userStore";
  import { translations } from "../../lib/i18n";
  import { deleteRecurringExpense } from "../../lib/services/firebase/recurring";
  import { addExpense } from "../../lib/services/firebase/expenses";
  import { db } from "../../lib/firebase";
  import { doc, setDoc } from "firebase/firestore";
  // MonthSelector удален - теперь в Header
  import CurrencyToggle from "../ui/CurrencyToggle.svelte";
  import RecurringExpensesTable from "../recurring/RecurringExpensesTable.svelte";
  import EmptyState from "../ui/EmptyState.svelte";

  // Subscribe to stores
  $: recurringTemplates = $financeStore.recurringTemplates;
  $: recurringStatuses = $financeStore.recurringStatuses;
  $: selectedMonthId = $financeStore.selectedMonthId;
  $: currency = $financeStore.currency;
  $: exchangeRate = $financeStore.exchangeRate;
  $: userId = $userStore.userId;
  $: currentTranslations = $translations;

  // Get current day of month for overdue highlighting
  $: currentDay = new Date().getDate();

  // Handle add recurring expense
  function handleAddRecurring() {
    uiStore.openModal("recurring");
  }

  // Handle edit recurring expense
  function handleEditRecurring(templateId: string) {
    uiStore.openModal("recurring", { editId: templateId });
  }

  // Handle delete recurring expense
  async function handleDeleteRecurring(templateId: string) {
    if (!userId) return;

    const confirmed = confirm(
      currentTranslations["confirm_delete_recurring"] ||
        "Are you sure you want to delete this recurring expense template?",
    );
    if (!confirmed) return;

    try {
      await deleteRecurringExpense(userId, templateId);
    } catch (error) {
      console.error("Error deleting recurring expense:", error);
      alert(
        currentTranslations["error_delete_recurring"] ||
          "Failed to delete recurring expense. Please try again.",
      );
    }
  }

  // Handle status change
  async function handleStatusChange(
    event: CustomEvent<{ templateId: string; status: string }>,
  ) {
    if (!userId) return;

    const { templateId, status } = event.detail;
    const previousStatus = recurringStatuses[templateId] || "pending";

    try {
      // Update status in Firestore using setDoc to create if doesn't exist
      const statusRef = doc(
        db,
        "users",
        userId,
        "monthlyData",
        selectedMonthId,
        "recurringExpenseStatuses",
        templateId,
      );
      await setDoc(statusRef, { status }, { merge: true });

      // If status changed to 'paid', create an expense record
      if (status === "paid" && previousStatus !== "paid") {
        const template = recurringTemplates.find((t) => t.id === templateId);
        if (template) {
          // Get today's date in YYYY-MM-DD format
          const today = new Date();
          const dateStr = today.toISOString().split("T")[0];

          // Create expense record
          await addExpense(userId, selectedMonthId, {
            name: template.name,
            category: "Recurring Expense",
            amount: template.amount,
            date: dateStr,
            recurringExpenseId: templateId,
          });
        }
      }

      // Update local store
      financeStore.updateRecurringStatus(templateId, status);
    } catch (error) {
      console.error("Error updating recurring expense status:", error);
      alert(
        currentTranslations["error_update_status"] ||
          "Failed to update status. Please try again.",
      );
    }
  }
</script>

<div class="recurring-tab">
  <!-- Header with controls -->
  <div class="recurring-header">
    <div class="header-left">
      <h2 class="tab-title">
        {currentTranslations["recurring_expenses"] || "Recurring Expenses"}
      </h2>
      <!-- MonthSelector удален - теперь в Header -->
    </div>

    <div class="header-right">
      <CurrencyToggle />
      <button
        class="btn-add"
        on:click={handleAddRecurring}
        aria-label={currentTranslations["add_recurring"] ||
          "Add Recurring Expense"}
      >
        <svg
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {currentTranslations["add_recurring"] || "Add Recurring"}
      </button>
    </div>
  </div>

  <!-- Info message -->
  <div class="info-message">
    <svg
      class="info-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
    <p>
      {currentTranslations["recurring_info"] ||
        "Track monthly recurring expenses. Mark as paid to automatically create an expense record. Overdue expenses (past due day and not paid) are highlighted."}
    </p>
  </div>

  <!-- Content area -->
  <div class="recurring-content">
    {#if recurringTemplates.length === 0}
      <EmptyState
        icon="🔄"
        message={currentTranslations["no_recurring"] ||
          "No recurring expenses yet"}
        description={currentTranslations["no_recurring_desc"] ||
          "Add recurring expense templates to track monthly bills and subscriptions"}
      />
    {:else}
      <RecurringExpensesTable
        {recurringTemplates}
        {recurringStatuses}
        {currency}
        {exchangeRate}
        {currentDay}
        on:statusChange={handleStatusChange}
        on:edit={(e) => handleEditRecurring(e.detail)}
        on:delete={(e) => handleDeleteRecurring(e.detail)}
      />
    {/if}
  </div>
</div>

<style>
  .recurring-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0.75rem 1rem; /* УМЕНЬШЕНО: было 1.5rem */
    gap: 1rem; /* УМЕНЬШЕНО: было 1.5rem */
  }

  .recurring-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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

  .btn-add {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-add:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a4291 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }

  .btn-add:active {
    transform: translateY(0);
  }

  .icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .info-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 0.75rem;
    backdrop-filter: blur(10px);
  }

  .info-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #3b82f6;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .info-message p {
    margin: 0;
    font-size: 0.875rem;
    color: #1f2937;
    line-height: 1.5;
  }

  .recurring-content {
    flex: 1;
    overflow: auto;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }

  /* Dark mode styles */
  :global(.dark) .tab-title {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global(.dark) .btn-add {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1f2937;
  }

  :global(.dark) .btn-add:hover {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
  }

  :global(.dark) .info-message {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }

  :global(.dark) .info-icon {
    color: #60a5fa;
  }

  :global(.dark) .info-message p {
    color: #f3f4f6;
  }

  :global(.dark) .recurring-content {
    background: rgba(31, 41, 55, 0.6);
    border-color: rgba(75, 85, 99, 0.8);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .recurring-tab {
      padding: 1rem;
    }

    .recurring-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-left,
    .header-right {
      width: 100%;
      justify-content: space-between;
    }

    .tab-title {
      font-size: 1.5rem;
    }

    .btn-add {
      flex: 1;
      justify-content: center;
    }

    .info-message {
      padding: 0.75rem;
    }

    .info-message p {
      font-size: 0.8125rem;
    }
  }
</style>
