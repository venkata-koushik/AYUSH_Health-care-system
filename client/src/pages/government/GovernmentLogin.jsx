import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginGovernment } from "../../services/GovernmentApi";
import "./GovernmentDashboard.css";

export default function GovernmentLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await loginGovernment(credentials);
      localStorage.setItem("govToken", response.data.token);
      navigate("/gov/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="gov-login-page">
      <form className="gov-login-card" onSubmit={submit}>
        <span className="login-emblem">✚</span>
        <p>Government of India</p>
        <h1>Official access</h1>
        <span>National Digital Health Monitoring Portal</span>
        <label>
          Username
          <input
            autoComplete="username"
            value={credentials.username}
            onChange={(event) =>
              setCredentials({ ...credentials, username: event.target.value })
            }
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials({ ...credentials, password: event.target.value })
            }
            required
          />
        </label>
        {error && <div className="gov-error">{error}</div>}
        <button disabled={loading}>
          {loading ? "Signing in…" : "Sign in securely"}
        </button>
        <small>Authorised government personnel only.</small>
      </form>
    </main>
  );
}
