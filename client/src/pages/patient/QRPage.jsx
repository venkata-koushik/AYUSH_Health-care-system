import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQr } from "../../services/PatientApi";
import "./QRPage.css";

function PatientQR() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const res = await getQr();
        setQrCode(res.data.qrCode);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load QR code.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, []);

  return (
    <div className="qr-page">
      <div className="qr-card">
        <Link className="back-link" to="/patient/dashboard">
          ← Back to dashboard
        </Link>
        <h1>My QR Code</h1>
        <p className="qr-description">
          This QR can be scanned by authorized providers to access your AYUSH
          health profile.
        </p>

        {loading ? (
          <p className="qr-status">Loading QR...</p>
        ) : error ? (
          <p className="qr-error" role="alert">
            {error}
          </p>
        ) : qrCode ? (
          <div className="qr-image-wrapper">
            <img className="qr-image" src={qrCode} alt="Patient QR" />
          </div>
        ) : (
          <p className="qr-status">No QR available yet.</p>
        )}
      </div>
    </div>
  );
}

export default PatientQR;
