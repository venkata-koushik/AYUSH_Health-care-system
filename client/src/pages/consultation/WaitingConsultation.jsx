import "./WaitingConsultation.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentRequest } from "../../services/PatientApi";

function WaitingConsultation() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getCurrentRequest();

        const consultation = JSON.parse(
          localStorage.getItem("consultationRequest") || "null",
        );
        if (
          !consultation ||
          res.data.requestId !== consultation.requestId ||
          res.data.consultationType !== consultation.consultationType
        ) {
          return;
        }

        if (res.data.status === "Accepted") {
          clearInterval(interval);

          if (res.data.consultationType === "Chat") {
            navigate(`/consultation/chat/${res.data.requestId}`);
          } else {
            navigate(`/consultation/video/${res.data.requestId}`);
          }
        }

        if (res.data.status === "Completed") {
          clearInterval(interval);

          navigate(`/consultation/review/${res.data.requestId}`);
        }
      } catch (error) {
        console.error(error);
        setError(
          error.response?.data?.message ||
            "Unable to check the request status.",
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="waiting-container">
      <div className="waiting-card">
        <div className="spinner"></div>
        <h2>Waiting for Student...</h2>
        <p>Please don't close this page.</p>
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  );
}

export default WaitingConsultation;
