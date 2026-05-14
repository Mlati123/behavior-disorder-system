import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Residents from "./pages/Residents";
import ResidentReport from "./pages/ResidentReport";

export default function App() {

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          padding: 20,
        }}
      >

        <Routes>

          {/* DASHBOARD */}
          <Route path="/" element={<Dashboard />} />

          {/* HISTORY */}
          <Route path="/history" element={<History />} />

          {/* RESIDENTS LIST */}
          <Route path="/residents" element={<Residents />} />

          {/* INDIVIDUAL RESIDENT REPORT */}
          <Route path="/resident/:id" element={<ResidentReport />} />

        </Routes>

      </div>

    </div>
  );
}