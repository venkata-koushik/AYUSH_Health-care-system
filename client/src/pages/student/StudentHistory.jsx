import "./StudentHistory.css";
import { useEffect, useState } from "react";
import { getStudentHistory } from "../../services/StudentApi";

function StudentHistory() {
  const [chats, setChats] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStudentHistory();
        setChats(res.data.completedChats || []);
        setVideos(res.data.completedVideos || []);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="history-page">
        <h2>Loading History...</h2>
      </div>
    );

  const renderCard = (item, type) => (
    <div className="history-card" key={item.id}>
      <h3>{item.Patient?.fullName || "Anonymous Patient"}</h3>
      <p>
        <strong>UHID:</strong> {item.Patient?.uhid || "N/A"}
      </p>
      <p>
        <strong>Complaint:</strong> {item.complaint}
      </p>
      <p>
        <strong>Type:</strong> {type}
      </p>
      <p>
        <strong>Completed:</strong>{" "}
        {new Date(item.completedAt).toLocaleDateString()}
      </p>
    </div>
  );

  return (
    <div className="history-page">
      <h1>Consultation History</h1>

      <h2>Completed Chat Consultations ({chats.length})</h2>
      {chats.length === 0 ? (
        <p className="empty-msg">No completed chats yet.</p>
      ) : (
        chats.map((chat) => renderCard(chat, "Chat"))
      )}

      <h2>Completed Video Consultations ({videos.length})</h2>
      {videos.length === 0 ? (
        <p className="empty-msg">No completed video calls yet.</p>
      ) : (
        videos.map((video) => renderCard(video, "Video"))
      )}
    </div>
  );
}

export default StudentHistory;
