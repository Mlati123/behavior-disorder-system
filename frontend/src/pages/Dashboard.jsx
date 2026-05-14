import { useEffect, useState } from "react";

import API from "../services/api";

import PredictionPanel from "../components/PredictionPanel";
import Analytics from "../components/Analytics";

export default function Dashboard() {

  const [residents, setResidents] = useState([]);

  // =========================
  // FETCH RESIDENTS
  // =========================
  const fetchResidents = async () => {

    try {

      const response = await API.get("/residents");

      setResidents(response.data.data || []);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  return (
    <div>

      <h1>A-KNN Multi-Lable Behavioral Clasiffier</h1>

      {/* SUMMARY */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
        }}
      >

        <div style={cardStyle}>
          <h3>Total Residents</h3>
          <p>{residents.length}</p>
        </div>

        <div style={cardStyle}>
          <h3>AI System</h3>
          <p>Active</p>
        </div>

      </div>

      {/* PREDICTION PANEL */}
      <PredictionPanel />

      {/* ANALYTICS */}
      <Analytics />

    </div>
  );
}

const cardStyle = {
  flex: 1,
  padding: 20,
  background: "#ffffff",
  borderRadius: 10,
  textAlign: "center",
};