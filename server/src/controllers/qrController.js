import Patient from "../models/patientModel.js";
import { buildQrPayload, generateQrDataUrl } from "../utils/qrHelper.js";

export const getPatientQr = async (req, res) => {
  try {
    const patientId = req.user?.patientId;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient login required",
      });
    }

    const patient = await Patient.findByPk(patientId, {
      attributes: ["id", "uhid", "fullName"],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const payload = buildQrPayload(patient);
    const qrCode = await generateQrDataUrl(payload);

    return res.status(200).json({
      success: true,
      qrCode,
      payload,
      patient: {
        id: patient.id,
        uhid: patient.uhid,
        fullName: patient.fullName,
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate QR code",
    });
  }
};
