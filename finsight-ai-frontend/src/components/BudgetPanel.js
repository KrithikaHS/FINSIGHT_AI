import { endOfMonth, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { fetchBudgetOptimization, fetchExpenses } from "../api"; // Make sure fetchExpenses is defined
import "../styles/components.css";

export default function BudgetManager() {
  // State for budget optimizer
  const [monthlyBudget, setMonthlyBudget] = useState(() =>
    parseFloat(localStorage.getItem("budget") || 15000)
  );
  const [savingGoal, setSavingGoal] = useState(3000);
  const [optimizationData, setOptimizationData] = useState(null);
  const [optimizationError, setOptimizationError] = useState(null);

  // State for current spending (for progress bar)
  const [spent, setSpent] = useState(0);
  const [expensesError, setExpensesError] = useState(null);

  // Load budget optimization data when monthlyBudget or savingGoal changes
  useEffect(() => {
    async function loadOptimization() {
      try {
        const res = await fetchBudgetOptimization(monthlyBudget, savingGoal);
        setOptimizationData(res.results || []);
        setOptimizationError(null);
      } catch (e) {
        setOptimizationError("Failed to fetch budget optimization data");
      }
    }
    loadOptimization();
  }, [monthlyBudget, savingGoal]);

  // Load current month expenses to calculate spent amount
  useEffect(() => {
    async function loadExpenses() {
      try {
        const from = startOfMonth(new Date()).toISOString().slice(0, 10);
        const to = endOfMonth(new Date()).toISOString().slice(0, 10);
        const data = await fetchExpenses({ from, to });
        const expenses = data.results || data;
        const totalSpent = expenses.reduce(
          (acc, expense) => acc + parseFloat(expense.amount),
          0
        );
        setSpent(totalSpent);
        setExpensesError(null);
      } catch (e) {
        setExpensesError("Failed to load expenses");
        setSpent(0);
      }
    }
    loadExpenses();
  }, []);

  function saveBudget() {
    localStorage.setItem("budget", monthlyBudget);
    alert("Budget saved");
  }

  const spentPct = Math.min(100, Math.round((spent / monthlyBudget) * 100));

  return (
    <div className="budget-manager max-w-4xl mx-auto space-y-8 p-4">
      <section className="monthly-budget bg-white p-4 rounded shadow">
        <h3 className="monthly-budget__heading font-semibold text-xl">
          Monthly Budget
        </h3>

        <div className="monthly-budget__amounts mt-3 flex justify-between items-center">
          <div className="monthly-budget__budget-amount text-2xl font-bold">
            ₹ {monthlyBudget.toLocaleString()}
          </div>
          <div className="monthly-budget__spent-amount text-sm text-slate-500">
            Spent: ₹ {spent.toLocaleString()}
          </div>
        </div>

        <div className="monthly-budget__progress-bar w-full bg-slate-100 h-3 rounded mt-3">
          <div
            style={{ width: `${spentPct}%` }}
            className={`monthly-budget__progress-bar-fill h-3 rounded ${
              spentPct > 80 ? "bg-red-500" : "bg-sky-500"
            }`}
          />
        </div>

        {spentPct > 90 && (
          <div className="monthly-budget__warning mt-2 text-sm text-red-600">
            You're near your budget limit
          </div>
        )}

        <div className="monthly-budget__input-group mt-4 flex gap-4 items-center">
          <div className="flex flex-col flex-grow">
            <label className="font-semibold mb-1">Monthly Budget:</label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="flex flex-col flex-grow">
            <label className="font-semibold mb-1">Saving Goal:</label>
            <input
              type="number"
              value={savingGoal}
              onChange={(e) => setSavingGoal(Number(e.target.value))}
              className="p-2 border rounded w-full"
            />
          </div>
          <button
            onClick={saveBudget}
            className="px-6 py-2 bg-emerald-600 text-white rounded mt-6 self-end"
          >
            Save
          </button>
        </div>

        {(expensesError || optimizationError) && (
          <p className="text-red-600 mt-2">
            {expensesError || optimizationError}
          </p>
        )}
      {optimizationData && optimizationData.length > 0 && (
        <section className="budget-optimizer bg-white p-4 rounded shadow overflow-auto">
          <h3 className="text-xl font-semibold mb-4">Budget Optimization Details</h3>
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr>
                <th className="border-b px-3 py-2">Category</th>
                <th className="border-b px-3 py-2">Allocated Budget (₹)</th>
                <th className="border-b px-3 py-2">Spent (₹)</th>
                <th className="border-b px-3 py-2">Forecasted Spend (₹)</th>
                <th className="border-b px-3 py-2">Status</th>
                <th className="border-b px-3 py-2">Remaining Budget (₹)</th>
              </tr>
            </thead>
            <tbody>
              {optimizationData.map((row) => (
                <tr key={row.category} className="hover:bg-gray-50">
                  <td className="border-b px-3 py-2">{row.category}</td>
                  <td className="border-b px-3 py-2">{row.allocated_budget.toFixed(2)}</td>
                  <td className="border-b px-3 py-2">{row.current_spent.toFixed(2)}</td>
                  <td className="border-b px-3 py-2">{row.forecasted_spend.toFixed(2)}</td>
                  <td
                    className="border-b px-3 py-2 font-semibold"
                    style={{
                      color:
                        row.status === "spent_exceed" || row.status === "forecast_exceed"
                          ? "red"
                          : "green",
                    }}
                  >
                    {row.status === "ok"
                      ? "Within Budget"
                      : row.status === "spent_exceed"
                      ? "Overspent!"
                      : "Forecasted to overspend"}
                  </td>
                  <td className="border-b px-3 py-2">{row.remaining_budget.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      </section>
      
    </div>
  );
}
