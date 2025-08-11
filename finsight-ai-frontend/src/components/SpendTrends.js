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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrends = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSpendTrends(selectedPeriod);
      // Ensure data is an array of { period: string, total_amount: number }
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from API");
      }
      setTrendData(data);
    } catch (err) {
      console.error("Error fetching spend trends:", err);
      setError("Failed to load spend trends. Please try again later.");
      setTrendData([]); // reset to empty to avoid chart crash
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount & whenever period changes
  useEffect(() => {
    fetchTrends(period);
  }, [period]);

  const labels = trendData.map(item => item.period || "N/A");
  const amounts = trendData.map(item => Number(item.total_amount) || 0);

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

      {loading && <p>Loading {period} trends...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && trendData.length === 0 && <p>No data available for {period} trends.</p>}

      {!loading && !error && trendData.length > 0 && (
        <Line data={chartData} />
      )}
    </div>
  );
}
