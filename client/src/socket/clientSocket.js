import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export const connectConsultationSocket = () => {
  const token =
    localStorage.getItem("patientToken") ||
    localStorage.getItem("studentToken");
  if (!token) return null;

  socket.auth = { token };
  if (!socket.connected) socket.connect();
  return socket;
};

export default socket;
