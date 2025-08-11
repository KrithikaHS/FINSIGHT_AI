import { useEffect, useState } from "react";
import { fetchExpenses } from "../api";
import AlertsPanel from "../components/AlertsPanel";
import BudgetPanel from "../components/BudgetPanel";
import CategoryAnalytics from "../components/CategoryAnalytics";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ForecastPanel from "../components/ForecastPanel";
import Heatmap from "../components/Heatmap";
import Navbar from "../components/Navbar";
import RecommendationBar from "../components/RecommendationBar";
import RecurringExpenseForm from "../components/RecurringExpenseForm";
import RecurringExpensesList from "../components/RecurringExpensesList";
import SavingPotentialCalculator from "../components/SavingPotentialCalculator";
import SpendTrends from "../components/SpendTrends";
import TopExpenses from "../components/TopExpenses";
import TrendsPanel from "../components/TrendsPanel";


export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({ from: null, to: null, category: "" });
  const [loading, setLoading] = useState(false);
  const [recurringExpensesReloadKey, setRecurringExpensesReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState("expenses");
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

  useEffect(() => {
    if (activeTab === "expenses") {
      loadExpenses();
    }
  }, [filters, activeTab]);

  function onRecurringSaved() {
    setEditingRecurringId(null);
    setRecurringExpensesReloadKey((k) => k + 1);
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      {/* Row 2: Budget, Alerts, Recommendation, Spend Trends */}
      <section>
        <BudgetPanel />
      </section>
      <section className="top-panels">
        <section>
        <AlertsPanel />
        <RecommendationBar />
        </section>
        
        <SpendTrends />
        <SavingPotentialCalculator/>
      </section>
      

      {/* Row 3: Tabs + Expenses / Recurring */}
      <section className="expenses-tabs-section">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "expenses" ? "active" : ""}`}
            onClick={() => handleTabClick("expenses")}
          >
            Expenses
          </button>
          <button
            className={`tab-btn ${activeTab === "recurring" ? "active" : ""}`}
            onClick={() => handleTabClick("recurring")}
          >
            Recurring Expenses
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "expenses" && (
            <>
              <div className="expense-form-wrapper">
                <ExpenseForm onCreated={() => loadExpenses()} />
              </div>
              <div className="expense-list-wrapper">
                <ExpenseList expenses={expenses} loading={loading} onRefresh={loadExpenses} />
              </div>
            </>
          )}
          {activeTab === "recurring" && (
            <div className="recurring-expense-wrapper">
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
            </div>
          )}
        </div>
      </section>

      {/* Row 4: Category Analytics (pie + bar side by side) */}
      <section className="category-analytics-section">
        <CategoryAnalytics />
      </section>

      {/* Row 5: Top Expenses, Heatmap, Trends side by side */}
      <section className="analytics-panels">
        <TopExpenses />
        <Heatmap />
        <TrendsPanel />
      </section>

      {/* Row 6: Forecast full width */}
      <section className="forecast-section">
        <ForecastPanel />
      </section>
    </div>
  );
}
