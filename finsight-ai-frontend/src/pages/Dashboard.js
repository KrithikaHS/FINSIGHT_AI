import { useEffect, useState } from "react";
import { fetchExpenses } from "../api";
import AlertsPanel from "../components/AlertsPanel";
import BudgetPanel from "../components/BudgetPanel";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ForecastPanel from "../components/ForecastPanel";
import Heatmap from "../components/Heatmap";
import Navbar from "../components/Navbar";
import RecommendationBar from "../components/RecommendationBar";
import TrendsPanel from "../components/TrendsPanel";

import CategoryAnalytics from "../components/CategoryAnalytics";
import RecurringExpenseForm from "../components/RecurringExpenseForm";
import RecurringExpensesList from "../components/RecurringExpensesList";
import SpendTrends from "../components/SpendTrends";
import TopExpenses from "../components/TopExpenses";
export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({ from: null, to: null, category: "" });
  const [loading, setLoading] = useState(false);

  // Recurring expenses state
  const [recurringExpensesReloadKey, setRecurringExpensesReloadKey] = useState(0);

  // Track which tab is active: "expenses" or "recurring"
  const [activeTab, setActiveTab] = useState("expenses");

  // For editing recurring expense, store the ID or null
  const [editingRecurringId, setEditingRecurringId] = useState(null);

  async function loadExpenses() {
    setLoading(true);
    try {
      const data = await fetchExpenses(filters);
      setExpenses(data.results || data);
    } catch (e) {
      console.error("Failed to load expenses", e);
    } finally {
      setLoading(false);
    }
  }

  function handleTabClick(tab) {
    setActiveTab(tab);
    setEditingRecurringId(null);
  }

  // Reload expenses on filters or tab change
  useEffect(() => {
    if (activeTab === "expenses") {
      loadExpenses();
    }
  }, [filters, activeTab]);

  // Callback when recurring expense is saved or updated
  function onRecurringSaved() {
    setEditingRecurringId(null);
    // Trigger a reload of recurring expenses list by changing key
    setRecurringExpensesReloadKey((k) => k + 1);
  }

  return (
    <div className="app-container min-h-screen flex flex-col">
  <Navbar />

  <div className="main-content container mx-auto p-4 grid grid-cols-12 gap-4">
    
    <aside className="sidebar-left col-span-3 space-y-4">
      <BudgetPanel />
      <AlertsPanel />
      <RecommendationBar />
      <SpendTrends/>
    </aside>

    <main className="content-center col-span-6">
      <div className="tabs mb-4 flex border-b border-gray-300">
        <button
          className={`tab-btn px-4 py-2 -mb-px font-semibold ${
            activeTab === "expenses" ? "active-tab" : "inactive-tab"
          }`}
          onClick={() => handleTabClick("expenses")}
        >
          Expenses
        </button>
        <button
          className={`tab-btn px-4 py-2 -mb-px font-semibold ${
            activeTab === "recurring" ? "active-tab" : "inactive-tab"
          }`}
          onClick={() => handleTabClick("recurring")}
        >
          Recurring Expenses
        </button>
      </div>

      {activeTab === "expenses" && (
        <>
          <section className="expense-form-wrapper bg-white rounded p-4 shadow mb-4">
            <ExpenseForm onCreated={() => loadExpenses()} />
          </section>

          <section className="expense-list-wrapper bg-white rounded p-4 shadow">
            <ExpenseList expenses={expenses} loading={loading} onRefresh={loadExpenses} />
          </section>
        </>
      )}

      {activeTab === "recurring" && (
        <section className="recurring-expense-wrapper bg-white rounded p-4 shadow">
          {!editingRecurringId ? (
            <RecurringExpensesList
              key={recurringExpensesReloadKey}
              onEdit={(id) => setEditingRecurringId(id)}
              onAdd={() => {
                setActiveTab("recurring");
                setEditingRecurringId("new");
              }}
            />
          ) : (
            <RecurringExpenseForm
              id={editingRecurringId === "new" ? null : editingRecurringId}
              onSaved={onRecurringSaved}
              onCancel={() => setEditingRecurringId(null)}
            />
          )}
        </section>
      )}
    </main>

    <aside className="sidebar-right col-span-3 space-y-4">
      <ForecastPanel />
      <TrendsPanel />
      <Heatmap />
      <CategoryAnalytics/>
      <TopExpenses/>
    </aside>
  </div>
</div>

  );
}
