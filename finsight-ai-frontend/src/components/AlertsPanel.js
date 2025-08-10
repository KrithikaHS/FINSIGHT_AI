// src/components/AlertsPanel.js
import { useEffect, useState } from "react";
import { getAlerts } from "../api";
import "../styles/components.css";


export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAlerts();
        setAlerts(res);
      } catch (e) {
        // setAlerts([{ id:1, text:"Spent 92% of monthly grocery budget" }, { id:2, text:"Unusual large transaction: ₹ 12,500 at XYZ Retail" }]);
      }
    }
    load();
  }, []);

  return (
    <div className="alerts bg-white p-3 rounded shadow">
  <h4 className="alerts__heading font-semibold mb-2">Alerts</h4>
  {alerts.length === 0 && <div className="alerts__empty text-sm text-slate-500">No alerts</div>}
  {alerts.map(a => (
    <div key={a.id} className="alerts__item text-sm p-2 border-b last:border-b-0">
      {a.text}
    </div>
  ))}
</div>

  );
}
