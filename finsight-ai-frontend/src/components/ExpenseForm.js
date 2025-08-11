// src/components/ExpenseForm.js
import { formatISO } from "date-fns";
import { useState } from "react";
import { createExpense, uploadReceipt } from "../api";
import "../styles/components.css";


export default function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: formatISO(new Date(), { representation: "date" }),
    category: "",
    merchant: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      await createExpense(payload);
      setForm({ title: "", amount: "", date: formatISO(new Date(), { representation: "date" }), category: "", merchant: "", notes: "" });
      onCreated && onCreated();
    } catch (err) {
      console.error("create failed", err);
      alert("Failed to create expense");
    } finally {
      setLoading(false);
    }
  }
const [preview, setPreview] = useState(null);

  async function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("receipt", file);
    setLoading(true);
    try {
      const res = await uploadReceipt(fd);
      // backend returns parsed fields (amount, date, merchant, category suggestion)
      if (res.parsed) setForm({ ...form, ...res.parsed });
      onCreated && onCreated();
    } catch (err) {
      console.error("OCR upload failed", err);
      alert("Receipt upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
<form onSubmit={handleSubmit} className="expense-form space-y-3">
  <div className="expense-form__row expense-form__row--two-cols grid grid-cols-2 gap-3">
    <input
      required
      placeholder="Title (eg. Groceries)"
      value={form.title.length === 0 ? "Expense" : form.title}      onChange={e => setForm({ ...form, title: e.target.value })}
      className="expense-form__input p-2 border rounded"
    />
    <input
      required
      placeholder="Amount"
      value={form.amount}
      onChange={e => setForm({ ...form, amount: e.target.value })}
      type="number"
      className="expense-form__input p-2 border rounded"
    />
  </div>

  <div className="expense-form__row expense-form__row--three-cols grid grid-cols-3 gap-3">
    <input
      type="date"
      value={form.date}
      onChange={e => setForm({ ...form, date: e.target.value })}
      className="expense-form__input p-2 border rounded"
    />
    <input
      placeholder="Merchant"
      value={form.merchant}
      onChange={e => setForm({ ...form, merchant: e.target.value })}
      className="expense-form__input p-2 border rounded"
    />
    <input
      placeholder="Category (Food / Travel)"
      value={form.category}
      onChange={e => setForm({ ...form, category: e.target.value })}
      className="expense-form__input p-2 border rounded"
    />
  </div>

  <div className="expense-form__row expense-form__row--file-submit flex items-center gap-3">
    <input
      type="file"
      accept="image/*,application/pdf,text/plain"
      onChange={handleReceiptUpload}
      className="expense-form__file-input"
    />
    {preview && (
      <img
        src={preview}
        alt="receipt preview"
        className="expense-form__preview mt-2 max-h-36 object-contain"
      />
    )}
    <button
      type="submit"
      disabled={loading}
      className="expense-form__submit-btn px-4 py-2 bg-sky-600 text-white rounded"
    >
      {loading ? "Saving..." : "Add Expense"}
    </button>
  </div>

  <textarea
    placeholder="Notes"
    value={form.notes}
    onChange={e => setForm({ ...form, notes: e.target.value })}
    className="expense-form__textarea w-full p-2 border rounded"
  />
</form>

  );
}
