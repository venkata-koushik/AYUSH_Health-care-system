import "./Profile.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctorProfile } from "../../services/DoctorApi";

function Profile() {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getDoctorProfile();
        setDoctor(res.data.doctor);
      } catch (error) {
        console.error(error);
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <Link className="back-link" to="/doctor/workspace">
          ← Back to workspace
        </Link>
        <h1>Doctor Profile</h1>
        <div className="profile-item">
          <span>Full Name</span>
          <p>{doctor?.fullName}</p>
        </div>
        <div className="profile-item">
          <span>Government License ID</span>
          <p>{doctor?.governmentLicenseId}</p>
        </div>
        <div className="profile-item">
          <span>Email</span>
          <p>{doctor?.email}</p>
        </div>
        <div className="profile-item">
          <span>Phone Number</span>
          <p>{doctor?.phoneNumber}</p>
        </div>
        <div className="profile-item">
          <span>Address</span>
          <p>{doctor?.address}</p>
        </div>
        <Link className="edit-btn" to="/doctor/edit-profile">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

export default Profile;
