{result && (
  <div style={{ marginTop: 20, padding: 10, background: "#f3f4f6" }}>
    <h3>AI Result</h3>

    <p><b>Prediction:</b> {result.prediction}</p>
    <p><b>Risk Level:</b> {result.risk_level}</p>

    <b>Recommended Intervention:</b>
    <ul>
      {result.recommended_intervention.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </div>
)}