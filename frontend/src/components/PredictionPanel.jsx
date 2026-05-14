import { useState } from "react";

import API from "../services/api";

export default function PredictionPanel() {

  // =========================
  // FORM STATE
  // =========================
  const [form, setForm] = useState({
    aggression: false,
    hyperactivity: false,
    anxiety: false,
    social_withdrawal: false,
    sleep_problems: false,
    communication_difficulty: false,
    repetitive_behavior: false,
    emotional_instability: false,
  });

  // =========================
  // RESULT STATE
  // =========================
  const [result, setResult] = useState(null);

  // =========================
  // HANDLE CHECKBOX
  // =========================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.checked,
    });
  };

  // =========================
  // RUN AI PREDICTION
  // =========================
  const runPrediction = async () => {

    try {

      const response = await API.post(
        "/predict-disorder",
        form
      );

      setResult(response.data);

    } catch (error) {

      console.log(error);

      alert("Prediction failed");
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: 20,
        borderRadius: 10,
        marginTop: 30,
      }}
    >

      <h2>AI Behavioral Prediction</h2>

      {/* =========================
          SYMPTOMS
      ========================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginTop: 20,
        }}
      >

        {Object.keys(form).map((key) => (

          <label
            key={key}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >

            <input
              type="checkbox"
              name={key}
              checked={form[key]}
              onChange={handleChange}
            />

            {key.replaceAll("_", " ")}

          </label>

        ))}

      </div>

      {/* =========================
          BUTTON
      ========================= */}
      <button
        onClick={runPrediction}
        style={{
          marginTop: 20,
          padding: 12,
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Run AI Prediction
      </button>

      {/* =========================
          RESULT
      ========================= */}
      {result && (

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#f9fafb",
            borderRadius: 10,
          }}
        >

          <h3>Prediction Result</h3>

          {/* MULTILABEL OUTPUT */}
          <p>

            <strong>Predicted Disorders:</strong>{" "}

            {
              Array.isArray(result.prediction)
                ? result.prediction.join(", ")
                : result.prediction
            }

          </p>

          {/* INTERVENTIONS */}
          {
            result.interventions &&
            result.interventions.length > 0 && (

              <div style={{ marginTop: 15 }}>

                <h4>Recommended Interventions</h4>

                <ul>

                  {result.interventions.map((item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  ))}

                </ul>

              </div>
            )
          }

        </div>
      )}

    </div>
  );
}