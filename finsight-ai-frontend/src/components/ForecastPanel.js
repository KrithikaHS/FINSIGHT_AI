// src/components/ForecastPanel.js
import "../styles/components.css";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getForecast } from "../api";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function ForecastPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getForecast({ period: 30 });
        setData(res);
      } catch (e) {
        console.log("Demo Data")
      }
    }
    load();
  }, []);

  if (!data) return <div className="p-3">Loading forecast...</div>;

  const chartData = {
    labels: data.dates,
    datasets: [
      { label: "Actual", data: data.actual, fill: false, tension: 0.3 },
      { label: "Forecast", data: data.forecast, borderDash: [6, 4], fill: false, tension: 0.3 }
    ]
  };

  return (
    <div className="expense-forecast bg-white p-3 rounded shadow">
  <h4 className="expense-forecast__title font-semibold mb-2">Expense Forecast (next 30 days)</h4>
  <Line data={chartData} />
</div>

  );
}
