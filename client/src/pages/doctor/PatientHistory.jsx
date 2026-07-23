import "./PatientHistory.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientHistory } from "../../services/DoctorApi";

function PatientHistory() {
  const { uhid } = useParams();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getPatientHistory(uhid);
        setHistory(res.data.records);
      } catch (error) {
        console.error(error);
      }
    };
    loadHistory();
  }, [uhid]);

  return (
    <div className="timeline-container">
      <h1>Patient Medical History</h1>
      {history.length === 0 ? (
        <h3>No Previous Records</h3>
      ) : (
        history.map((record, index) => (
          <div className="timeline-card" key={index}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-diagnosis-box">
                <strong>Diagnosis</strong>
                <h2>{record.diagnosis}</h2>
                {!!record.diagnosisCategories?.length && (
                  <div className="timeline-diagnosis-tags">
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
                <strong>Visit :</strong> {record.visitDate}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PatientHistory;
