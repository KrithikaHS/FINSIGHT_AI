import { endOfMonth, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { fetchExpenses } from "../api";
import "../styles/components.css";

export default function BudgetPanel() {
  const [budget, setBudget] = useState(() => parseFloat(localStorage.getItem("budget") || 15000));
  const [spent, setSpent] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const from = startOfMonth(new Date()).toISOString().slice(0, 10);
        const to = endOfMonth(new Date()).toISOString().slice(0, 10);
        const data = await fetchExpenses({ from, to });
        // If API returns paginated data, adjust accordingly, else just use data directly
        const expenses = data.results || data;
        const totalSpent = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
        setSpent(totalSpent);
      } catch (e) {
        // fallback demo
        setSpent(8240);
      }
    }
    load();
  }, []);

  function saveBudget() {
    localStorage.setItem("budget", budget);
    alert("Budget saved");
  }

  const pct = Math.min(100, Math.round((spent / budget) * 100));

  return (
    <div className="monthly-budget bg-white p-4 rounded shadow">
  <h3 className="monthly-budget__heading font-semibold">Monthly Budget</h3>
  
  <div className="monthly-budget__amounts mt-3">
    <div className="monthly-budget__budget-amount text-2xl font-bold">₹ {budget.toLocaleString()}</div>
    <div className="monthly-budget__spent-amount text-sm text-slate-500">Spent: ₹ {spent.toLocaleString()}</div>
  </div>

  <div className="monthly-budget__progress-bar w-full bg-slate-100 h-3 rounded mt-3">
    <div
      style={{ width: `${pct}%` }}
      className={`monthly-budget__progress-bar-fill h-3 rounded ${pct > 80 ? "bg-red-500" : "bg-sky-500"}`}
    />
  </div>

  <div className="monthly-budget__input-group mt-3 flex gap-2">
    <input
      type="number"
      value={budget}
      onChange={e => setBudget(Number(e.target.value))}
      className="monthly-budget__input p-2 border rounded w-full"
    />
    <button
      onClick={saveBudget}
      className="monthly-budget__save-btn px-4 py-2 bg-emerald-600 text-white rounded"
    >
      Save
    </button>
  </div>

  {pct > 90 && (
    <div className="monthly-budget__warning mt-2 text-sm text-red-600">
      You're near your budget limit
    </div>
  )}
</div>

  );
}
