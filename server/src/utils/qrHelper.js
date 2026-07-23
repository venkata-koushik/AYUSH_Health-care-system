import QRCode from "qrcode";

export const buildQrPayload = (patient) => {
  if (!patient) {
    return "AYUSH|unknown";
  }

  const uhid = patient.uhid || `PATIENT-${patient.id}`;
  return `AYUSH|${uhid}|${patient.fullName || "patient"}`;
};

export const generateQrDataUrl = async (value) => {
  if (!value || String(value).trim() === "") {
    throw new Error("QR value is required");
  }

  return QRCode.toDataURL(String(value));
};
