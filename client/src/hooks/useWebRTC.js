import { useEffect, useRef, useState } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
    ...(import.meta.env.VITE_TURN_URL
      ? [{
          urls: import.meta.env.VITE_TURN_URL.split(",").map((url) => url.trim()),
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        }]
      : []),
  ],
};

export default function useWebRTC(
  socket,
  roomId,
  isInitiator,
  onStatusChange,
) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const pendingCandidates = useRef([]);
  const offerStarted = useRef(false);
  const remoteStream = useRef(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Waiting");

  useEffect(() => {
    if (!socket || !roomId) return undefined;
    let active = true;
    offerStarted.current = false;

    const reportStatus = (status) => {
      setConnectionStatus(status);
      onStatusChange?.(status);
      const lifecycleStatus = status === "Failed" ? "Disconnected" : status;
      if (
        ["Connecting", "Connected", "Disconnected"].includes(lifecycleStatus)
      ) {
        socket.emit("webrtc-status", { roomId, status: lifecycleStatus });
      }
    };

    const addCandidate = async (candidate) => {
      const peer = peerConnection.current;
      if (!candidate || !peer) return;
      if (!peer.remoteDescription) {
        pendingCandidates.current.push(candidate);
        return;
      }
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const flushCandidates = async () => {
      const candidates = pendingCandidates.current.splice(0);
      await Promise.all(candidates.map(addCandidate));
    };

    const startOffer = async () => {
      const peer = peerConnection.current;
      if (
        !isInitiator ||
        !peer ||
        offerStarted.current ||
        peer.signalingState !== "stable"
      )
        return;
      try {
        offerStarted.current = true;
        reportStatus("Connecting");
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("webrtc-offer", { roomId, offer: peer.localDescription });
        console.log("Sent WebRTC offer");
      } catch (error) {
        offerStarted.current = false;
        reportStatus("Failed");
        console.error("Unable to start WebRTC offer:", error);
      }
    };

    const handleOffer = async (offer) => {
      try {
        const peer = peerConnection.current;
        if (!peer) return;
        reportStatus("Connecting");
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        await flushCandidates();
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("webrtc-answer", { roomId, answer: peer.localDescription });
        console.log("Sent WebRTC answer");
      } catch (error) {
        reportStatus("Failed");
        console.error("Unable to handle WebRTC offer:", error);
      }
    };

    const handleAnswer = async (answer) => {
      try {
        const peer = peerConnection.current;
        if (!peer) return;
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        await flushCandidates();
        console.log("Received WebRTC answer");
      } catch (error) {
        reportStatus("Failed");
        console.error("Unable to handle WebRTC answer:", error);
      }
    };

    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!active) return stream.getTracks().forEach((track) => track.stop());
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        console.log("Camera started");
        console.log("Microphone started");

        const peer = new RTCPeerConnection(ICE_SERVERS);
        peerConnection.current = peer;
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        console.log("Peer connection created");

        peer.ontrack = (event) => {
          // Some browsers omit event.streams even though the track is valid.
          // Build a stream from tracks as a reliable fallback.
          const stream = event.streams[0] || remoteStream.current || new MediaStream();
          if (!event.streams[0] && !stream.getTracks().some((track) => track.id === event.track.id)) stream.addTrack(event.track);
          remoteStream.current = stream;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
            remoteVideoRef.current.play().catch(() => {});
          }
          console.log("Remote media stream received", event.track.kind);
        };
        peer.onicecandidate = ({ candidate }) => {
          if (candidate)
            socket.emit("webrtc-ice-candidate", { roomId, candidate });
        };
        peer.onconnectionstatechange = () => {
          const state = peer.connectionState;
          console.log(`WebRTC connection: ${state}`);
          if (state === "connected") reportStatus("Connected");
          if (state === "disconnected") reportStatus("Disconnected");
          if (state === "failed" || state === "closed") reportStatus("Failed");
        };

        socket.on("webrtc-offer", handleOffer);
        socket.on("webrtc-answer", handleAnswer);
        socket.on("webrtc-ice-candidate", (candidate) => {
          addCandidate(candidate).catch((error) =>
            console.error("Unable to add ICE candidate:", error),
          );
        });
        socket.on("webrtc-start", startOffer);
        socket.emit("webrtc-media-ready", { roomId });
      } catch (error) {
        reportStatus("Failed");
        console.error("Camera or microphone access failed:", error);
      }
    };

    initialize();
    return () => {
      active = false;
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate");
      socket.off("webrtc-start", startOffer);
      peerConnection.current?.close();
      peerConnection.current = null;
      localStream.current?.getTracks().forEach((track) => track.stop());
      localStream.current = null;
      remoteStream.current = null;
      console.log("WebRTC call cleaned up");
    };
  }, [socket, roomId, isInitiator, onStatusChange]);

  const toggleMic = () => {
    localStream.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMicEnabled((enabled) => !enabled);
  };
  const toggleCamera = () => {
    localStream.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraEnabled((enabled) => !enabled);
  };

  return {
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCamera,
    micEnabled,
    cameraEnabled,
    connectionStatus,
  };
}
