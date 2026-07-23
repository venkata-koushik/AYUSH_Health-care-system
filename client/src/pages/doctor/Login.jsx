import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginDoctor } from "../../services/DoctorApi";
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
      const response = await loginDoctor({ email, password });
      localStorage.removeItem("patientToken");
      localStorage.removeItem("studentToken");
      localStorage.removeItem("govToken");
      localStorage.setItem("doctorToken", response.data.token);
      navigate("/doctor/workspace", { replace: true });
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
    <main className="auth-page"><section className="auth-card">
      <Link to="/" className="auth-back">← Back to role selection</Link><p className="auth-kicker">CLINICAL WORKSPACE</p><h1>Doctor sign in</h1><p>Access your verified clinical workspace securely.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="auth-switch">
          New doctor? <Link to="/doctor/register">Create an account</Link>
        </p>
      </form></section></main>
  );
}

export default Login;
