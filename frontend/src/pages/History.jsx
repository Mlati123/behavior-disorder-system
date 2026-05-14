import { useEffect, useState } from "react";
import API from "../services/api";
import { generateReport } from "../utils/generateReport";

export default function History() {

  const [predictions, setPredictions] = useState([]);

  const fetchPredictions = async () => {

    try {

      const res = await API.get("/predictions");

      setPredictions(res.data.data || []);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <div>

      <h1>Prediction History</h1>

      {/* EXPORT BUTTON */}
      <button
        onClick={() => generateReport("reportArea")}
        style={{
          padding: 10,
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 5,
          marginTop: 10,
          cursor: "pointer",
        }}
      >
        Export PDF Report
      </button>

      {/* REPORT AREA */}
      <div
        id="reportArea"
        style={{
          marginTop: 20,
          background: "white",
          padding: 20,
          borderRadius: 10,
        }}
      >

        <h2>Clinical Prediction Report</h2>

        <p>Date: {new Date().toLocaleDateString()}</p>

        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            marginTop: 20,
            borderCollapse: "collapse",
          }}
        >

          <thead>
            <tr>
              <th>ID</th>
              <th>Resident</th>
              <th>Prediction</th>
              <th>Risk</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {predictions.map((item) => (

              <tr key={item.id}>

                <td>{item.id}</td>
                <td>{item.resident_id}</td>
                <td>{item.prediction}</td>
                <td>{item.risk_level}</td>
                <td>{item.created_at}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}