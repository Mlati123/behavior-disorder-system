import React, { useState } from "react";

const BASE_URL = "https://behavior-disorder-system-production.up.railway.app";

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Convert input into backend format
      // You can adjust this depending on your model
      const payload = {
        text: input
      };

      const response = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error(err);
      setError("Error connecting to backend API");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Behavior Disorder Prediction System</h1>

      <textarea
        rows="5"
        cols="50"
        placeholder="Enter symptoms or behavior description..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <br /><br />

      <button onClick={handlePredict} disabled={loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      <br /><br />

      {error && (
        <div style={{ color: "red" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;