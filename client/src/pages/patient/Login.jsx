import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginPatient } from "../../services/PatientApi";
import "./Login.css";
import "../Auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginPatient({ email, password });
      localStorage.removeItem("doctorToken");
      localStorage.removeItem("studentToken");
      localStorage.removeItem("govToken");
      localStorage.setItem("patientToken", response.data.token);
      navigate("/patient/dashboard", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <Link to="/" className="auth-back">
          ← Back to role selection
        </Link>
        <p className="auth-kicker">YOUR HEALTH SPACE</p>
        <h1>Patient Login</h1>
        <p className="page-subtitle">Secure access to your health records.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          <p className="registration-link">
            New patient? <Link to="/patient/register">Create an account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;
