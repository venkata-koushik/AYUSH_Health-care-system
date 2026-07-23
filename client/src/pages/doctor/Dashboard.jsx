import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDoctorProfile } from "../../services/DoctorApi";

function Dashboard() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const res = await getDoctorProfile();
        setDoctor(res.data.doctor);
      } catch (error) {
        console.error(error);
      }
    };
    loadDoctor();
  }, []);

  const logout = () => {
    localStorage.removeItem("doctorToken");
    navigate("/doctor/login");
  };

  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {doctor?.fullName}</h1>
          <p>Government License : {doctor?.governmentLicenseId}</p>
          <p>{doctor?.email}</p>
          <p>{doctor?.phoneNumber}</p>
        </div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>
      <div className="dashboard-cards">
        <Link to="/doctor/profile" className="dashboard-card">
          <h2>👨‍⚕️ My Profile</h2>
          <p>View your information</p>
        </Link>
        <Link to="/doctor/my-patients" className="dashboard-card">
          <h2>🩺 My Patients</h2>
          <p>View all treated patients</p>
        </Link>
        <Link to="/doctor/search" className="dashboard-card">
          <h2>🔍 Search Patient</h2>
          <p>Search by UHID</p>
        </Link>
        <Link to="/doctor/scan" className="dashboard-card">
          <h2>📷 QR Scanner</h2>
          <p>Scan Patient QR</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
