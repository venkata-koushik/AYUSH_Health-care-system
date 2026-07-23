import jwt from "jsonwebtoken";
import ChatRequest from "../models/chatRequestModel.js";
import VideoRequest from "../models/videoRequestModel.js";

let ioInstance;
const roomPresence = new Map();
const consultationModels = { Chat: ChatRequest, Video: VideoRequest };
const callStatuses = new Set([
  "Waiting",
  "Connecting",
  "Connected",
  "Disconnected",
  "Completed",
]);

export const consultationRoom = (consultationType, requestId) =>
  `consultation:${consultationType}:${requestId}`;
export const getSocketServer = () => ioInstance;

const getRoomState = (roomId) => {
  if (!roomPresence.has(roomId)) {
    roomPresence.set(roomId, {
      patientSockets: new Set(),
      studentSockets: new Set(),
      mediaReadySockets: new Set(),
      callStatus: "Waiting",
    });
  }
  return roomPresence.get(roomId);
};

const snapshot = (state) => ({
  patientOnline: state.patientSockets.size > 0,
  studentOnline: state.studentSockets.size > 0,
  callStatus: state.callStatus,
});

const updateStoredCallStatus = async (
  consultationType,
  requestId,
  callStatus,
) => {
  if (consultationType !== "Video") return;
  await VideoRequest.update({ callStatus }, { where: { id: requestId } });
};

const publishRoomState = async (io, roomId, consultationType, requestId) => {
  const state = getRoomState(roomId);
  const presence = snapshot(state);
  io.to(roomId).emit("consultation-presence", presence);
  await updateStoredCallStatus(consultationType, requestId, state.callStatus);
  return presence;
};

const getAuthorizedConsultation = async (user, requestId, consultationType) => {
  const Consultation = consultationModels[consultationType];
  if (!Consultation || !Number.isInteger(Number(requestId))) return null;
  const consultation = await Consultation.findByPk(Number(requestId));
  if (!consultation) return null;

  const allowed =
    (user.role === "patient" && consultation.patientId === user.patientId) ||
    (user.role === "student" && consultation.studentId === user.studentId);
  return allowed ? consultation : null;
};

export default function registerSocketHandlers(io) {
  ioInstance = io;

  io.use((socket, next) => {
    try {
      const decoded = jwt.verify(
        socket.handshake.auth?.token,
        process.env.JWT_SECRET,
      );
      if (decoded.role === "patient" && decoded.patientId) {
        socket.data.user = { role: "patient", patientId: decoded.patientId };
      } else if (decoded.role === "student" && decoded.studentId) {
        socket.data.user = { role: "student", studentId: decoded.studentId };
      } else {
        return next(new Error("Invalid consultation user"));
      }
      socket.data.consultations = new Map();
      next();
    } catch {
      next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on(
      "join-consultation",
      async ({ requestId, consultationType }, acknowledge = () => {}) => {
        try {
          const numericRequestId = Number(requestId);
          const consultation = await getAuthorizedConsultation(
            socket.data.user,
            numericRequestId,
            consultationType,
          );
          if (!consultation)
            return acknowledge({
              success: false,
              message: "Unauthorized consultation room",
            });

          const roomId = consultationRoom(consultationType, numericRequestId);
          const state = getRoomState(roomId);
          socket.join(roomId);
          socket.data.consultations.set(roomId, {
            requestId: numericRequestId,
            consultationType,
          });
          state[
            socket.data.user.role === "patient"
              ? "patientSockets"
              : "studentSockets"
          ].add(socket.id);

          if (
            state.patientSockets.size &&
            state.studentSockets.size &&
            state.callStatus !== "Connected"
          ) {
            state.callStatus = "Connecting";
            io.to(roomId).emit("consultation-peer-ready");
            console.log(`Both participants are ready in ${roomId}`);
          }

          const presence = await publishRoomState(
            io,
            roomId,
            consultationType,
            numericRequestId,
          );
          acknowledge({ success: true, roomId, ...presence });
          console.log(`Socket ${socket.id} joined ${roomId}`);
        } catch (error) {
          console.error("Socket room join error:", error);
          acknowledge({
            success: false,
            message: "Unable to join consultation room",
          });
        }
      },
    );

    socket.on("webrtc-status", async ({ roomId, status }) => {
      const room = socket.data.consultations.get(roomId);
      if (!room || !callStatuses.has(status) || status === "Completed") return;
      const state = getRoomState(roomId);
      if (state.callStatus === "Completed") return;
      state.callStatus = status;
      try {
        await publishRoomState(
          io,
          roomId,
          room.consultationType,
          room.requestId,
        );
      } catch (error) {
        console.error("Unable to update WebRTC status:", error);
      }
    });

    // A participant only reaches this point after its camera, microphone and
    // WebRTC event listeners are ready. Waiting for both sides prevents an
    // offer being sent before the other browser can receive it.
    socket.on("webrtc-media-ready", ({ roomId }) => {
      const room = socket.data.consultations.get(roomId);
      if (!room) return;
      const state = getRoomState(roomId);
      state.mediaReadySockets.add(socket.id);
      if (
        state.patientSockets.size &&
        state.studentSockets.size &&
        state.mediaReadySockets.size >= 2
      ) {
        io.to(roomId).emit("webrtc-start");
        console.log(`WebRTC media ready in ${roomId}; starting negotiation`);
      }
    });

    ["webrtc-offer", "webrtc-answer", "webrtc-ice-candidate"].forEach(
      (eventName) => {
        socket.on(eventName, ({ roomId, ...payload }) => {
          if (!socket.data.consultations.has(roomId)) return;
          socket.to(roomId).emit(eventName, payload[Object.keys(payload)[0]]);
        });
      },
    );

    socket.on("disconnect", async () => {
      for (const [roomId, room] of socket.data.consultations) {
        const state = getRoomState(roomId);
        state[
          socket.data.user.role === "patient"
            ? "patientSockets"
            : "studentSockets"
        ].delete(socket.id);
        state.mediaReadySockets.delete(socket.id);
        state.callStatus =
          state.patientSockets.size && state.studentSockets.size
            ? "Connecting"
            : "Disconnected";
        try {
          await publishRoomState(
            io,
            roomId,
            room.consultationType,
            room.requestId,
          );
        } catch (error) {
          console.error("Unable to publish disconnect state:", error);
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
}
