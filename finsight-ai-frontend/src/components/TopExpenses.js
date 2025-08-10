import { useEffect, useState } from "react";
import { getTopExpenses } from "../api";
import "../styles/components.css";

export default function TopExpenses() {
  const [topExpenses, setTopExpenses] = useState([]);

  useEffect(() => {
    getTopExpenses()
      .then((data) => setTopExpenses(data))
      .catch((err) => console.error("Error fetching top expenses:", err));
  }, []);

  return (
    <div className="top-expenses-container">
      <h2 className="analytics-title">Top 5 Spending Categories</h2>
      <ul className="top-expenses-list">
        {topExpenses.map((item, index) => (
          <li key={index} className="top-expense-item">
            <span className="expense-rank">{index + 1}.</span>
            <span className="expense-category">{item.category}</span>
            <span className="expense-amount">₹{item.total_amount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
