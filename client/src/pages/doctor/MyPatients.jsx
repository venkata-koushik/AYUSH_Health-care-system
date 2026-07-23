import "./MyPatients.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPatients } from "../../services/DoctorApi";

function MyPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await getMyPatients();
        setPatients(res.data.patients);
      } catch (error) {
        console.error(error);
      }
    };
    loadPatients();
  }, []);

  return (
    <div className="patients-container">
      <h1>My Patients</h1>
      {patients.length === 0 ? (
        <h3>No Patients Found</h3>
      ) : (
        <div className="patient-grid">
          {patients.map((patient) => (
            <div className="patient-card" key={patient.id}>
              <h2>{patient.fullName}</h2>
              <p>
                <strong>UHID :</strong> {patient.uhid}
              </p>
              <p>
                <strong>Phone :</strong> {patient.phoneNumber}
              </p>
              <p>
                <strong>Email :</strong> {patient.email}
              </p>
              <button
                onClick={() => navigate(`/doctor/patient/${patient.uhid}`)}
              >
                View Patient
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPatients;
