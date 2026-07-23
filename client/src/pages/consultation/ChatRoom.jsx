import "./ChatRoom.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentRequest } from "../../services/PatientApi";
import { completeChatRequest } from "../../services/StudentApi";
import { getMessages, sendMessage } from "../../services/messageApi";
import { connectConsultationSocket } from "../../socket/clientSocket";

function ChatRoom() {
  const navigate = useNavigate();
  const { requestId } = useParams();

  const isStudent =
    Boolean(localStorage.getItem("studentToken")) &&
    !localStorage.getItem("patientToken");

  const senderRole = isStudent ? "Student" : "Patient";

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      const res = await getMessages(requestId, "Chat");

      if (res.success) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [requestId]);

  useEffect(() => {
    const socket = connectConsultationSocket();
    if (!socket) {
      setError("Please sign in before joining the chat.");
      return undefined;
    }

    const receiveMessage = (message) => {
      if (
        message.consultationType !== "Chat" ||
        Number(message.requestId) !== Number(requestId)
      )
        return;
      setMessages((current) =>
        current.some((item) => item.id === message.id)
          ? current
          : [...current, message],
      );
    };
    const handleConnect = () => {
      socket.emit(
        "join-consultation",
        { requestId: Number(requestId), consultationType: "Chat" },
        (result) => {
          if (!result?.success)
            setError(result?.message || "Unable to join the chat room.");
        },
      );
    };

    socket.on("message:new", receiveMessage);
    socket.on("connect", handleConnect);
    socket.on("connect_error", () =>
      setError("Live chat connection failed. Messages will keep refreshing."),
    );
    if (socket.connected) handleConnect();

    return () => {
      socket.off("message:new", receiveMessage);
      socket.off("connect", handleConnect);
      socket.off("connect_error");
    };
  }, [requestId]);

  // Temporary polling until Socket.IO
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [requestId]);

  // Patient waits for consultation completion
  useEffect(() => {
    if (isStudent) return;

    const interval = setInterval(async () => {
      try {
        const res = await getCurrentRequest();

        if (
          res.data.requestId === Number(requestId) &&
          res.data.consultationType === "Chat" &&
          res.data.status === "Completed"
        ) {
          clearInterval(interval);
          navigate(`/consultation/review/${requestId}`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isStudent, navigate, requestId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const res = await sendMessage({
        requestId,
        consultationType: "Chat",
        message: input,
        messageType: "Text",
      });

      if (res.success) {
        setInput("");
        loadMessages();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to send message.");
    }
  };

  const completeConsultation = async () => {
    try {
      await completeChatRequest(requestId);
      navigate("/student/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to complete this consultation.",
      );
    }
  };

  if (loading) {
    return <h3>Loading Chat...</h3>;
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>Chat Consultation #{requestId}</h2>
        <span>🟢 Connected</span>
      </div>

      <div className="chat-body">
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.senderRole === senderRole ? "my-message" : "student-message"
              }
            >
              <strong>{msg.senderRole}</strong>

              <p>{msg.message}</p>

              <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
            </div>
          ))
        )}
      </div>

      <div className="chat-footer">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />

        <button onClick={handleSend}>Send</button>

        {isStudent && (
          <button onClick={completeConsultation}>Complete Consultation</button>
        )}
      </div>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default ChatRoom;
