import { format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { fetchHeatmapData } from "../api";
import "../styles/components.css";

export default function Heatmap() {
  const [data, setData] = useState(Array(35).fill(0));  // default zeroes

  useEffect(() => {
    async function loadHeatmap() {
      try {
        const result = await fetchHeatmapData();
        setData(result);
      } catch (error) {
        console.error("Failed to load heatmap data", error);
      }
    }
    loadHeatmap();
  }, []);

  const maxVal = Math.max(...data);

  // helper to get color based on intensity
  function getColor(val) {
    if (val === 0) return "#d1d5db";  // gray for zero spend (#d1d5db ~ light gray)
    if (maxVal === 0) return "#d1d5db";

    const intensity = val / maxVal;
    if (intensity > 0.75) return "#b91c1c";       // red-700
    else if (intensity > 0.4) return "#ca8a04";   // yellow-500
    else return "#16a34a";                         // green-600
  }

  return (
    <div className="heatmap-container">
  <h4 className="heatmap-title">Spend Heatmap</h4>
  <div className="heatmap-grid">
    {Array.from({ length: 35 }).map((_, i) => {
      const cellDate = subDays(new Date(), 34 - i);
      const formattedDate = format(cellDate, "MMM d");
      const val = data[i];
      const bgColor = getColor(val);

      return (
        <div
          key={i}
          className="heatmap-cell"
          title={`${formattedDate}: ₹${val.toLocaleString()}`}
          style={{ backgroundColor: bgColor }}
        />
      );
    })}
  </div>
  <div className="heatmap-legend">Darker = more spending days</div>
</div>

  );
}
