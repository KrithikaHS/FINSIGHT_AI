// src/components/ExpenseList.js
import "../styles/components.css";
import ExpenseCard from "./ExpenseCard";


export default function ExpenseList({ expenses = [], loading, onRefresh }) {
  if (loading) return <div className="p-6 text-center">Loading expenses...</div>;
  if (!expenses.length) return <div className="p-6 text-center">No expenses yet. Add one!</div>;

  return (
    <div className="expense-list scrollable-container space-y-3">
      {expenses.map(exp => (
        <ExpenseCard key={exp.id} expense={exp} onChanged={onRefresh} />
      ))}
    </div>
  );
}
