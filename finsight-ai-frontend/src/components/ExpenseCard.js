// src/components/ExpenseCard.js
import { format } from "date-fns";
import { useState } from "react";
import { deleteExpense, updateExpense } from "../api";
import "../styles/components.css";


export default function ExpenseCard({ expense, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(expense);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateExpense(local.id, local);
      setEditing(false);
      onChanged && onChanged();
    } catch (e) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await deleteExpense(expense.id);
      onChanged && onChanged();
    } catch (e) {
      alert("Delete failed");
    }
  }

  return (
    <div className="expense-card flex items-start justify-between p-3 border rounded">
  <div className="expense-card__details">
    {editing ? (
      <>
        <input
          className="expense-card__input expense-card__input--title border p-1 mb-2"
          value={local.title}
          onChange={(e) => setLocal({ ...local, title: e.target.value })}
        />
        <input
          type="number"
          className="expense-card__input expense-card__input--amount border p-1 w-28"
          value={local.amount}
          onChange={(e) => setLocal({ ...local, amount: e.target.value })}
        />
        <input
          className="expense-card__input expense-card__input--category border p-1 mt-2"
          value={local.category}
          onChange={(e) => setLocal({ ...local, category: e.target.value })}
        />
      </>
    ) : (
      <>
        <div className="expense-card__title text-lg font-semibold">{expense.title}</div>
        <div className="expense-card__subtitle text-sm text-slate-600">
          {expense.merchant} • {expense.category}
        </div>
        <div className="expense-card__date text-sm mt-1">
          On {format(new Date(expense.date), "dd MMM yyyy")}
        </div>
        <div className="expense-card__amount text-xl mt-1">₹ {expense.amount}</div>
      </>
    )}
  </div>

  <div className="expense-card__actions flex flex-col items-end gap-2">
    {editing ? (
      <>
        <button
          onClick={save}
          className="expense-card__btn expense-card__btn--save px-3 py-1 bg-green-600 text-white rounded"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="expense-card__btn expense-card__btn--cancel px-3 py-1 bg-slate-100 rounded"
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        {expense.category_confidence && (
          <div className="expense-card__ai-badge px-2 py-1 bg-sky-50 text-sky-700 rounded text-xs">
            {Math.round(expense.category_confidence * 100)}% AI
          </div>
        )}
        <div className="expense-card__buttons flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="expense-card__btn expense-card__btn--edit px-3 py-1 bg-slate-100 rounded"
          >
            Edit
          </button>

          {confirmDelete ? (
            <div className="expense-card__confirm-delete flex gap-1">
              <button
                onClick={remove}
                className="expense-card__btn expense-card__btn--delete-confirm px-3 py-1 bg-red-600 text-white rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="expense-card__btn expense-card__btn--delete-cancel px-3 py-1 bg-slate-100 rounded"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="expense-card__btn expense-card__btn--delete px-3 py-1 bg-red-50 text-red-600 rounded"
            >
              Delete
            </button>
          )}
        </div>
      </>
    )}
  </div>
</div>

  );
}
