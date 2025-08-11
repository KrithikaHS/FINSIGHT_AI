import { useEffect, useState } from "react";
import { getCategoryAnalytics, getSavingPotential } from "../api";

export default function SavingPotentialCalculator() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategoryAnalytics();
        setCategories(data.map(item => item.category));
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories]);

  const calculate = async () => {
    try {
      const data = await getSavingPotential(category, percentage);
      setResult(data);
    } catch (err) {
      console.error("Error calculating savings:", err);
    }
  };

  if (categoriesLoading) {
    return <p>Loading categories...</p>;
  }

  if (categories.length === 0) {
    return <p>No categories available.</p>;
  }

  return (
    <div className="saving-calculator">
      <h2>💰 Saving Potential Calculator</h2>
      <div className="form-group">
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Cut by (%):</label>
        <input
          type="number"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          min="0"
          max="100"
        />
      </div>
      <button onClick={calculate}>Calculate</button>

      {result && (
        <div className="result">
          <p>
            If you cut <strong>{percentage}%</strong> from{" "}
            <strong>{category}</strong>, you could save{" "}
            <strong>₹{result.potential_savings}</strong> this month.
          </p>
        </div>
      )}
    </div>
  );
}
