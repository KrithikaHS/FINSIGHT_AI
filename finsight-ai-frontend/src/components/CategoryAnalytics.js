
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { getCategoryAnalytics } from "../api"; // ✅ Import API function
import "../styles/components.css";
import SavingPotentialCalculator from "./SavingPotentialCalculator"; // ✅ Import calculator

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function CategoryAnalytics() {
  const [analytics, setAnalytics] = useState([]);

    useEffect(() => {
        getCategoryAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => console.error(err));
  }, []);

  const categories = analytics.map(item => item.category);
  const totals = analytics.map(item => item.total_amount);

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: totals,
        backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#F44336", "#9C27B0", "#00BCD4"],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: categories,
    datasets: [
      {
        label: "Total Spend",
        data: totals,
        backgroundColor: "#4CAF50",
      },
    ],
  };

  return (
    <div className="category-analytics-container">
      <h2 className="analytics-title">Category-wise Expense Analytics</h2>
      <div className="charts-wrapper">
        <div className="chart-card">
          <h3>Pie Chart</h3>
          <Pie data={pieData} />
        </div>
        <div className="chart-card">
          <h3>Bar Chart</h3>
          <Bar data={barData} />
        </div>
      
    {/* ✅ Add SavingPotentialCalculator with fetched categories */}
      <div className="calculator-section">
        <div className="chart-card">
                  <SavingPotentialCalculator categories={categories} />

        </div>
      </div>
      </div>
    </div>
  );
}
