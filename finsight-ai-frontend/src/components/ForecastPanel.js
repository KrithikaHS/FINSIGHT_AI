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

export default function ForecastPanel({ period = 30 }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getForecast({ period });
        setData(res);
      } catch (e) {
        console.error("Failed to load forecast data:", e);
        setError("Failed to load forecast data");
      }
    }
    load();
  }, [period]);

  if (error) {
    return <div className="p-3 text-red-600">{error}</div>;
  }

  if (!data) return <div className="p-3">Loading AI-powered expense forecast...</div>;

  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: "Actual",
        data: data.actual,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: false,
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "AI Forecast",
        data: data.forecast,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderDash: [6, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Amount (₹)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="expense-forecast bg-white p-3 rounded shadow">
      <h4 className="expense-forecast__title font-semibold mb-2">
        AI-Powered Expense Forecast (next {period} days)
      </h4>
      <Line data={chartData} options={options} />
    </div>
  );
}
