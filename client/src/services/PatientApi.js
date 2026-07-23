import api from "./Api";

export const loginPatient = (credentials) =>
  api.post("/patient/login", credentials);

export const registerPatient = (data) => api.post("/patient/register", data);

export const getProfile = () => {
  return api.get("/patient/profile");
};

export const updateProfile = (data) => {
  return api.put("/patient/profile", data);
};

export const getMyRecords = () => {
  return api.get("/patient/my-records");
};

export const getQr = () => {
  return api.get("/qr/me");
};

export const getCurrentRequest = () => {
  return api.get("/patient/current-request");
};

export const createChatRequest = (data) => {
  return api.post("/patient/chat-request", data);
};

export const createVideoRequest = (data) => {
  return api.post("/patient/video-request", data);
};

export const getMyChatRequests = () => {
  return api.get("/patient/chat-history");
};

export const getMyVideoRequests = () => {
  return api.get("/patient/video-history");
};

export const submitReview = (data) => {
  return api.post("/patient/review", data);
};

export const checkPendingReview = () => {
  return api.get("/patient/pending-review");
};

export const getAiGuidance = (message) => api.post("/patient/ai-guidance", { message });
