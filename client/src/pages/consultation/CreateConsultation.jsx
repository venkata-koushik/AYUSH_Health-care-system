import "./CreateConsultation.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createChatRequest,
  createVideoRequest,
} from "../../services/PatientApi";

function CreateConsultation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    consultationType: "Chat",
    complaint: "",
    duration: "",
    severity: "Mild",
    languages: ["English"],
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleLanguage = (language) => {
    setFormData((current) => ({
      ...current,
      languages: current.languages.includes(language)
        ? current.languages.filter((item) => item !== language)
        : [...current.languages, language],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.languages.length === 0) {
      setError("Select at least one preferred language.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response =
        formData.consultationType === "Chat"
          ? await createChatRequest(formData)
          : await createVideoRequest(formData);

      localStorage.setItem(
        "consultationRequest",
        JSON.stringify({
          requestId: response.data.request.id,
          consultationType: formData.consultationType,
        }),
      );

      navigate("/consultation/waiting");
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Unable to send consultation request.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultation-container">
      <form className="consultation-card" onSubmit={handleSubmit}>
        <h1>Student Consultation</h1>
        <p>Connect with an AYUSH Medical Student.</p>
        {error && <p role="alert">{error}</p>}

        <label>Consultation Type</label>
        <select
          name="consultationType"
          value={formData.consultationType}
          onChange={handleChange}
        >
          <option value="Chat">Chat Consultation</option>
          <option value="Video">Video Consultation</option>
        </select>

        <fieldset className="language-selector">
          <legend>Preferred Languages</legend>
          <p>Select every language you are comfortable using.</p>
          <div className="language-grid">
            {languageOptions.map((language) => (
              <label key={language} className="language-option">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(language)}
                  onChange={() => toggleLanguage(language)}
                />
                {language}
              </label>
            ))}
          </div>
        </fieldset>

        <label>Duration</label>
        <input
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="Example : 3 Days"
          required
        />

        <label>Severity</label>
        <select
          name="severity"
          value={formData.severity}
          onChange={handleChange}
        >
          <option>Mild</option>
          <option>Moderate</option>
          <option>Severe</option>
        </select>

        <label>Complaint</label>
        <textarea
          rows="5"
          name="complaint"
          value={formData.complaint}
          onChange={handleChange}
          placeholder="Describe your symptoms..."
          required
        />

        <button disabled={loading}>
          {loading ? "Submitting..." : "Request Consultation"}
        </button>
      </form>
    </div>
  );
}

export default CreateConsultation;
