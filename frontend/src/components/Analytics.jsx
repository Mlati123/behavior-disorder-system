import { useEffect, useState } from "react";
import API from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function Analytics() {

  const [predictions, setPredictions] = useState([]);

  // =========================
  // FETCH DATA
  // =========================
  const fetchPredictions = async () => {

    try {

      const response = await API.get("/predictions");

      setPredictions(response.data.data || []);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  // =========================
  // CALCULATIONS
  // =========================
  const low = predictions.filter(
    (p) => p.risk_level === "Low"
  ).length;

  const medium = predictions.filter(
    (p) => p.risk_level === "Medium"
  ).length;

  const high = predictions.filter(
    (p) => p.risk_level === "High"
  ).length;

  const chartData = [
    { name: "Low", value: low },
    { name: "Medium", value: medium },
    { name: "High", value: high },
  ];

  const COLORS = [
    "#22c55e",
    "#f59e0b",
    "#ef4444",
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        padding: 20,
        borderRadius: 10,
        marginTop: 30,
      }}
    >

      <h2>Clinical Analytics</h2>

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
        }}
      >

        <div style={cardStyle}>
          <h3>Total Predictions</h3>
          <p>{predictions.length}</p>
        </div>

        <div style={cardStyle}>
          <h3>High Risk Cases</h3>
          <p>{high}</p>
        </div>

      </div>

      {/* CHART */}
      <div style={{ marginTop: 40 }}>

        <PieChart width={400} height={300}>

          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label
          >

            {chartData.map((entry, index) => (

              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />

            ))}

          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>

      </div>

    </div>
  );
}

const cardStyle = {
  flex: 1,
  padding: 20,
  background: "#f3f4f6",
  borderRadius: 10,
  textAlign: "center",
};