import "./PatientDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPatientDetails } from "../../services/DoctorApi";
import { SkeletonList } from "../../components/Skeleton";

function PatientDetails() {
  const { uhid } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [recentVisits, setRecentVisits] = useState([]);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const res = await getPatientDetails(uhid);
        setPatient(res.data.patient);
        setRecentVisits(res.data.recentVisits);
      } catch (error) {
        console.error(error);
      }
    };
    loadPatient();
  }, [uhid]);

  if (!patient) {
    return (
      <div className="patient-details-container">
        <SkeletonList count={1} lines={6} label="Loading patient" />
      </div>
    );
  }

  return (
    <div className="patient-details-container">
      <div className="patient-card">
        <h1>{patient.fullName}</h1>
        <p>
          <strong>UHID :</strong> {patient.uhid}
        </p>
        <p>
          <strong>Phone :</strong> {patient.phoneNumber}
        </p>
        <p>
          <strong>Email :</strong> {patient.email}
        </p>
        <p>
          <strong>Blood Group :</strong> {patient.bloodgroup}
        </p>
        <p>
          <strong>Allergies :</strong> {patient.allergies}
        </p>
        <p>
          <strong>Chronic Conditions :</strong> {patient.chronicConditions}
        </p>
        <p>
          <strong>Address :</strong> {patient.address}
        </p>
        <button
          className="ehr-btn"
          onClick={() => navigate(`/doctor/create-ehr/${patient.uhid}`)}
        >
          Create EHR
        </button>
      </div>
      <div className="history-card">
        <h2>Recent Visits</h2>
        {recentVisits.length === 0 ? (
          <p>No Previous Visits</p>
        ) : (
          recentVisits.map((visit, index) => (
            <div className="visit-card" key={index}>
              <div className="visit-diagnosis-box">
                <strong>Diagnosis</strong>
                <h3>{visit.diagnosis}</h3>
                {!!visit.diagnosisCategories?.length && (
                  <div className="visit-diagnosis-tags">
                    {visit.diagnosisCategories.map((category) => (
                      <span key={category}>{category}</span>
                    ))}
                  </div>
                )}
                {visit.otherDiagnosisDetails && (
                  <p>
                    <strong>Other:</strong> {visit.otherDiagnosisDetails}
                  </p>
                )}
              </div>
              <p>
                <strong>Complaint :</strong> {visit.complaint}
              </p>
              <p>
                <strong>Medicines :</strong> {visit.medicines}
              </p>
              <p>
                <strong>Advice :</strong> {visit.advice}
              </p>
              <p>
                <strong>Date :</strong> {visit.visitDate}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PatientDetails;
