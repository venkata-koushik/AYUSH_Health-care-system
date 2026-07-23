import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/patient/Dashboard";
import PatientQR from "./pages/patient/QRPage";
import MyRecords from "./pages/patient/MyRecords";
import Login from "./pages/patient/Login";
import Profile from "./pages/patient/Profile";
import PatientRegister from "./pages/patient/Register";

import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorProfile from "./pages/doctor/Profile";
import EditDoctorProfile from "./pages/doctor/EditProfile";
import DoctorLogin from "./pages/doctor/Login";
import DoctorRegister from "./pages/doctor/Register";
import SearchPatient from "./pages/doctor/SearchPatient";
import PatientDetails from "./pages/doctor/PatientDetails";
import CreateEHR from "./pages/doctor/CreateEHR";
import PatientHistory from "./pages/doctor/PatientHistory";
import QRScanner from "./pages/doctor/QRScanner";
import MyPatients from "./pages/doctor/MyPatients";

import StudentRegister from "./pages/student/Register";
import StudentLogin from "./pages/student/Login";
import EditStudentProfile from "./pages/student/EditProfile";
import StudentProfile from "./pages/student/Profile";

import StudentHistory from "./pages/student/StudentHistory";
import Leaderboard from "./pages/student/Leaderboard";
import StudentDashboard from "./pages/student/Dashboard";
import ChatRequests from "./pages/student/ChatRequest";
import VideoRequests from "./pages/student/VideoRequest";

import CreateConsultation from "./pages/consultation/CreateConsultation";
import WaitingConsultation from "./pages/consultation/WaitingConsultation";
import ChatRoom from "./pages/consultation/ChatRoom";
import VideoRoom from "./pages/consultation/VideoRoom";
import ReviewPopup from "./pages/consultation/ReviewPopup";
import ConsultationHistory from "./pages/consultation/ConsultationHistory";

import DoctorWorkspace from "./pages/doctor/DoctorWorkspace";
import GovernmentLogin from "./pages/government/GovernmentLogin";
import GovernmentDashboard from "./pages/government/GovernmentDashboard";
import Landing from "./pages/Landing";
import AiGuide from "./pages/patient/AiGuide";
function App() {
  const location = useLocation();
  const isGovernmentPortal = location.pathname.startsWith("/gov/");
  return (
    <div className={`app-shell ${location.pathname === "/" ? "landing-shell" : ""} ${isGovernmentPortal ? "government-shell" : ""}`}>
      <Routes>
        <Route path="/patient/login" element={<Login />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/patient/dashboard" element={<Dashboard />} />
        <Route path="/patient/records" element={<MyRecords />} />
        <Route path="/patient/profile" element={<Profile />} />
        <Route path="/patient/qr" element={<PatientQR />} />
        <Route path="/patient/ai-guide" element={<AiGuide />} />

        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/edit-profile" element={<EditDoctorProfile />} />
        <Route path="/doctor/search" element={<SearchPatient />} />
        <Route path="/doctor/patient/:uhid" element={<PatientDetails />} />
        <Route path="/doctor/create-ehr/:uhid" element={<CreateEHR />} />
        <Route path="/doctor/my-patients" element={<MyPatients />} />
        <Route
          path="/doctor/patient-history/:uhid"
          element={<PatientHistory />}
        />
        <Route path="/doctor/scan" element={<QRScanner />} />

        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/history" element={<StudentHistory />} />
        <Route path="/student/leaderboard" element={<Leaderboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/edit-profile" element={<EditStudentProfile />} />
        <Route path="/student/chat-request" element={<ChatRequests />} />
        <Route path="/student/video-request" element={<VideoRequests />} />

        <Route path="/consultation/create" element={<CreateConsultation />} />
        <Route path="/consultation/waiting" element={<WaitingConsultation />} />
        <Route path="/consultation/chat/:requestId" element={<ChatRoom />} />
        <Route path="/consultation/video/:requestId" element={<VideoRoom />} />
        <Route
          path="/consultation/review/:consultationId"
          element={<ReviewPopup />}
        />
        <Route path="/consultation/history" element={<ConsultationHistory />} />

        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/doctor/workspace" element={<DoctorWorkspace />} />

        <Route path="/gov/login" element={<GovernmentLogin />} />
        <Route path="/gov/dashboard" element={<GovernmentDashboard />} />
        <Route
          path="/government/login"
          element={<Navigate to="/gov/login" replace />}
        />
        <Route
          path="/government/dashboard"
          element={<Navigate to="/gov/dashboard" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
