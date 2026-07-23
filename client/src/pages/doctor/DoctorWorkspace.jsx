import "./DoctorWorkspace.css";
import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getDoctorWorkspace,
  getDoctorWorkspaceSummary,
  generateConsultationDraft,
  saveDoctorEHR,
} from "../../services/DoctorApi";

const DIAGNOSIS_CATEGORIES = [
  "Respiratory",
  "Gastrointestinal",
  "Musculoskeletal",
  "Neurological",
  "Dermatological",
  "Cardiovascular",
  "Endocrine",
  "Genitourinary",
  "ENT",
  "Ophthalmic",
  "Mental Health",
  "General / Other",
];

const createInitialForm = () => ({
  complaint: "",
  diagnosis: "",
  diagnosisCategories: [],
  otherDiagnosisDetails: "",
  medicines: "",
  advice: "",
  followUpDate: "",
  manualNotes: "",
  reportPhoto: "",
});

function DoctorWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  // --- State ---
  const [patient, setPatient] = useState(null);
  const [recentVisits, setRecentVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [notice, setNotice] = useState("");
  const [isHandlingScan, setIsHandlingScan] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [workspaceSummary, setWorkspaceSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiReviewNote, setAiReviewNote] = useState("");
  const [reportName, setReportName] = useState("");

  const [formData, setFormData] = useState(createInitialForm);

  // --- Refs ---
  const scannerRef = useRef(null);
  const readerDivRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const transcriptRef = useRef("");
  const shouldListenRef = useRef(false);
  const voiceRestartTimerRef = useRef(null);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDiagnosisCategory = (category) => {
    setFormData((previous) => {
      const selected = previous.diagnosisCategories.includes(category);
      const diagnosisCategories = selected
        ? previous.diagnosisCategories.filter((item) => item !== category)
        : [...previous.diagnosisCategories, category];
      return {
        ...previous,
        diagnosisCategories,
        otherDiagnosisDetails:
          category === "General / Other" && selected
            ? ""
            : previous.otherDiagnosisDetails,
      };
    });
  };

  const stopVoiceRecognition = ({ createDraft = false } = {}) => {
    // Browser recognition sessions may end by themselves after a pause.
    // This flag makes an end final only when the doctor explicitly stops it.
    shouldListenRef.current = false;
    if (voiceRestartTimerRef.current) {
      clearTimeout(voiceRestartTimerRef.current);
      voiceRestartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setVoiceStatus("idle");

    if (createDraft) {
      // Allow the browser to deliver its final speech-recognition result
      // before submitting the temporary transcript to Groq.
      setTimeout(() => handleGenerateDraft(transcriptRef.current), 350);
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      shouldListenRef.current = false;
      setVoiceStatus("idle");
      setVoiceError(
        "Voice dictation is not supported by this browser. Please use Chrome or Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("listening");
      setVoiceError("");
    };
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const spokenText = event.results[index][0].transcript.trim();
        if (event.results[index].isFinal) {
          finalTranscript = `${finalTranscript} ${spokenText}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${spokenText}`.trim();
        }
      }

      finalTranscriptRef.current = finalTranscript;
      const combinedTranscript =
        `${finalTranscript} ${interimTranscript}`.trim();
      transcriptRef.current = combinedTranscript;
      setTranscript(combinedTranscript);
    };
    recognition.onerror = (event) => {
      // "no-speech" is normal while waiting for the doctor to speak;
      // onend below will immediately reconnect the live session.
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        shouldListenRef.current = false;
        setVoiceStatus("idle");
        setVoiceError(
          "Microphone access was blocked. Allow microphone access and try again.",
        );
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setVoiceStatus("reconnecting");
        setVoiceError("The microphone paused. Reconnecting voice dictation...");
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);

      if (shouldListenRef.current) {
        setVoiceStatus("reconnecting");
        // Preserve even an unfinished phrase when the browser rolls
        // over to the next recognition session.
        setTranscript((currentTranscript) => {
          finalTranscriptRef.current = currentTranscript.trim();
          transcriptRef.current = currentTranscript.trim();
          return currentTranscript;
        });
        voiceRestartTimerRef.current = setTimeout(() => {
          if (shouldListenRef.current) startVoiceRecognition();
        }, 250);
      }
    };
    recognitionRef.current = recognition;
    try {
      setVoiceStatus("connecting");
      recognition.start();
    } catch (error) {
      // A browser can throw if a previous session is still closing.
      recognition.stop();
    }
  };

  const toggleVoiceRecognition = () => {
    if (shouldListenRef.current) {
      stopVoiceRecognition({ createDraft: true });
      return;
    }

    setVoiceError("");
    setTranscript("");
    finalTranscriptRef.current = "";
    transcriptRef.current = "";
    shouldListenRef.current = true;
    startVoiceRecognition();
  };

  const loadWorkspaceSummary = async () => {
    try {
      const response = await getDoctorWorkspaceSummary();
      setWorkspaceSummary(response.data);
      setSummaryError("");
    } catch (error) {
      console.error("Unable to load workspace summary:", error);
      setSummaryError("Patient activity could not be loaded.");
    }
  };

  const handleReportUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Please choose an image file for the manual report.");
      event.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setNotice("Report image must be smaller than 3 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((previous) => ({
        ...previous,
        reportPhoto: String(reader.result || ""),
      }));
      setReportName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeReport = () => {
    setFormData((previous) => ({ ...previous, reportPhoto: "" }));
    setReportName("");
  };

  const handleGenerateDraft = async (
    sourceTranscript = transcriptRef.current,
  ) => {
    if (!sourceTranscript.trim()) {
      setAiError("Start the microphone and speak before creating a draft.");
      return;
    }
    try {
      setAiLoading(true);
      setAiError("");
      const response = await generateConsultationDraft(
        sourceTranscript,
        {
          dateOfBirth: patient?.dateOfBirth,
          allergies: patient?.allergies,
          chronicConditions: patient?.chronicConditions,
        },
        patient?.uhid,
      );
      const draft = response.data.draft;
      setFormData((previous) => ({
        ...previous,
        complaint: draft.complaint || previous.complaint,
        diagnosis: draft.diagnosis || previous.diagnosis,
        diagnosisCategories: draft.diagnosisCategories?.length
          ? draft.diagnosisCategories
          : previous.diagnosisCategories,
        medicines: draft.medicines || previous.medicines,
        advice: draft.advice || previous.advice,
        followUpDate: draft.followUpDate || previous.followUpDate,
      }));
      setAiReviewNote(
        draft.reviewNote || "Review all AI-generated fields before saving.",
      );
      setNotice(
        "AI draft applied. Review every field before saving the consultation.",
      );
    } catch (error) {
      console.error("Unable to generate AI draft:", error);
      setAiError(
        error.response?.data?.message || "Unable to create an AI draft.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const startScanner = () => {
    setScannerOpen(true);
    setScanError("");
    setNotice("");

    // Wait for DOM to render the reader div
    setTimeout(() => {
      if (!readerDivRef.current) return;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      if (scannerRef.current) return;
      scannerRef.current = new Html5Qrcode("qr-reader");

      scannerRef.current
        .start(
          { facingMode: "environment" }, // Prefer back camera
          config,
          async (decodedText) => {
            // Success callback
            await handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Parse error, usually ignored as it fires every frame until success
          },
        )
        .catch((err) => {
          console.error("Failed to start scanner", err);
          setScanError("Could not access camera. Please check permissions.");
          setScannerOpen(false);
        });
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();

        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
    setScannerOpen(false);
  };

  const handleScanSuccess = async (decodedText) => {
    if (isHandlingScan) return;
    setIsHandlingScan(true);

    // Stop scanner immediately after success
    await stopScanner();

    const parts = decodedText.trim().split("|");
    if (parts.length < 2) {
      setScanError("This QR code is not a valid patient QR code.");
      setIsHandlingScan(false);
      return;
    }

    // Assuming format: "TYPE|UHID|..."
    const uhid = parts[1].trim();
    if (!uhid) {
      setScanError("This QR code does not contain a patient UHID.");
      setIsHandlingScan(false);
      return;
    }

    await loadPatient(uhid);
    setIsHandlingScan(false);
  };

  const loadPatient = async (uhid) => {
    try {
      setLoading(true);
      setNotice("");
      const res = await getDoctorWorkspace(uhid);

      setPatient(res.data.patient);
      setRecentVisits(res.data.recentVisits || []);
      setTranscript("");
      finalTranscriptRef.current = "";
      transcriptRef.current = "";
      setAiReviewNote("");

      // Reset form for new patient
      setFormData(createInitialForm());
      setReportName("");
      setSelectedVisit(null);
    } catch (error) {
      console.error("Error loading patient:", error);
      setPatient(null);
      setRecentVisits([]);
      setScanError(
        error.response?.data?.message ||
          "Patient not found. Please scan a valid patient QR code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVisit = async (e) => {
    e.preventDefault();
    if (!patient) return;

    try {
      setLoading(true);
      const visitData = {
        uhid: patient.uhid,
        ...formData,
      };

      await saveDoctorEHR(visitData);

      // A completed consultation must never remain active for the next patient.
      setPatient(null);
      setRecentVisits([]);
      setSelectedVisit(null);
      setFormData(createInitialForm());
      setReportName("");
      setTranscript("");
      finalTranscriptRef.current = "";
      transcriptRef.current = "";
      setAiReviewNote("");
      stopVoiceRecognition();
      setNotice("Consultation saved. Waiting for the next patient.");
      loadWorkspaceSummary();
    } catch (error) {
      console.error("Error saving visit:", error);
      setNotice(
        error.response?.data?.message ||
          "Unable to save the consultation. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    loadWorkspaceSummary();
    return () => {
      if (scannerRef.current) {
        stopScanner();
      }
      stopVoiceRecognition();
    };
  }, []);

  useEffect(() => {
    if (location.state?.uhid) {
      loadPatient(location.state.uhid);
    }
  }, [location.state]);

  return (
    <div className="doctor-workspace">
      <header className="workspace-header">
        <div className="workspace-brand">
          <span className="brand-mark">✚</span>
          <div>
            <p className="eyebrow">AYUSH Digital Health Portal</p>
            <h1>Clinical Workspace</h1>
          </div>
        </div>
        <div className="workspace-actions">
          <button
            className="btn-profile"
            onClick={() => navigate("/doctor/profile")}
          >
            View profile
          </button>
          <button
            className="btn-scan"
            onClick={startScanner}
            disabled={scannerOpen || loading}
          >
            {scannerOpen ? "Scanning..." : "Scan Patient QR"}
          </button>
        </div>
      </header>

      <section className="workspace-metrics" aria-label="Patient activity">
        {summaryError ? (
          <p className="workspace-error">{summaryError}</p>
        ) : (
          [
            ["Patients this week", workspaceSummary?.patientsLastWeek],
            ["Patients this month", workspaceSummary?.patientsLastMonth],
            ["Total patients", workspaceSummary?.totalPatients],
            ["Consultations saved", workspaceSummary?.consultations],
          ].map(([label, value]) => (
            <div className="metric-card" key={label}>
              <span>{label}</span>
              <strong>{workspaceSummary ? value : "—"}</strong>
            </div>
          ))
        )}
      </section>

      {notice && (
        <p className="workspace-notice" role="status">
          {notice}
        </p>
      )}
      {scanError && !scannerOpen && (
        <p className="workspace-error" role="alert">
          {scanError}
        </p>
      )}

      {/* Scanner Modal/Section */}
      {scannerOpen && (
        <div className="scanner-overlay">
          <div className="scanner-container">
            <h3>Align QR Code within the box</h3>
            <div
              id="qr-reader"
              ref={readerDivRef}
              style={{ width: "100%" }}
            ></div>
            {scanError && <p className="error">{scanError}</p>}
            <button className="btn-close" onClick={stopScanner}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Patient Info Section */}
      {loading && <div className="loading">Loading...</div>}

      {patient && !loading && (
        <div className="workspace-grid">
          <section className="patient-column">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Patient summary</p>
                <h2>Current patient</h2>
              </div>
              <span className="live-dot">Active</span>
            </div>
            <div className="patient-info-card">
              <div className="patient-avatar">
                {patient.fullName?.charAt(0) || "P"}
              </div>
              <div>
                <h3>{patient.fullName}</h3>
                <p className="patient-uhid">UHID: {patient.uhid}</p>
              </div>
              <dl className="patient-facts">
                <div>
                  <dt>Date of birth</dt>
                  <dd>{patient.dateOfBirth || "Not available"}</dd>
                </div>
                <div>
                  <dt>Blood group</dt>
                  <dd>{patient.bloodgroup || "Not available"}</dd>
                </div>
                <div>
                  <dt>Allergies</dt>
                  <dd>{patient.allergies || "None recorded"}</dd>
                </div>
                <div>
                  <dt>Chronic conditions</dt>
                  <dd>{patient.chronicConditions || "None recorded"}</dd>
                </div>
              </dl>
            </div>

            <div className="history-section">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Clinical record</p>
                  <h2>Recent visits</h2>
                </div>
                <span>{recentVisits.length} total</span>
              </div>
              {recentVisits.length === 0 ? (
                <p className="empty-history">No previous visits recorded.</p>
              ) : (
                <ul className="visits-list">
                  {recentVisits.map((visit, index) => (
                    <li
                      key={visit.id || index}
                      className={`visit-item ${selectedVisit === index ? "active" : ""}`}
                      onClick={() => setSelectedVisit(index)}
                    >
                      <span>
                        {visit.visitDate ||
                          new Date(visit.createdAt).toLocaleDateString()}
                      </span>
                      <strong>{visit.diagnosis || "Consultation"}</strong>
                      <small>
                        {visit.Doctor?.fullName || "AYUSH practitioner"}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
              {selectedVisit !== null && recentVisits[selectedVisit] && (
                <div className="visit-details">
                  <h4>Visit details</h4>
                  <p>
                    <strong>Complaint:</strong>{" "}
                    {recentVisits[selectedVisit].complaint}
                  </p>
                  <p>
                    <strong>Medicines:</strong>{" "}
                    {recentVisits[selectedVisit].medicines || "Not recorded"}
                  </p>
                  <p>
                    <strong>Advice:</strong>{" "}
                    {recentVisits[selectedVisit].advice || "Not recorded"}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="consultation-column">
            <div className="ehr-form-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Structured clinical dictation</p>
                  <h2>Consultation</h2>
                </div>
                <span
                  className={`mic-status ${voiceStatus !== "idle" ? "recording" : ""}`}
                >
                  {voiceStatus === "listening"
                    ? "Mic on"
                    : voiceStatus === "reconnecting"
                      ? "Reconnecting"
                      : voiceStatus === "connecting"
                        ? "Connecting"
                        : "Mic off"}
                </span>
              </div>
              <form onSubmit={handleSaveVisit}>
                <div className="dictation-panel">
                  <div className="dictation-toolbar">
                    <div>
                      <h3>Private voice notes</h3>
                      <p>
                        Visible only in this box and cleared after this
                        consultation.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`btn-mic ${voiceStatus !== "idle" ? "is-listening" : ""}`}
                      onClick={toggleVoiceRecognition}
                    >
                      <span aria-hidden="true">
                        {voiceStatus !== "idle" ? "■" : "🎙"}
                      </span>
                      {voiceStatus !== "idle" ? "Stop mic" : "Start mic"}
                    </button>
                  </div>
                  <div className="transcript-box" aria-live="polite">
                    {transcript ||
                      "Tap Start mic and speak. Your live transcript will appear only here."}
                  </div>
                  {voiceError && (
                    <p className="voice-error" role="alert">
                      {voiceError}
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn-ai-draft"
                    onClick={handleGenerateDraft}
                    disabled={aiLoading || !transcript.trim()}
                  >
                    {aiLoading
                      ? "Creating clinical draft..."
                      : "Create AI clinical draft"}
                  </button>
                  <p className="ai-disclaimer">
                    AI suggestions are provisional. Review every diagnosis,
                    medicine, advice, and follow-up date before saving.
                  </p>
                  {aiError && (
                    <p className="voice-error" role="alert">
                      {aiError}
                    </p>
                  )}
                  {aiReviewNote && (
                    <p className="ai-review-note">
                      <strong>AI review note:</strong> {aiReviewNote}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Complaint / Problem</label>
                  <textarea
                    name="complaint"
                    value={formData.complaint}
                    onChange={handleChange}
                    required
                    placeholder="Describe the patient's main concern, duration, severity, and related symptoms"
                  />
                </div>

                <div className="form-group">
                  <label>Diagnosis</label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    required
                    placeholder="Provisional diagnosis or differential diagnosis"
                  />
                  <span className="field-help">
                    Select all applicable systems. AI can suggest these; the
                    doctor must confirm them.
                  </span>
                  <div
                    className="diagnosis-category-list"
                    aria-label="Diagnosis categories"
                  >
                    {DIAGNOSIS_CATEGORIES.map((category) => {
                      const selected =
                        formData.diagnosisCategories.includes(category);
                      return (
                        <button
                          type="button"
                          key={category}
                          className={`diagnosis-category ${selected ? "selected" : ""}`}
                          aria-pressed={selected}
                          onClick={() => toggleDiagnosisCategory(category)}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                  {formData.diagnosisCategories.includes("General / Other") && (
                    <input
                      type="text"
                      name="otherDiagnosisDetails"
                      value={formData.otherDiagnosisDetails}
                      onChange={handleChange}
                      required
                      placeholder="Describe the other diagnosis category"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Medicines</label>
                  <textarea
                    name="medicines"
                    value={formData.medicines}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Advice</label>
                  <textarea
                    name="advice"
                    value={formData.advice}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Manual notes / suggestions</label>
                  <textarea
                    name="manualNotes"
                    value={formData.manualNotes}
                    onChange={handleChange}
                    placeholder="Add doctor notes that should be saved with this consultation"
                  />
                </div>

                <div className="form-group report-upload-group">
                  <label htmlFor="manual-report">Manual report upload</label>
                  <input
                    id="manual-report"
                    type="file"
                    accept="image/*"
                    onChange={handleReportUpload}
                  />
                  <small>Image files only, up to 3 MB.</small>
                  {reportName && (
                    <div className="report-selected">
                      <span>{reportName}</span>
                      <button type="button" onClick={removeReport}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="btn-save" disabled={loading}>
                  Save Consultation
                </button>
              </form>
            </div>
          </section>
        </div>
      )}

      {!patient && !loading && !scannerOpen && (
        <div className="empty-state">
          <h2>Waiting for next patient</h2>
          <p>Scan a patient QR code to begin a consultation.</p>
        </div>
      )}
    </div>
  );
}

export default DoctorWorkspace;
