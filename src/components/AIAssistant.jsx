import { useState, useRef, useEffect } from "react";
import { askAI } from "../api";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setError("");
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const answer = await askAI(text);
      setMessages((m) => [...m, { role: "ai", text: answer }]);
    } catch (err) {
      setError(err.message || "The assistant didn't respond. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-panel">
      <div className="tool-panel-head">
        <div>
          <span className="eyebrow">02 · AI Assistant</span>
          <h3>Ask it something real.</h3>
        </div>
        {messages.length > 0 && (
          <button type="button" className="btn" onClick={() => setMessages([])}>
            Clear thread
          </button>
        )}
      </div>

      <div className="tool-panel-body">
        <div className="chat-thread" ref={threadRef}>
          {messages.length === 0 && (
            <p className="placeholder">
              No messages yet. Ask about anything — debugging, planning, or just thinking
              out loud.
            </p>
          )}

          {messages.map((m, i) => (
            <div className={`chat-bubble ${m.role}`} key={i}>
              <span className="who">{m.role === "user" ? "You" : "Assistant"}</span>
              {m.text}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble ai">
              <span className="who">Assistant</span>
              <div className="loading-strip">
                <span className="pulse-dot" /> thinking
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-box">{error}</div>}

        <form className="chat-input-row" onSubmit={handleSend}>
          <textarea
            className="field"
            placeholder="Type a question and hit send…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button className="btn btn-solid" type="submit" disabled={loading || !input.trim()}>
            Send →
          </button>
        </form>
      </div>
    </section>
  );
}
