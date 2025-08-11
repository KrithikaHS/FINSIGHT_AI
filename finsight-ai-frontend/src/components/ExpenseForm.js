// src/components/ExpenseForm.js
import { formatISO } from "date-fns";
import { useState } from "react";
import { createExpense, uploadReceipt } from "../api";
import "../styles/components.css";


export default function ExpenseForm({ onCreated }) {
    const categories = ["Food", "Travel", "Shopping", "Utilities", "Entertainment"];
  const [customCategory, setCustomCategory] = useState("");

  function handleCategoryChange(e) {
    const val = e.target.value;
    if (val === "Other") {
      setForm({ ...form, category: customCategory });
    } else {
      setForm({ ...form, category: val });
      setCustomCategory(""); // reset custom
    }
  }

  function handleCustomChange(e) {
    setCustomCategory(e.target.value);
    setForm({ ...form, category: e.target.value });
  }
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: formatISO(new Date(), { representation: "date" }),
    category: "Food",
    merchant: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
        const title = form.title.trim() === "" ? "Expense" : form.title;

  if (!form.category.trim()) {
    alert("Category is required");
    return;
  }
  if (!form.amount || isNaN(parseFloat(form.amount))) {
    alert("Valid amount is required");
    return;
  }
    setLoading(true);
    try {
      const payload = { ...form,title, amount: parseFloat(form.amount) };
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
    <div>
      <select
        value={categories.includes(form.category) ? form.category : "Other"}
        onChange={handleCategoryChange}
        className="expense-form__input p-2 border rounded"
      >
        <option value="" disabled>
          Select Category
        </option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
        <option value="Other">Other</option>
      </select>
      {!categories.includes(form.category) && (
        <input
          type="text"
          placeholder="Enter category"
          value={customCategory}
          onChange={handleCustomChange}
          className="expense-form__input p-2 border rounded mt-2"
        />
      )}
    </div>
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
