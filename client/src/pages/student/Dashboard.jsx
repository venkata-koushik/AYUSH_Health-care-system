import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getStudentDashboard } from "../../services/StudentApi";
import { SkeletonList } from "../../components/Skeleton";

function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);

  const loadDashboard = async () => {
    try {
      const res = await getStudentDashboard();
      setDashboard(res.data.dashboard);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      alert("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem("studentToken");
    navigate("/student/login");
  };

  if (!dashboard) {
    return (
      <div className="student-dashboard">
        <SkeletonList count={3} lines={2} label="Loading dashboard" />
      </div>
    );
  }

  // Personal details are nested inside 'student' object
  const student = dashboard.student;
  const chatSessions = dashboard.chatSessions ?? student.completedChats ?? 0;
  const videoSessions =
    dashboard.videoSessions ?? student.completedVideoCalls ?? 0;
  const doctorReferrals =
    dashboard.doctorReferrals ?? student.doctorReferrals ?? 0;
  const averageRating = dashboard.averageRating ?? student.averageRating ?? 0;
  const languages = student.languages ?? [];

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {student.name}</h1>
          <p>{student.instituteName}</p>
          <p>{student.collegeEmail}</p>
          <p>{student.phoneNumber}</p>
        </div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="student-notifications" aria-label="Notifications">
        <div><strong>Notifications</strong><span>{(dashboard.pendingChatRequests || 0) + (dashboard.pendingVideoRequests || 0)} pending</span></div>
        {(dashboard.pendingChatRequests || 0) > 0 && <Link to="/student/chat-request">💬 {dashboard.pendingChatRequests} new chat request{dashboard.pendingChatRequests > 1 ? "s" : ""} waiting for your response <b>→</b></Link>}
        {(dashboard.pendingVideoRequests || 0) > 0 && <Link to="/student/video-request">🎥 {dashboard.pendingVideoRequests} new video request{dashboard.pendingVideoRequests > 1 ? "s" : ""} waiting for your response <b>→</b></Link>}
        {!dashboard.pendingChatRequests && !dashboard.pendingVideoRequests && <p>No new requests right now. New consultation requests will appear here.</p>}
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <h2>{dashboard.patientsHelped ?? 0}</h2>
          <p>Patients Helped</p>
        </div>
        <div className="stat-card">
          <h2>{chatSessions}</h2>
          <p>Completed Chats</p>
        </div>
        <div className="stat-card">
          <h2>{videoSessions}</h2>
          <p>Video Consultations</p>
        </div>
        <div className="stat-card">
          <h2>{doctorReferrals}</h2>
          <p>Doctor Referrals</p>
        </div>
        <div className="stat-card">
          <h2>{(Number(averageRating) || 0).toFixed(1)}</h2>
          <p>Average Rating ({student.totalReviews || 0} reviews)</p>
        </div>
        <Link to="/student/leaderboard" decoration="none" className="stat-card">
          <h2>#{dashboard.currentRank || "-"}</h2>
          <p>Current Rank</p>
        </Link>
      </section>

      <section className="status-section">
        <div className="status-card">
          <h2>Approval Status</h2>
          <span
            className={
              student.approvalStatus === "Approved"
                ? "approved"
                : student.approvalStatus === "Rejected"
                  ? "rejected"
                  : "pending"
            }
          >
            {student.approvalStatus || "Pending"}
          </span>
        </div>

        <div className="status-card">
          <h2>Availability</h2>
          <span className={student.isAvailable ? "approved" : "rejected"}>
            {student.isAvailable ? "Available" : "Offline"}
          </span>
        </div>
      </section>

      <section className="language-section">
        <h2>Languages</h2>
        <div className="language-list">
          {languages.length === 0 ? (
            <p>No languages added.</p>
          ) : (
            languages.map((language, index) => (
              <span key={index} className="language-chip">
                {language}
              </span>
            ))
          )}
        </div>
      </section>

      <section className="quick-actions">
        <Link to="/student/profile" className="action-card">
          👤
          <h3>Profile</h3>
          <p>View Profile</p>
        </Link>

        <Link to="/student/chat-request" className="action-card">
          💬
          <h3>Chat Requests</h3>
          <p>{dashboard.pendingChatRequests || 0} Pending Chats</p>
        </Link>
        <Link to="/student/video-request" className="action-card">
          🎥
          <h3>Video Requests</h3>
          <p>{dashboard.pendingVideoRequests || 0} Pending Videos</p>
        </Link>
        <Link to="/student/history" className="action-card">
          📋
          <h3>Consultation History</h3>
          <p>Completed Sessions</p>
        </Link>
      </section>
    </div>
  );
}

export default Dashboard;
