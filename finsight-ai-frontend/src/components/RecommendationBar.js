// src/components/RecommendationBar.js
import { useEffect, useState } from "react";
import { getRecommendations } from "../api";
import "../styles/components.css";


export default function RecommendationBar() {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await getRecommendations(user.id);
        setRecs(res.slice(0,3));
      } catch (e) {
        // setRecs([
        //   { id: 1, text: "Move subscription payments to annual to save 10%" },
        //   { id: 2, text: "Grocery spending trending up — try a 10% budget cut" },
        // ]);
      }
    }
    load();
  }, []);

  return (
    <div className="alerts bg-white p-3 rounded shadow">
      <h4 className="alerts__heading font-semibold mb-2">Recommendations</h4>
        {recs.length === 0 && <div className="alerts__empty text-sm text-slate-500">No Recommendations</div>}

      {recs.map(r => <div key={r.id} className="alerts__item text-sm p-2 border-b last:border-b-0">{r.text}</div>)}
    </div>
  );
}
