import { useEffect, useState } from "react";
import axios from "axios";

function PatientQR() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const token = localStorage.getItem("patientToken");

        const res = await axios.get("http://localhost:5001/api/qr/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQrCode(res.data.qrCode);
      } catch (error) {
        console.error("QR error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, []);

  if (loading) return <p>Loading QR...</p>;

  return (
    <div>
      <h2>Patient QR</h2>
      {qrCode ? (
        <img src={qrCode} alt="Patient QR" style={{ maxWidth: 300 }} />
      ) : (
        <p>No QR found</p>
      )}
    </div>
  );
}

export default PatientQR;
