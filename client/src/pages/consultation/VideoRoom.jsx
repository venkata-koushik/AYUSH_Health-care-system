import "./VideoRoom.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentRequest } from "../../services/PatientApi";
import { completeVideoRequest } from "../../services/StudentApi";
import { connectConsultationSocket } from "../../socket/clientSocket";
import useWebRTC from "../../hooks/useWebRTC";

function VideoRoom() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const isStudent =
    Boolean(localStorage.getItem("studentToken")) &&
    !localStorage.getItem("patientToken");
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [presence, setPresence] = useState({
    patientOnline: false,
    studentOnline: false,
    callStatus: "Waiting",
  });
  const [webRtcStatus, setWebRtcStatus] = useState("Waiting");

  const peerReady = presence.patientOnline && presence.studentOnline;
  const updateWebRtcStatus = useCallback(
    (status) => setWebRtcStatus(status),
    [],
  );

  useEffect(() => {
    const consultationSocket = connectConsultationSocket();
    if (!consultationSocket) {
      setError("Please sign in before joining the video consultation.");
      return undefined;
    }
    setSocket(consultationSocket);

    const joinRoom = () => {
      console.log("Socket connected; joining video consultation room");
      consultationSocket.emit(
        "join-consultation",
        {
          requestId: Number(requestId),
          consultationType: "Video",
        },
        (response) => {
          if (!response?.success)
            return setError(
              response?.message || "Unable to join the video room.",
            );
          setError("");
          setRoomId(response.roomId);
          setPresence({
            patientOnline: response.patientOnline,
            studentOnline: response.studentOnline,
            callStatus: response.callStatus,
          });
          console.log(`Joined video consultation room: ${response.roomId}`);
        },
      );
    };
    const updatePresence = (nextPresence) => {
      setPresence(nextPresence);
      console.log("Consultation presence updated:", nextPresence);
    };
    const handleDisconnect = () => {
      setPresence((current) => ({ ...current, callStatus: "Disconnected" }));
      setWebRtcStatus("Disconnected");
      console.log("Video signaling socket disconnected; reconnecting...");
    };
    const handleConnectError = () =>
      setError("Video signaling is reconnecting. Please wait...");

    consultationSocket.on("connect", joinRoom);
    consultationSocket.on("consultation-presence", updatePresence);
    consultationSocket.on("disconnect", handleDisconnect);
    consultationSocket.on("connect_error", handleConnectError);
    if (consultationSocket.connected) joinRoom();

    return () => {
      consultationSocket.off("connect", joinRoom);
      consultationSocket.off("consultation-presence", updatePresence);
      consultationSocket.off("disconnect", handleDisconnect);
      consultationSocket.off("connect_error", handleConnectError);
      consultationSocket.disconnect();
    };
  }, [requestId]);

  const {
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCamera,
    micEnabled,
    cameraEnabled,
  } = useWebRTC(socket, roomId, isStudent, updateWebRtcStatus);

  const completeConsultation = async () => {
    try {
      await completeVideoRequest(requestId);
      setPresence((current) => ({ ...current, callStatus: "Completed" }));
      navigate("/student/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to complete this consultation.",
      );
    }
  };

  useEffect(() => {
    if (isStudent) return undefined;
    const interval = setInterval(async () => {
      try {
        const res = await getCurrentRequest();
        if (
          res.data.requestId === Number(requestId) &&
          res.data.consultationType === "Video" &&
          res.data.status === "Completed"
        ) {
          navigate(`/consultation/review/${res.data.requestId}`);
        }
      } catch (requestError) {
        console.error("Video Room Polling Error:", requestError);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [navigate, requestId, isStudent]);

  return (
    <div className="video-page">
      <header className="video-header">
        <div>
          <p className="video-label">Telemedicine video call</p>
          <h2>Consultation #{requestId}</h2>
        </div>
        <span
          className={`call-status status-${presence.callStatus.toLowerCase()}`}
        >
          {presence.callStatus}
        </span>
      </header>

      <section className="presence-bar" aria-label="Consultation presence">
        <span className={presence.patientOnline ? "online" : "offline"}>
          Patient: {presence.patientOnline ? "Online" : "Offline"}
        </span>
        <span className={presence.studentOnline ? "online" : "offline"}>
          Student: {presence.studentOnline ? "Online" : "Offline"}
        </span>
        <span className="webrtc-status">
          Video:{" "}
          {webRtcStatus === "Waiting"
            ? "Waiting"
            : webRtcStatus === "Connecting"
              ? "Connecting..."
              : webRtcStatus}
        </span>
      </section>

      <div className="video-container">
        <div className="remote-panel">
          <video
            ref={remoteVideoRef}
            className="remote-video"
            autoPlay
            playsInline
          />
          {!peerReady && (
            <p className="video-placeholder">
              Waiting for the other participant to join…
            </p>
          )}
        </div>
        <video
          ref={localVideoRef}
          className="local-video"
          autoPlay
          playsInline
          muted
        />
      </div>

      <div className="video-controls">
        <button onClick={toggleMic}>
          {micEnabled ? "🎤 Mute" : "🎤 Unmute"}
        </button>
        <button onClick={toggleCamera}>
          {cameraEnabled ? "📹 Camera Off" : "📹 Camera On"}
        </button>
        {isStudent && (
          <button className="end-btn" onClick={completeConsultation}>
            Complete Consultation
          </button>
        )}
      </div>
      {error && (
        <p className="video-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default VideoRoom;
