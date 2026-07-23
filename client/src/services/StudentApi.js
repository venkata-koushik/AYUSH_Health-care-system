import api from "./Api";

// Authentication

export const registerStudent = (credentials) => {
  return api.post("/student/register", credentials);
};

export const loginStudent = (credentials) => {
  return api.post("/student/login", credentials);
};

export const logoutStudent = () => {
  return api.post("/student/logout");
};

// Dashboard

export const getStudentDashboard = () => {
  return api.get("/student/dashboard");
};

// Profile

export const getStudentProfile = () => {
  return api.get("/student/profile");
};

export const updateStudentProfile = (data) => {
  return api.put("/student/profile", data);
};

// Requests

export const getChatRequests = () => {
  return api.get("/student/chat-request");
};

export const getVideoRequests = () => {
  return api.get("/student/video-requests");
};

export const acceptChatRequest = (requestId) => {
  return api.put(`/student/chat-request/${requestId}/accept`);
};

export const rejectChatRequest = (requestId) => {
  return api.put(`/student/chat-request/${requestId}/reject`);
};

export const completeChatRequest = (requestId) => {
  return api.put(`/student/chat-request/${requestId}/complete`);
};

export const acceptVideoRequest = (requestId) => {
  return api.put(`/student/video-request/${requestId}/accept`);
};

export const rejectVideoRequest = (requestId) => {
  return api.put(`/student/video-request/${requestId}/reject`);
};

export const completeVideoRequest = (requestId) => {
  return api.put(`/student/video-request/${requestId}/complete`);
};

export const getStudentHistory = () => {
  return api.get("/student/history");
};

export const getLeaderboard = () => {
  return api.get("/student/leaderboard");
};

export const getReviewHistory = () => {
  return api.get("/student/reviews");
};

export const getWeeklyStatistics = () => {
  return api.get("/student/weekly-stats");
};

export const getMonthlyStatistics = () => {
  return api.get("/student/monthly-stats");
};
