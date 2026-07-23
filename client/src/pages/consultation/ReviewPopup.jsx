import "./ReviewPopup.css";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { submitReview } from "../../services/PatientApi";

function ReviewPopup() {
  const navigate = useNavigate();
  const { consultationId } = useParams();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    try {
      const consultation = JSON.parse(
        localStorage.getItem("consultationRequest") || "null",
      );
      if (
        !consultation?.requestId ||
        !consultation?.consultationType ||
        String(consultation.requestId) !== consultationId
      ) {
        alert("Unable to submit review: missing consultation data.");
        return;
      }

      await submitReview({
        requestId: consultation.requestId,
        consultationType: consultation.consultationType,
        rating,
        feedback,
      });

      localStorage.removeItem("consultationRequest");

      alert("Review submitted successfully.");

      navigate("/patient/dashboard");
    } catch (error) {
      console.error("Review Error:", error);

      alert(error.response?.data?.message || "Unable to submit review.");
    }
  };

  return (
    <div className="review-page">
      <div className="review-card">
        <h1>Consultation Completed</h1>

        <h3>Rate Your Experience</h3>

        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? "active-star" : ""}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          rows="5"
          placeholder="Write your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <button onClick={handleSubmit}>Submit Review</button>
      </div>
    </div>
  );
}

export default ReviewPopup;
