// src/components/TrendsPanel.js
import { useEffect, useState } from "react";
import { getTrends } from "../api";
import "../styles/components.css";


export default function TrendsPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getTrends({ period: 30 });
        setData(res);
      } catch (e) {
        setData({
          topCategories: [{ category: "Food", change: 20 }, { category: "Transport", change: -5 }, { category: "Subscriptions", change: 12 }]
        });
      }
    }
    load();
  }, []);

  return (
    <div className="trends-container">
  <h4 className="trends-title">Trends</h4>
  {data && data.topCategories.map(c => (
    <div key={c.category} className="trends-row">
      <div className="trends-category">{c.category}</div>
      <div className={`trends-change ${c.change > 0 ? "positive" : "negative"}`}>
        {c.change > 0 ? `+${c.change}%` : `${c.change}%`}
      </div>
    </div>
  ))}
</div>

  );
}
