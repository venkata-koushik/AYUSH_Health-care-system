import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getProfile,
  getMyRecords,
  getCurrentRequest,
} from "../../services/PatientApi";

function Dashboard() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [latestVisit, setLatestVisit] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const notifications = [];
  if (currentRequest?.status && currentRequest.status !== "None")
    notifications.push({
      icon: "◌",
      text: `Your ${currentRequest.consultationType?.toLowerCase() || "consultation"} request is ${currentRequest.status.toLowerCase()}.`,
      link: "/consultation/history",
    });
  if (latestVisit)
    notifications.push({
      icon: "✚",
      text: "A new or recent EHR is available in your medical records.",
      link: "/patient/records",
    });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, recordsRes, requestRes] = await Promise.all([
          getProfile(),
          getMyRecords(),
          getCurrentRequest(),
        ]);

        setPatient(profileRes.data.patient);
        setLatestVisit(recordsRes.data.records?.[0] || null);
        setCurrentRequest(requestRes.data);
      } catch (error) {
        console.error(error);
        setError(
          error.response?.data?.message || "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("patientToken");
    navigate("/patient/login");
  };

  return (
    <div className="patient-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">YOUR HEALTH SPACE</p>
          <h1>{patient?.fullName || "Patient"}</h1>
          <p className="dashboard-subtitle">
            UHID: {patient?.uhid || "Not available"}
          </p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="notifications-panel" aria-label="Notifications">
        <div className="notification-title">
          <span>Notifications</span>
          <small>
            {notifications.length
              ? `${notifications.length} updates`
              : "All caught up"}
          </small>
        </div>
        {loading ? (
          <p className="notification-empty">Checking for updates…</p>
        ) : notifications.length ? (
          notifications.map((item, index) => (
            <Link key={index} to={item.link} className="notification-item">
              <span>{item.icon}</span>
              {item.text}
              <b>→</b>
            </Link>
          ))
        ) : (
          <p className="notification-empty">
            No new updates. We’ll remind you here when your request changes or a
            record is created.
          </p>
        )}
      </section>

      <div className="cards">
        <Link to="/patient/profile" className="card">
          <h2>👤 Profile</h2>
          <p>View your personal information</p>
        </Link>

        <Link to="/patient/records" className="card">
          <h2>📋 Medical Records</h2>
          <p>View previous consultations</p>
        </Link>

        <Link to="/patient/qr" className="card">
          <h2>📱 My QR</h2>
          <p>Show your healthcare QR</p>
        </Link>

        <Link to="/consultation/create" className="card">
          <h2>🩺 Request Consultation</h2>
          <p>Ask a medical student for help</p>
        </Link>

        <Link to="/consultation/history" className="card">
          <h2>🕘 Consultation History</h2>
          <p>View student consultation requests</p>
        </Link>
        <Link to="/patient/ai-guide" className="card card-featured">
          <h2>✦ AYUSH Care Guide</h2>
          <p>Get safe general health guidance anytime</p>
        </Link>
      </div>

      <div className="status-section">
        <div className="status-card">
          <h2>Current Request</h2>
          {loading ? (
            <p>Loading request status...</p>
          ) : error ? (
            <p>{error}</p>
          ) : currentRequest?.status === "None" ? (
            <p>No active request</p>
          ) : (
            <>
              <p>
                <strong>Type:</strong> {currentRequest.consultationType}
              </p>
              <p>
                <strong>Status:</strong> {currentRequest.status}
              </p>
              {currentRequest.requestId && (
                <p>
                  <strong>Request ID:</strong> {currentRequest.requestId}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Consultation</h2>
          <Link to="/patient/records" className="view-all-link">
            View all records
          </Link>
        </div>

        {latestVisit ? (
          <div className="recent-card">
            <p>
              <strong>Doctor:</strong>{" "}
              {latestVisit.Doctor?.fullName || "Unknown"}
            </p>
            <p>
              <strong>Diagnosis:</strong>{" "}
              {latestVisit.diagnosis || "Not available"}
            </p>
            <p>
              <strong>Medicines:</strong>{" "}
              {latestVisit.medicines || "Not available"}
            </p>
            <p>
              <strong>Date:</strong> {latestVisit.visitDate || "Not available"}
            </p>
          </div>
        ) : (
          <div className="recent-card-empty-card">
            <p>No recent consultations yet.</p>
            <p>
              Whenever your doctor updates your record, the latest visit will
              appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
