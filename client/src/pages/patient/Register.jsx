import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerPatient } from "../../services/PatientApi";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    aadhaarNumber: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    bloodgroup: "",
    allergies: "",
    chronicConditions: "",
    address: "",
    preferredLanguage: "English",
    state: "",
    district: "",
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
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");
    try {
      setLoading(true);
      const { confirmPassword, ...payload } = formData;
      await registerPatient(payload);
      navigate("/patient/login", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to register the patient.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="patient-registration-page">
      <form className="patient-registration-card" onSubmit={handleSubmit}>
        <p className="patient-registration-kicker">
          AYUSH Digital Health Portal
        </p>
        <h1>Patient registration</h1>
        <p>
          Create your secure health record and receive a UHID after
          registration.
        </p>
        <div className="patient-registration-grid">
          <label>
            Full name
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Aadhaar number
            <input
              name="aadhaarNumber"
              inputMode="numeric"
              pattern="[0-9]{12}"
              maxLength="12"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              required
            />
          </label>
          <label>
            Date of birth
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Gender
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
            </select>
          </label>
          <label>
            Blood group
            <select
              name="bloodgroup"
              value={formData.bloodgroup}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                (group) => (
                  <option key={group}>{group}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Preferred language
            <input
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
            />
          </label>
          <label>
            State
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder="e.g. Karnataka"
            />
          </label>
          <label>
            District
            <input
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              placeholder="e.g. Bengaluru Urban"
            />
          </label>
          <label>
            Allergies
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows="2"
              placeholder="None known"
            />
          </label>
          <label className="patient-registration-full">
            Chronic conditions
            <textarea
              name="chronicConditions"
              value={formData.chronicConditions}
              onChange={handleChange}
              rows="2"
              placeholder="None known"
            />
          </label>
          <label className="patient-registration-full">
            Address
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
              minLength="8"
              required
            />
          </label>
        </div>
        {error && (
          <p className="patient-registration-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create patient account"}
        </button>
        <p className="patient-registration-footer">
          Already registered? <Link to="/patient/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
