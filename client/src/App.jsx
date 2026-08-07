import { lazy, Suspense, useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import Landing from "./pages/Landing";

// Every portal below is code-split: a visitor only downloads the screens they
// actually open, instead of the whole application on first load.
const Login = lazy(() => import("./pages/patient/Login"));
const PatientRegister = lazy(() => import("./pages/patient/Register"));
const Dashboard = lazy(() => import("./pages/patient/Dashboard"));
const MyRecords = lazy(() => import("./pages/patient/MyRecords"));
const Profile = lazy(() => import("./pages/patient/Profile"));
const PatientQR = lazy(() => import("./pages/patient/QRPage"));
const AiGuide = lazy(() => import("./pages/patient/AiGuide"));

const DoctorLogin = lazy(() => import("./pages/doctor/Login"));
const DoctorRegister = lazy(() => import("./pages/doctor/Register"));
const DoctorDashboard = lazy(() => import("./pages/doctor/Dashboard"));
const DoctorProfile = lazy(() => import("./pages/doctor/Profile"));
const EditDoctorProfile = lazy(() => import("./pages/doctor/EditProfile"));
const SearchPatient = lazy(() => import("./pages/doctor/SearchPatient"));
const PatientDetails = lazy(() => import("./pages/doctor/PatientDetails"));
const CreateEHR = lazy(() => import("./pages/doctor/CreateEHR"));
const PatientHistory = lazy(() => import("./pages/doctor/PatientHistory"));
const MyPatients = lazy(() => import("./pages/doctor/MyPatients"));
const QRScanner = lazy(() => import("./pages/doctor/QRScanner"));
const DoctorWorkspace = lazy(() => import("./pages/doctor/DoctorWorkspace"));

const StudentLogin = lazy(() => import("./pages/student/Login"));
const StudentRegister = lazy(() => import("./pages/student/Register"));
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentHistory = lazy(() => import("./pages/student/StudentHistory"));
const Leaderboard = lazy(() => import("./pages/student/Leaderboard"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const EditStudentProfile = lazy(() => import("./pages/student/EditProfile"));
const ChatRequests = lazy(() => import("./pages/student/ChatRequest"));
const VideoRequests = lazy(() => import("./pages/student/VideoRequest"));

const CreateConsultation = lazy(
  () => import("./pages/consultation/CreateConsultation"),
);
const WaitingConsultation = lazy(
  () => import("./pages/consultation/WaitingConsultation"),
);
const ChatRoom = lazy(() => import("./pages/consultation/ChatRoom"));
const VideoRoom = lazy(() => import("./pages/consultation/VideoRoom"));
const ReviewPopup = lazy(() => import("./pages/consultation/ReviewPopup"));
const ConsultationHistory = lazy(
  () => import("./pages/consultation/ConsultationHistory"),
);

const GovernmentLogin = lazy(() => import("./pages/government/GovernmentLogin"));
const GovernmentDashboard = lazy(
  () => import("./pages/government/GovernmentDashboard"),
);

// Navigating between pages used to keep the previous scroll position, which
// left long pages opening halfway down.
function useScrollToTop(pathname) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
}

function App() {
  const location = useLocation();
  const isGovernmentPortal = location.pathname.startsWith("/gov/");
  const isLanding = location.pathname === "/";

  useScrollToTop(location.pathname);

  const shellClass = [
    "app-shell",
    isLanding ? "landing-shell" : "",
    isGovernmentPortal ? "government-shell" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <div className="route-view" key={location.pathname}>
            <Routes location={location}>
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
              <Route
                path="/doctor/edit-profile"
                element={<EditDoctorProfile />}
              />
              <Route path="/doctor/search" element={<SearchPatient />} />
              <Route path="/doctor/patient/:uhid" element={<PatientDetails />} />
              <Route path="/doctor/create-ehr/:uhid" element={<CreateEHR />} />
              <Route path="/doctor/my-patients" element={<MyPatients />} />
              <Route
                path="/doctor/patient-history/:uhid"
                element={<PatientHistory />}
              />
              <Route path="/doctor/scan" element={<QRScanner />} />
              <Route path="/doctor/workspace" element={<DoctorWorkspace />} />

              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/register" element={<StudentRegister />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/history" element={<StudentHistory />} />
              <Route path="/student/leaderboard" element={<Leaderboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route
                path="/student/edit-profile"
                element={<EditStudentProfile />}
              />
              <Route path="/student/chat-request" element={<ChatRequests />} />
              <Route path="/student/video-request" element={<VideoRequests />} />

              <Route
                path="/consultation/create"
                element={<CreateConsultation />}
              />
              <Route
                path="/consultation/waiting"
                element={<WaitingConsultation />}
              />
              <Route path="/consultation/chat/:requestId" element={<ChatRoom />} />
              <Route
                path="/consultation/video/:requestId"
                element={<VideoRoom />}
              />
              <Route
                path="/consultation/review/:consultationId"
                element={<ReviewPopup />}
              />
              <Route
                path="/consultation/history"
                element={<ConsultationHistory />}
              />

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

              <Route path="/" element={<Landing />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
