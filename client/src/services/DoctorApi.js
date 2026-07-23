import api from "./Api";

// Authentication

export const registerDoctor = (credentials) => {
  return api.post("/doctor/register", credentials);
};

export const loginDoctor = (credentials) => {
  return api.post("/doctor/login", credentials);
};

export const logoutDoctor = () => {
  return api.post("/doctor/logout");
};

// Dashboard

export const getDoctorDashboard = () => {
  return api.get("/doctor/dashboard");
};

// Profile

export const getDoctorProfile = () => {
  return api.get("/doctor/profile");
};

export const updateDoctorProfile = (data) => {
  return api.put("/doctor/profile", data);
};
// Patients

export const getMyPatients = () => {
  return api.get("/doctor/my-patients");
};

export const getPatientDetails = (uhid) => {
  return api.get(`/doctor/patient/${uhid}`);
};

export const getPatientHistory = (uhid) => {
  return api.get(`/doctor/patient-history/${uhid}`);
};

export const saveDoctorEHR = (data) => {
  return api.post("/doctor/ehr", data);
};

export const getDoctorWorkspace = (uhid) => {
  return api.get(`/doctor/workspace/${uhid}`);
};

export const getDoctorWorkspaceSummary = () => {
  return api.get("/doctor/workspace-summary");
};

export const generateConsultationDraft = (transcript, patientContext, uhid) => {
  return api.post("/doctor/consultation-draft", {
    transcript,
    patientContext,
    uhid,
  });
};
