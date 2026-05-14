import { Link } from "react-router-dom";

export default function Sidebar() {

  return (
    <div
      style={{
        width: 250,
        background: "#111827",
        color: "white",
        padding: 20,
      }}
    >

      <h2>Clinical AI</h2>

      <nav
        style={{
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          gap: 15,
        }}
      >

        <Link style={linkStyle} to="/">
          Dashboard
        </Link>

        <Link style={linkStyle} to="/history">
          Prediction History
        </Link>

        <Link style={linkStyle} to="/residents">
          Residents
        </Link>

      </nav>

    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: 10,
  background: "#1f2937",
  borderRadius: 5,
};