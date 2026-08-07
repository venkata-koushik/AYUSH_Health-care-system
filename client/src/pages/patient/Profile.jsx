import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../../services/PatientApi";
import "./Profile.css";
import { SkeletonList } from "../../components/Skeleton";

function Profile() {
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then((response) => setPatient(response.data.patient))
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your profile.",
        );
      });
  }, []);

  if (error)
    return (
      <div className="profile-page">
        <p className="error-text" role="alert">
          {error}
        </p>
      </div>
    );
  if (!patient)
    return (
      <div className="profile-page">
        <SkeletonList count={1} lines={6} label="Loading profile" />
      </div>
    );

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link className="back-link" to="/patient/dashboard">
          ← Back to dashboard
        </Link>
        <h1>My Profile</h1>
        <div className="profile-grid">
          <div className="profile-item">
            <span>Full Name</span>
            <p>{patient.fullName}</p>
          </div>
          <div className="profile-item">
            <span>UHID</span>
            <p>{patient.uhid}</p>
          </div>
          <div className="profile-item">
            <span>Email</span>
            <p>{patient.email}</p>
          </div>
          <div className="profile-item">
            <span>Phone</span>
            <p>{patient.phoneNumber}</p>
          </div>
          <div className="profile-item">
            <span>Blood Group</span>
            <p>{patient.bloodgroup || "Not provided"}</p>
          </div>
          <div className="profile-item">
            <span>Gender</span>
            <p>{patient.gender || "Not provided"}</p>
          </div>
          <div className="profile-item">
            <span>Allergies</span>
            <p>{patient.allergies || "None recorded"}</p>
          </div>
          <div className="profile-item">
            <span>Chronic Conditions</span>
            <p>{patient.chronicConditions || "None recorded"}</p>
          </div>
          <div className="profile-item">
            <span>Address</span>
            <p>{patient.address || "Not available"}</p>
          </div>
          <div className="profile-item">
            <span>Preferred Language</span>
            <p>{patient.preferredLanguage || "Not available"}</p>
          </div>
          <div className="profile-item">
            <span>State</span>
            <p>{patient.state || "Not available"}</p>
          </div>
          <div className="profile-item">
            <span>District</span>
            <p>{patient.district || "Not available"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
