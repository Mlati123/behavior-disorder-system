import { useEffect, useState } from "react";
import API from "../services/api";

export default function Residents() {

  const [form, setForm] = useState({
    full_name: "",
    gender: "",
    age: "",
    diagnosis: "",
    progress: "Initial",
    discharge_date: "",
    is_discharged: false,
  });

  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [predictionForm, setPredictionForm] = useState({
    resident_id: null,
    aggression: false,
    hyperactivity: false,
    anxiety: false,
    social_withdrawal: false,
    sleep_problems: false,
    communication_difficulty: false,
    repetitive_behavior: false,
    emotional_instability: false,
  });

  const [predictions, setPredictions] = useState({});

  const [selectedResident, setSelectedResident] = useState(null);

  // =========================
  // FETCH RESIDENTS
  // =========================
  const fetchResidents = async () => {
    try {
      const res = await API.get("/residents");
      setResidents(res.data.data || []);
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
      const preds = {};
      res.data.data.forEach(p => {
        preds[p.resident_id] = {
          prediction: JSON.parse(p.prediction.replace(/'/g, '"')),
          risk_level: p.risk_level,
          recommended_intervention: JSON.parse(p.interventions)
        };
      });
      setPredictions(preds);
    } catch (err) {
      console.log(err);
    }
  };

  const getResidentStatus = (r) => {
    if (r.is_discharged || r.progress === "Ready for Discharge") {
      return "DISCHARGED";
    }
    return r.status || "Active";
  };

  const getResidentProgress = (r) => r.progress || r.status || "N/A";

  const filteredResidents = residents.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const searchableValues = [
      r.full_name,
      r.gender,
      r.age?.toString(),
      r.diagnosis,
      r.progress,
      r.status,
      r.discharge_date,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchableValues.includes(term);
  });

  useEffect(() => {
    fetchResidents();
    fetchPredictions();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // HANDLE PREDICTION INPUT
  // =========================
  const handlePredictionChange = (e) => {
    const { name, checked } = e.target;
    setPredictionForm({
      ...predictionForm,
      [name]: checked,
    });
  };

  // =========================
  // ADD RESIDENT
  // =========================
  const addResident = async () => {
    if (!form.full_name || !form.age || !form.gender) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      const res = await API.post("/add-resident", {
        full_name: form.full_name,
        gender: form.gender,
        age: parseInt(form.age),
        diagnosis: form.diagnosis || "",
        progress: form.progress || "Initial",
        is_discharged: form.is_discharged || false,
        discharge_date: form.is_discharged ? (form.discharge_date || new Date().toISOString().slice(0,10)) : null,
      });

      alert("Resident added successfully");

      setForm({
        full_name: "",
        gender: "",
        age: "",
        diagnosis: "",
        progress: "Initial",
        discharge_date: "",
        is_discharged: false,
      });

      // Refresh the residents list
      setTimeout(() => {
        fetchResidents();
        fetchPredictions();
      }, 500);
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      alert(`Failed to add resident: ${err.response?.data?.error || err.message}`);
    }
  };

  // =========================
  // START PREDICTION FOR RESIDENT
  // =========================
  const startPrediction = (residentId) => {
    setPredictionForm({
      ...predictionForm,
      resident_id: residentId,
    });
  };

  // =========================
  // RUN PREDICTION
  // =========================
  const runPrediction = async () => {
    try {
      const res = await API.post("/predict-disorder", predictionForm);
      alert(`Prediction: ${res.data.prediction.join(", ")}\nRisk Level: ${res.data.risk_level}\nInterventions: ${res.data.recommended_intervention.join(", ")}`);
      setPredictions({
        ...predictions,
        [predictionForm.resident_id]: res.data,
      });
      setPredictionForm({
        resident_id: null,
        aggression: false,
        hyperactivity: false,
        anxiety: false,
        social_withdrawal: false,
        sleep_problems: false,
        communication_difficulty: false,
        repetitive_behavior: false,
        emotional_instability: false,
      });
      fetchPredictions(); // Refresh predictions
    } catch (err) {
      console.log(err);
      alert("Failed to run prediction");
    }
  };

  // =========================
  // DOWNLOAD ALL REPORTS
  // =========================
  const downloadAll = () => {
    const csv = [
        ["ID", "Name", "Gender", "Age", "Diagnosis", "Progress", "Status", "Discharge Date", "AI Prediction", "Risk Level", "Recommendations"],
      ...residents.map(r => [
        r.id,
        r.full_name,
        r.gender,
        r.age,
        r.diagnosis || "N/A",
        getResidentProgress(r),
        getResidentStatus(r),
        r.discharge_date || "N/A",
        predictions[r.id] ? predictions[r.id].prediction.join(", ") : "Not run",
        predictions[r.id] ? predictions[r.id].risk_level : "N/A",
        predictions[r.id]?.recommended_intervention ? predictions[r.id].recommended_intervention.join("; ") : "N/A"
      ])
    ]
    .map(e => e.map(cell => `"${cell}"`).join(","))
    .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "all_residents_report.csv";
    a.click();
  };

  // =========================
  // DOWNLOAD SINGLE REPORT
  // =========================
  const downloadSingle = (resident) => {
    const csv = `ID,Name,Gender,Age,Diagnosis,Progress,Status,Discharge Date,AI Prediction,Risk Level,Recommendations
"${resident.id}","${resident.full_name}","${resident.gender}","${resident.age}","${resident.diagnosis || "N/A"}","${getResidentProgress(resident)}","${getResidentStatus(resident)}","${resident.discharge_date || "N/A"}","${predictions[resident.id] ? predictions[resident.id].prediction.join(", ") : "Not run"}","${predictions[resident.id] ? predictions[resident.id].risk_level : "N/A"}","${predictions[resident.id]?.recommended_intervention ? predictions[resident.id].recommended_intervention.join("; ") : "N/A"}"`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${resident.full_name}_report.csv`;
    a.click();
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>Residents Management</h2>
      <div style={{ marginTop: 10, maxWidth: 420 }}>
        <input
          type="text"
          placeholder="Search residents by name, diagnosis, status, discharge date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      {/* ================= FORM ================= */}
      <div style={{ display: "grid", gap: 10, marginTop: 20 }}>

        <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} />
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        <input name="age" placeholder="Age" value={form.age} onChange={handleChange} />
        <input name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={handleChange} />
        <select name="progress" value={form.progress} onChange={handleChange}>
          <option value="Initial">Initial</option>
          <option value="Early">Early</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Ready for Discharge">Ready for Discharge</option>
        </select>
        <label><input type="checkbox" name="is_discharged" checked={form.is_discharged} onChange={(e) => setForm({...form, is_discharged: e.target.checked, discharge_date: e.target.checked && !form.discharge_date ? new Date().toISOString().slice(0,10) : form.discharge_date})} /> Discharged</label>
        {form.is_discharged && <input type="date" name="discharge_date" value={form.discharge_date} onChange={handleChange} />}

        <button onClick={addResident}>
          Add Resident
        </button>

      </div>

      {/* ================= PREDICTION FORM ================= */}
      {predictionForm.resident_id && (
        <div style={{ display: "grid", gap: 10, marginTop: 20, border: "1px solid #ccc", padding: 10 }}>
          <h3>Run AI Prediction for Resident ID: {predictionForm.resident_id}</h3>
          <label><input type="checkbox" name="aggression" checked={predictionForm.aggression} onChange={handlePredictionChange} /> Aggression</label>
          <label><input type="checkbox" name="hyperactivity" checked={predictionForm.hyperactivity} onChange={handlePredictionChange} /> Hyperactivity</label>
          <label><input type="checkbox" name="anxiety" checked={predictionForm.anxiety} onChange={handlePredictionChange} /> Anxiety</label>
          <label><input type="checkbox" name="social_withdrawal" checked={predictionForm.social_withdrawal} onChange={handlePredictionChange} /> Social Withdrawal</label>
          <label><input type="checkbox" name="sleep_problems" checked={predictionForm.sleep_problems} onChange={handlePredictionChange} /> Sleep Problems</label>
          <label><input type="checkbox" name="communication_difficulty" checked={predictionForm.communication_difficulty} onChange={handlePredictionChange} /> Communication Difficulty</label>
          <label><input type="checkbox" name="repetitive_behavior" checked={predictionForm.repetitive_behavior} onChange={handlePredictionChange} /> Repetitive Behavior</label>
          <label><input type="checkbox" name="emotional_instability" checked={predictionForm.emotional_instability} onChange={handlePredictionChange} /> Emotional Instability</label>
          <button onClick={runPrediction}>Run Prediction</button>
          <button onClick={() => setPredictionForm({ ...predictionForm, resident_id: null })}>Cancel</button>
        </div>
      )}

      {/* ================= PROGRESS UPDATE FORM ================= */}
      {selectedResident && (
        <div style={{ display: "grid", gap: 10, marginTop: 20, border: "2px solid #007bff", padding: 15 }}>
          <h3>Update Progress - {selectedResident.full_name}</h3>
          <div>
            <label>Current Progress Level:</label>
            <select value={selectedResident.progress || selectedResident.status || "Initial"} onChange={(e) => {
                const newProgress = e.target.value;
                setSelectedResident({
                  ...selectedResident,
                  progress: newProgress,
                  is_discharged: newProgress === "Ready for Discharge" ? true : selectedResident.is_discharged,
                  discharge_date: newProgress === "Ready for Discharge" && !selectedResident.discharge_date ? new Date().toISOString().slice(0,10) : selectedResident.discharge_date,
                });
              }}>
              <option value="Initial">Initial</option>
              <option value="Early">Early</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Ready for Discharge">Ready for Discharge</option>
            </select>
          </div>
          <div>
            <label><input type="checkbox" checked={selectedResident.is_discharged || false} onChange={(e) => setSelectedResident({...selectedResident, is_discharged: e.target.checked, discharge_date: e.target.checked && !selectedResident.discharge_date ? new Date().toISOString().slice(0,10) : selectedResident.discharge_date})} /> Mark as Discharged</label>
          </div>
          {selectedResident.is_discharged && (
            <div>
              <label>Discharge Date:</label>
              <input type="date" value={selectedResident.discharge_date || ""} onChange={(e) => setSelectedResident({...selectedResident, discharge_date: e.target.value})} />
            </div>
          )}
          <button onClick={async () => {
            try {
              await API.post("/update-progress", {
                resident_id: selectedResident.id,
                progress: selectedResident.progress,
                is_discharged: selectedResident.is_discharged,
                discharge_date: selectedResident.discharge_date
              });
              alert("Progress updated successfully");
              setSelectedResident(null);
              fetchResidents();
            } catch (err) {
              console.log(err);
              alert("Failed to update progress");
            }
          }}>Save Progress</button>
          <button onClick={() => setSelectedResident(null)}>Cancel</button>
        </div>
      )}

      {/* ================= BUTTONS ================= */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>

        <button onClick={downloadAll}>
          Download All Reports
        </button>

      </div>

      {/* ================= TABLE ================= */}
      <table border="1" cellPadding="10" style={{ marginTop: 20, width: "100%" }}>

        <thead>
          <tr>
            <th>Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Diagnosis</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Discharge Date</th>
            <th>AI Prediction</th>
            <th>Recommendations</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {filteredResidents && filteredResidents.length > 0 ? filteredResidents.map((r) => (

            <tr key={r.id}>

              <td>{r.full_name}</td>
              <td>{r.gender}</td>
              <td>{r.age}</td>
              <td>{r.diagnosis || "N/A"}</td>
              <td>{getResidentProgress(r)}</td>
              <td>{getResidentStatus(r)}</td>
              <td>{r.discharge_date || "N/A"}</td>
              <td>{predictions[r.id] ? `${predictions[r.id].prediction.join(", ")} (${predictions[r.id].risk_level})` : "Not run"}</td>
              <td>{predictions[r.id]?.recommended_intervention ? predictions[r.id].recommended_intervention.join(", ") : "N/A"}</td>

              <td>
                <button onClick={() => startPrediction(r.id)}>
                  Run AI Prediction
                </button>
                <button onClick={() => setSelectedResident({
                  ...r,
                  progress: r.progress || r.status || "Initial",
                  is_discharged: typeof r.is_discharged === "boolean" ? r.is_discharged : false,
                  discharge_date: r.discharge_date || ""
                })}>
                  Update Progress
                </button>
                <button onClick={() => downloadSingle(r)}>
                  Download Report
                </button>
              </td>

            </tr>

          )) : (
            <tr>
              <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                No residents found. Try a different search term or add a new resident.
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}