import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

const getAuthTokenForRequest = (config) => {
  const requestPath = (config?.url || "")
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/api/, "");

  const roleMatches = [
    { prefixes: ["/doctor", "/ehr"], tokenKey: "doctorToken" },
    { prefixes: ["/patient", "/qr"], tokenKey: "patientToken" },
    { prefixes: ["/student"], tokenKey: "studentToken" },
    { prefixes: ["/gov"], tokenKey: "govToken" },
  ];

  for (const match of roleMatches) {
    const isMatch = match.prefixes.some((prefix) =>
      requestPath.startsWith(prefix),
    );
    if (isMatch) {
      return localStorage.getItem(match.tokenKey);
    }
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

export default api;
