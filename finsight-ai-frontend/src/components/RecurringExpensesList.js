import { useEffect, useState } from "react";
import { deleteRecurringExpense, fetchRecurringExpenses } from "../api";

export default function RecurringExpensesList({ onAdd, onEdit }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchRecurringExpenses();
      setExpenses(data);
    } catch (err) {
      alert("Failed to load recurring expenses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this recurring expense?")) {
      try {
        await deleteRecurringExpense(id);
        alert("Deleted successfully");
        await loadData(); // reload list after delete
      } catch (err) {
        alert("Failed to delete recurring expense");
      }
    }
  }

  return (
    <div className="recurring-expenses-container">
  <h2>Recurring Expenses</h2>
  <button onClick={onAdd} className="recurring-add-btn mb-3">
    + Add New Recurring Expense
  </button>

  {loading ? (
    <p className="recurring-loading">Loading...</p>
  ) : expenses.length === 0 ? (
    <p className="recurring-empty">No recurring expenses found.</p>
  ) : (
    <table className="recurring-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Amount</th>
          <th>Frequency</th>
          <th>Start Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((exp) => (
          <tr key={exp.id}>
            <td>{exp.title}</td>
            <td>₹ {Number(exp.amount).toFixed(2)}</td>
            <td>{exp.frequency}</td>
            <td>{new Date(exp.start_date).toLocaleDateString()}</td>
            <td>
              <button
                className="recurring-action-btn edit"
                onClick={() => onEdit(exp.id)}
              >
                Edit
              </button>
              <button
                className="recurring-action-btn delete"
                onClick={() => handleDelete(exp.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

  );
}
