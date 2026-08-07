import { Navigate, useLocation } from "react-router-dom";

// Which stored token proves a session for each portal, and where to send a
// visitor who does not have one.
const PORTALS = {
  patient: { tokenKey: "patientToken", loginPath: "/patient/login" },
  doctor: { tokenKey: "doctorToken", loginPath: "/doctor/login" },
  student: { tokenKey: "studentToken", loginPath: "/student/login" },
  gov: { tokenKey: "govToken", loginPath: "/gov/login" },
};

// Signed-in screens used to render for anyone who typed the URL: the page
// mounted, its requests came back 401, and the visitor was left on an error
// screen with no way forward. Sending them to the right login is clearer.
//
// `portal` accepts a single role, or several for the consultation rooms, which
// the server lets either a patient or a student enter.
function RequireAuth({ portal, children }) {
  const location = useLocation();

  const roles = (Array.isArray(portal) ? portal : [portal]).filter(
    (role) => PORTALS[role],
  );
  if (!roles.length) return children;

  const hasSession = roles.some((role) =>
    localStorage.getItem(PORTALS[role].tokenKey),
  );
  if (hasSession) return children;

  // With one role we know exactly which login to open. With several we cannot
  // tell which the visitor is, so the landing page lets them choose.
  const target = roles.length === 1 ? PORTALS[roles[0]].loginPath : "/";

  // `state.from` lets the login screen send them back where they were headed.
  return <Navigate to={target} replace state={{ from: location.pathname }} />;
}

export default RequireAuth;
