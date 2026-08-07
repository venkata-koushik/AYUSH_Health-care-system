import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

console.log("API Base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
});

const normalisePath = (url) =>
  (url || "")
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/api/, "");

const roleMatches = [
  {
    prefixes: ["/doctor", "/ehr"],
    tokenKey: "doctorToken",
    loginPath: "/doctor/login",
  },
  {
    prefixes: ["/patient", "/qr"],
    tokenKey: "patientToken",
    loginPath: "/patient/login",
  },
  {
    prefixes: ["/student"],
    tokenKey: "studentToken",
    loginPath: "/student/login",
  },
  { prefixes: ["/gov"], tokenKey: "govToken", loginPath: "/gov/login" },
];

const matchRole = (requestPath) =>
  roleMatches.find((match) =>
    match.prefixes.some((prefix) => requestPath.startsWith(prefix)),
  );

const getAuthTokenForRequest = (config) => {
  const requestPath = normalisePath(config?.url);

  const match = matchRole(requestPath);
  if (match) {
    return localStorage.getItem(match.tokenKey);
  }

  return (
    localStorage.getItem("patientToken") ||
    localStorage.getItem("doctorToken") ||
    localStorage.getItem("studentToken") ||
    localStorage.getItem("govToken")
  );
};

api.interceptors.request.use((config) => {
  const token = getAuthTokenForRequest(config);

  if (token) {
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Tokens last seven days, so they expire while people are still using the app.
// Without this, an expired token left every page showing its own error text and
// no way back; now the stale token is cleared and the right login is opened.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 401) return Promise.reject(error);

    const requestPath = normalisePath(error.config?.url);

    // A failed sign-in also returns 401. That means "wrong credentials", not
    // "session expired" — the login screen shows its own message, so leave it.
    const isAuthAttempt = /\/(login|register)$/.test(requestPath);
    if (isAuthAttempt) return Promise.reject(error);

    const match = matchRole(requestPath);
    if (match) {
      localStorage.removeItem(match.tokenKey);
    }

    const loginPath = match?.loginPath || "/";
    if (window.location.pathname !== loginPath) {
      window.location.assign(loginPath);
    }

    return Promise.reject(error);
  },
);

export default api;
