import "./VideoRequest.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getVideoRequests,
  acceptVideoRequest,
  rejectVideoRequest,
  completeVideoRequest,
} from "../../services/StudentApi";

function VideoRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      const res = await getVideoRequests();
      setRequests(res.data.requests);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Unable to load video requests.",
      );
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptVideoRequest(id);
      navigate(`/consultation/video/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectVideoRequest(id);
      loadRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeVideoRequest(id);
      loadRequests();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="request-page">
      <h1>Video Consultation Requests</h1>
      {error && <p role="alert">{error}</p>}

      {requests.length === 0 && <p>No video requests right now.</p>}

      {requests.map((request) => (
        <div className="request-card" key={request.id}>
          <h2>{request.Patient?.fullName || request.patientName}</h2>

          <p>
            <strong>UHID :</strong> {request.Patient?.uhid || request.uhid}
          </p>

          <p>
            <strong>Complaint :</strong> {request.complaint}
          </p>

          <p>
            <strong>Status :</strong> {request.status}
          </p>

          {request.status === "Pending" && (
            <>
              <button
                className="accept-btn"
                onClick={() => handleAccept(request.id)}
              >
                Accept
              </button>

              <button
                className="reject-btn"
                onClick={() => handleReject(request.id)}
              >
                Reject
              </button>
            </>
          )}

          {request.status === "Accepted" && (
            <button
              className="complete-btn"
              onClick={() => handleComplete(request.id)}
            >
              Complete Consultation
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default VideoRequests;
