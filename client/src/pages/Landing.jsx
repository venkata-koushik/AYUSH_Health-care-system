import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Landing.css";

const roles = [
  { id: "doctor", icon: "⚕", title: "Doctor", text: "Clinical workspace" },
  { id: "patient", icon: "✚", title: "Patient", text: "My health records" },
  { id: "student", icon: "◈", title: "Student", text: "Care contributor" },
];

export default function Landing() {
  const [selected, setSelected] = useState("patient");
  const navigate = useNavigate();
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <span className="brand-mark">✚</span>
        <span className="brand-name">
          AYUSH <small>Digital Health</small>
        </span>
        <Link to="/gov/login">Government portal</Link>
      </nav>
      <section className="landing-hero">
        <div>
          <p className="hero-kicker">CONNECTED • SECURE • HUMAN</p>
          <h1>
            Care that stays
            <br />
            <em>close to you.</em>
          </h1>
          <p className="hero-copy">
            A secure digital health space for patients, clinicians and student
            care teams.
          </p>
        </div>
        <div className="role-picker">
          <p className="picker-label">SELECT YOUR ROLE</p>
          <div className="role-grid">
            {roles.map((role) => (
              <button
                key={role.id}
                className={
                  selected === role.id ? "role-choice active" : "role-choice"
                }
                onClick={() => setSelected(role.id)}
              >
                <span>{role.icon}</span>
                <strong>{role.title}</strong>
                <small>{role.text}</small>
              </button>
            ))}
          </div>
          <button
            className="continue-button"
            onClick={() => navigate(`/${selected}/login`)}
          >
            Continue as {roles.find((role) => role.id === selected).title} →
          </button>
          <p className="new-user">
            New here?{" "}
            <Link to={`/${selected}/register`}>Create your account</Link>
          </p>
        </div>
      </section>
      <footer className="landing-footer">
        Your health data is protected and accessible only to authorized users.
      </footer>
    </main>
  );
}
