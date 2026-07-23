import { useEffect, useState } from "react";
import { getMyRecords } from "../../services/PatientApi";
import "./MyRecords.css";

function MyRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await getMyRecords();

        console.log(res.data);

        setRecords(res.data.records);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load medical records.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <div className="records-container">
        <h1>My Medical Records</h1>
        <p>Loading medical records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="records-container">
        <h1>My Medical Records</h1>
        <p role="alert">{error}</p>
      </div>
    );
  }

  return (
    <div className="records-container">
      <h1>My Medical Records</h1>

      {records.length === 0 ? (
        <p>No Medical Records Found</p>
      ) : (
        records.map((record, index) => (
          <div className="record-card" key={index}>
            <div className="record-diagnosis-box">
              <strong>Diagnosis</strong>
              <h2>{record.diagnosis}</h2>
              {!!record.diagnosisCategories?.length && (
                <div className="record-diagnosis-tags">
                  {record.diagnosisCategories.map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>
              )}
              {record.otherDiagnosisDetails && (
                <p>
                  <strong>Other:</strong> {record.otherDiagnosisDetails}
                </p>
              )}
            </div>
            <p>
              <strong>Complaint :</strong> {record.complaint}
            </p>
            <p>
              <strong>Medicines :</strong> {record.medicines}
            </p>
            <p>
              <strong>Advice :</strong> {record.advice}
            </p>
            <p>
              <strong>Consultation :</strong> {record.consultationType}
            </p>
            <p>
              <strong>Status :</strong> {record.status}
            </p>
            <p>
              <strong>Visit Date :</strong> {record.visitDate}
            </p>
            <p>
              <strong>Follow Up :</strong> {record.followUpDate}
            </p>
            <p>
              <strong>Doctor :</strong>{" "}
              {record.Doctor?.fullName || "Not available"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyRecords;
