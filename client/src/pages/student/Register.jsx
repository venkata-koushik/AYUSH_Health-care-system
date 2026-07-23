import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent } from "../../services/StudentApi";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    instituteName: "",
    collegeEmail: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    languages: [],
  });

  const languageOptions = [
    "English",
    "Hindi",
    "Telugu",
    "Tamil",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Bengali",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLanguage = (language) => {
    setFormData((prev) => {
      const exists = prev.languages.includes(language);
      return {
        ...prev,
        languages: exists
          ? prev.languages.filter((item) => item !== language)
          : [...prev.languages, language],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.languages.length === 0) {
      alert("Please select at least one language");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        instituteName: formData.instituteName,
        collegeEmail: formData.collegeEmail,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        languages: formData.languages,
      };

      const res = await registerStudent(payload);
      alert(res.data.message || "Registration Successful!");
      navigate("/student/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-register">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Student Registration</h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="instituteName"
          placeholder="College / Institute"
          value={formData.instituteName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="collegeEmail"
          placeholder="College Email"
          value={formData.collegeEmail}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <h3>Select Languages</h3>
        <div className="language-grid">
          {languageOptions.map((language) => (
            <label key={language} className="language-option">
              <input
                type="checkbox"
                checked={formData.languages.includes(language)}
                onChange={() => handleLanguage(language)}
              />
              {language}
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p>
          Already Registered? <Link to="/student/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
