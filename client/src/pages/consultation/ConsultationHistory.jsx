import "./ConsultationHistory.css";
import { useEffect, useState } from "react";
import {
  getMyChatRequests,
  getMyVideoRequests,
} from "../../services/PatientApi";

function ConsultationHistory() {
  const [chatHistory, setChatHistory] = useState([]);
  const [videoHistory, setVideoHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [chatRes, videoRes] = await Promise.all([
          getMyChatRequests(),
          getMyVideoRequests(),
        ]);

        setChatHistory(chatRes.data.requests || []);
        setVideoHistory(videoRes.data.requests || []);
      } catch (err) {
        console.error("Failed to load consultation history:", err);
        setError(err.response?.data?.message || "Unable to load history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="history-page">
        <h1>Consultation History</h1>
        <p>Loading consultation history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <h1>Consultation History</h1>
        <p role="alert">{error}</p>
      </div>
    );
  }

  const makeRow = (item, type) => (
    <div key={`${type}-${item.id}`} className="history-card">
      <h2>{type} Consultation</h2>
      <p>
        <strong>Student:</strong> {item.Student?.name || "Unknown Student"}
      </p>
      <p>
        <strong>Complaint:</strong> {item.complaint}
      </p>
      <p>
        <strong>Status:</strong> {item.status}
      </p>
      {item.completedAt && (
        <p>
          <strong>Completed:</strong>{" "}
          {new Date(item.completedAt).toLocaleString()}
        </p>
      )}
      {item.meetingLink && (
        <p>
          <strong>Meeting Link:</strong>{" "}
          <a href={item.meetingLink} target="_blank" rel="noreferrer">
            Join Call
          </a>
        </p>
      )}
    </div>
  );

  return (
    <div className="history-page">
      <h1>Consultation History</h1>

      <h2>Chat Consultations</h2>
      {chatHistory.length === 0 ? (
        <p>No chat consultations found.</p>
      ) : (
        chatHistory.map((item) => makeRow(item, "Chat"))
      )}

      <h2>Video Consultations</h2>
      {videoHistory.length === 0 ? (
        <p>No video consultations found.</p>
      ) : (
        videoHistory.map((item) => makeRow(item, "Video"))
      )}
    </div>
  );
}

export default ConsultationHistory;
