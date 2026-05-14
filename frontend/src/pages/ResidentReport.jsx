import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { generateReport } from "../utils/generateReport";

export default function ResidentReport() {

  const { id } = useParams();

  const [resident, setResident] = useState(null);
  const [predictions, setPredictions] = useState([]);

  // =========================
  // FETCH RESIDENT
  // =========================
  const fetchResident = async () => {

    try {

      const res = await API.get("/residents");

      const found = res.data.data.find(
        (r) => r.id == id
      );

      setResident(found);

    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // FETCH PREDICTIONS
  // =========================
  const fetchPredictions = async () => {

    try {

      const res = await API.get("/predictions");

      const filtered = res.data.data.filter(
        (p) => p.resident_id == id
      );

      setPredictions(filtered);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchResident();
    fetchPredictions();
  }, [id]);

  if (!resident) {
    return <p>Loading resident...</p>;
  }

  return (
    <div>

      <h1>Resident Clinical Report</h1>

      {/* EXPORT BUTTON */}
      <button
        onClick={() => generateReport("residentReport")}
        style={{
          padding: 10,
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
          marginTop: 10,
        }}
      >
        Export PDF
      </button>

      {/* REPORT AREA */}
      <div
        id="residentReport"
        style={{
          background: "white",
          padding: 20,
          marginTop: 20,
          borderRadius: 10,
        }}
      >

        {/* =========================
            RESIDENT INFO
        ========================= */}
        <h2>Resident Information</h2>

        <p><b>Name:</b> {resident.full_name}</p>
        <p><b>Gender:</b> {resident.gender}</p>
        <p><b>Age:</b> {resident.age}</p>
        <p><b>Diagnosis:</b> {resident.diagnosis}</p>

        {/* =========================
            PREDICTIONS HISTORY
        ========================= */}
        <h2 style={{ marginTop: 20 }}>
          AI Prediction History
        </h2>

        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            marginTop: 10,
            borderCollapse: "collapse",
          }}
        >

          <thead>
            <tr>
              <th>ID</th>
              <th>Prediction</th>
              <th>Risk Level</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {predictions.map((p) => (

              <tr key={p.id}>

                <td>{p.id}</td>
                <td>{p.prediction}</td>
                <td>{p.risk_level}</td>
                <td>{p.created_at}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}