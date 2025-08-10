import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRecurringExpense, fetchRecurringExpenseById, updateRecurringExpense } from "../api";

export default function RecurringExpenseForm({ id, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: "Recurring : ",
    amount: "",
    frequency: "monthly",
    category: "",
    start_date: new Date().toISOString().substring(0, 10),
  });

  // const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("useEffect triggered, id =", id);
    if (id) {
      fetchRecurringExpenseById(id)
        .then((data) => {
          setForm({
            title: data.title,
            amount: data.amount,
            frequency: data.frequency,
            category: data.category || "",
            start_date: data.start_date,
          });
        })
        .catch(() => alert("Failed to load recurring expense"));
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (id) {
        await updateRecurringExpense(id, payload);
      } else {
        await createRecurringExpense(payload);
      }
      alert("Recurring expense saved");
      navigate("/dashboard/recurring-expenses");
    } catch {
      alert("Failed to save recurring expense");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">{id ? "Edit" : "Add"} Recurring Expense</h2>
      
      <label className="block mb-2 font-semibold">Title</label>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
        className="input-field mb-4"
      />

      <label className="block mb-2 font-semibold">Category</label>
      <input
        type="text"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        required
        className="input-field mb-4"
      />

      <label className="block mb-2 font-semibold">Amount</label>
      <input
        type="number"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        step="0.01"
        min="0"
        required
        className="input-field mb-4"
      />

      <label className="block mb-2 font-semibold">Frequency</label>
      <select
        value={form.frequency}
        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
        className="input-field mb-4"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <label className="block mb-2 font-semibold">Start Date</label>
      <input
        type="date"
        value={form.start_date}
        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
        required
        className="input-field mb-6"
      />

      <button type="submit" className="btn-primary">{id ? "Update" : "Add"}</button>
      <button
        type="button"
        className="btn-secondary ml-2"
        onClick={() => navigate("/dashboard/recurring-expenses")}
      >
        Cancel
      </button>
    </form>
  );
}
