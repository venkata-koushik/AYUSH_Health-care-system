import api from "./Api";

export const loginGovernment = (credentials) =>
  api.post("/gov/login", credentials);

export const getGovernmentDashboard = (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value),
  );
  return api.get("/gov/dashboard", { params });
};

export const getGovernmentHealthInsight = (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value),
  );
  return api.get("/gov/health-insight", { params });
};
