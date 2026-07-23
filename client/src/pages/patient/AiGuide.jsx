import { useState } from "react";
import { Link } from "react-router-dom";
import { getAiGuidance } from "../../services/PatientApi";
import "./AiGuide.css";

const welcome =
  "Hello, I’m AYUSH Care Guide. I can share general health information and help you decide when to seek care. I do not diagnose or replace a clinician.";

export default function AiGuide() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: welcome },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const usePrompt = (text) => setDraft(text);

  const send = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;
    setMessages((items) => [...items, { role: "user", text }]);
    setDraft("");
    setLoading(true);
    try {
      const response = await getAiGuidance(text);
      setMessages((items) => [
        ...items,
        { role: "assistant", text: response.data.reply },
      ]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          text: "I’m unable to respond right now. Please request a consultation if you need support.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="guide-page">
      <header className="guide-header">
        <div>
          <Link to="/patient/dashboard" className="back-link">
            ← Dashboard
          </Link>
          <p className="eyebrow">PRIVATE HEALTH GUIDANCE</p>
          <h1>AYUSH Care Guide</h1>
          <p>
            General information only — not a diagnosis or emergency service.
          </p>
        </div>
        <Link className="consult-link" to="/consultation/create">
          Request consultation
        </Link>
      </header>
      <section className="chat-panel" aria-live="polite">
        <div className="urgent-note">
          For severe symptoms, trouble breathing, chest pain, severe bleeding,
          or an immediate risk to safety, seek emergency care now.
        </div>
        <div className="guide-messages">
          {messages.map((message, index) => (
            <div key={index} className={`guide-message ${message.role}`}>
              {message.text}
            </div>
          ))}
          {loading && <div className="guide-message assistant">Thinking…</div>}
        </div>
        <div className="guide-prompts">
          <button
            type="button"
            onClick={() =>
              usePrompt("What are simple ways to improve my sleep?")
            }
          >
            Better sleep
          </button>
          <button
            type="button"
            onClick={() =>
              usePrompt("What can I do for mild seasonal cold symptoms?")
            }
          >
            Seasonal cold
          </button>
          <button
            type="button"
            onClick={() =>
              usePrompt("How can I build a healthier daily routine?")
            }
          >
            Healthy routine
          </button>
        </div>
        <form onSubmit={send} className="guide-composer">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength="1500"
            placeholder="Describe your general health question…"
            aria-label="Health question"
          />
          <button disabled={loading || !draft.trim()}>
            {loading ? "Sending…" : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}
