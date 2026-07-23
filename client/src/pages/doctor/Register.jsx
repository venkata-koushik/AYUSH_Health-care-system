import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerDoctor } from "../../services/DoctorApi";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    governmentLicenseId: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) =>
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...payload } = formData;
      await registerDoctor(payload);
      navigate("/doctor/login", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to register the doctor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="registration-page">
      <form className="registration-card" onSubmit={handleSubmit}>
        <p className="registration-kicker">AYUSH Digital Health Portal</p>
        <h1>Doctor registration</h1>
        <p className="registration-subtitle">
          Create your verified clinical workspace account.
        </p>
        <div className="registration-grid">
          <label>
            Full name
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </label>
          <label>
            Government license ID
            <input
              name="governmentLicenseId"
              value={formData.governmentLicenseId}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Phone number
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </label>
          <label className="registration-full">
            Clinic address{" "}
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Optional"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="8"
              required
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="8"
              required
            />
          </label>
        </div>
        {error && (
          <p className="registration-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="registration-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create doctor account"}
        </button>
        <p className="registration-footer">
          Already registered? <Link to="/doctor/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
