import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginStudent } from "../../services/StudentApi";
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
      const response = await loginStudent({ collegeEmail: email, password });
      localStorage.removeItem("doctorToken");
      localStorage.removeItem("patientToken");
      localStorage.removeItem("govToken");
      localStorage.setItem("studentToken", response.data.token);
      navigate("/student/dashboard", { replace: true });
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
      <Link to="/" className="auth-back">← Back to role selection</Link><p className="auth-kicker">CARE CONTRIBUTOR</p><h1>Student sign in</h1><p>Continue supporting patients through AYUSH.</p>
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
          New student? <Link to="/student/register">Create an account</Link>
        </p>
      </form></section></main>
  );
}

export default Login;
