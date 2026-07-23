import "./CreateEHR.css";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEHR } from "../../services/ehrApi";

const DIAGNOSIS_CATEGORIES = [
  "Respiratory",
  "Gastrointestinal",
  "Musculoskeletal",
  "Neurological",
  "Dermatological",
  "Cardiovascular",
  "Endocrine",
  "Genitourinary",
  "ENT",
  "Ophthalmic",
  "Mental Health",
  "General / Other",
];

function CreateEHR() {
  const navigate = useNavigate();
  const { uhid } = useParams();
  const [formData, setFormData] = useState({
    complaint: "",
    diagnosis: "",
    diagnosisCategories: [],
    otherDiagnosisDetails: "",
    medicines: "",
    advice: "",
    consultationType: "Ayurveda",
    followUpDate: "",
    status: "Open",
    doctorSignature: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleDiagnosisCategory = (category) => {
    setFormData((previous) => {
      const selected = previous.diagnosisCategories.includes(category);
      return {
        ...previous,
        diagnosisCategories: selected
          ? previous.diagnosisCategories.filter((item) => item !== category)
          : [...previous.diagnosisCategories, category],
        otherDiagnosisDetails:
          category === "General / Other" && selected
            ? ""
            : previous.otherDiagnosisDetails,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEHR({
        uhid,
        ...formData,
      });
      alert("EHR Created Successfully");
      navigate(`/doctor/patient/${uhid}`);
    } catch (error) {
      console.error(error);
      alert("Unable to create EHR");
    }
  };

  return (
    <div className="ehr-container">
      <form className="ehr-card" onSubmit={handleSubmit}>
        <h1>Create Electronic Health Record</h1>
        <div className="section">
          <h2>Consultation Details</h2>
          <label>Complaint / Problem</label>
          <textarea
            rows="3"
            name="complaint"
            value={formData.complaint}
            onChange={handleChange}
          />
          <label>Diagnosis</label>
          <input
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Provisional diagnosis or differential diagnosis"
          />
          <p className="ehr-field-help">
            Choose every applicable category. AI suggestions must be reviewed by
            the doctor.
          </p>
          <div className="ehr-diagnosis-category-list">
            {DIAGNOSIS_CATEGORIES.map((category) => (
              <button
                type="button"
                key={category}
                className={`ehr-diagnosis-category ${formData.diagnosisCategories.includes(category) ? "selected" : ""}`}
                aria-pressed={formData.diagnosisCategories.includes(category)}
                onClick={() => toggleDiagnosisCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          {formData.diagnosisCategories.includes("General / Other") && (
            <input
              name="otherDiagnosisDetails"
              value={formData.otherDiagnosisDetails}
              onChange={handleChange}
              required
              placeholder="Describe the other diagnosis category"
            />
          )}
        </div>
        <div className="section">
          <h2>Treatment</h2>
          <label>Medicines</label>
          <textarea
            rows="3"
            name="medicines"
            value={formData.medicines}
            onChange={handleChange}
          />
          <label>Advice</label>
          <textarea
            rows="3"
            name="advice"
            value={formData.advice}
            onChange={handleChange}
          />
        </div>
        <div className="section">
          <h2>Consultation Information</h2>
          <label>Consultation Type</label>
          <select
            name="consultationType"
            value={formData.consultationType}
            onChange={handleChange}
          >
            <option>Ayurveda</option>
            <option>Yoga</option>
            <option>Naturopathy</option>
            <option>Siddha</option>
            <option>Unani</option>
            <option>Homeopathy</option>
          </select>
          <label>Follow Up Date</label>
          <input
            type="date"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
          />
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option>Open</option>
            <option>Closed</option>
          </select>
          <label>Doctor Signature</label>
          <input
            type="text"
            name="doctorSignature"
            value={formData.doctorSignature}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Save EHR</button>
      </form>
    </div>
  );
}

export default CreateEHR;
