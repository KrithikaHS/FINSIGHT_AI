import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getSpendTrends } from "../api";
import "../styles/components.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SpendTrends() {
  const [period, setPeriod] = useState("daily");
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    getSpendTrends(period)
      .then(data => setTrendData(data))
      .catch(err => console.error("Error fetching spend trends:", err));
  }, [period]);

  const labels = trendData.map(item => item.period);
  const amounts = trendData.map(item => item.total_amount);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Spending (${period})`,
        data: amounts,
        fill: false,
        borderColor: "#4CAF50",
        tension: 0.2
      }
    ]
  };

  return (
    <div className="spend-trends-container">
      <h2 className="analytics-title">Spending Trends</h2>
      <div className="trend-toggle">
        <button
          className={period === "daily" ? "active" : ""}
          onClick={() => setPeriod("daily")}
        >
          Daily
        </button>
        <button
          className={period === "weekly" ? "active" : ""}
          onClick={() => setPeriod("weekly")}
        >
          Weekly
        </button>
      </div>
      <Line data={chartData} />
    </div>
  );
}
