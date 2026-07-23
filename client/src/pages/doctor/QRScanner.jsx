import "./QRScanner.css";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

function QRScanner() {
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",

      {
        fps: 10,

        qrbox: 250,
      },

      false,
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();

        const parts = decodedText.split("|");

        if (parts.length >= 2) {
          const uhid = parts[1];

          navigate("/doctor/workspace", { state: { uhid } });
        }
      },

      () => {},
    );

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div className="scanner-container">
      <h1>Scan Patient QR</h1>

      <div id="reader"></div>
    </div>
  );
}

export default QRScanner;
