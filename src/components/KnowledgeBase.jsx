import { useState, useRef, useEffect } from "react";
import { askDocs, uploadDocument, listDocuments, deleteDocument } from "../api";

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const threadRef = useRef(null);
  const fileRef = useRef(null);

  // Load existing documents once, when the tab opens
  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await uploadDocument(file);
      setDocs(await listDocuments());
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = ""; // allow re-uploading the same file
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      await deleteDocument(id);
      setDocs((d) => d.filter((x) => x.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setError("");
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const answer = await askDocs(text);
      setMessages((m) => [...m, { role: "ai", text: answer }]);
    } catch (err) {
      setError(err.message || "No answer came back. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-panel">
      <div className="tool-panel-head">
        <div>
          <span className="eyebrow">05 · Knowledge Base</span>
          <h3>Ask your own documents.</h3>
        </div>
        {messages.length > 0 && (
          <button type="button" className="btn" onClick={() => setMessages([])}>
            Clear thread
          </button>
        )}
      </div>

      <div className="tool-panel-body">
        {/* Upload + document list */}
        <div>
          <label className="field-label" htmlFor="kb-file">
            Add a document
          </label>
          <input
            id="kb-file"
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md"
            className="field"
            onChange={handleUpload}
            disabled={uploading}
          />
          <p className="field-hint">
            {uploading ? "Reading and indexing…" : "PDF, TXT or Markdown, up to 10 MB."}
          </p>

          {docs.length > 0 && (
            <ul className="doc-list">
              {docs.map((d) => (
                <li key={d.id}>
                  <span title={d.filename}>
                    {d.filename} · {d.chunkCount} chunks
                  </span>
                  <button type="button" className="btn" onClick={() => handleDelete(d.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat */}
        <div className="chat-thread" ref={threadRef}>
          {messages.length === 0 && (
            <p className="placeholder">
              {docs.length === 0
                ? "Upload a document first, then ask questions about it."
                : "Ask something your documents can answer."}
            </p>
          )}

          {messages.map((m, i) => (
            <div className={`chat-bubble ${m.role}`} key={i}>
              <span className="who">{m.role === "user" ? "You" : "Knowledge Base"}</span>
              {m.text}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble ai">
              <span className="who">Knowledge Base</span>
              <div className="loading-strip">
                <span className="pulse-dot" /> searching your documents
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-box">{error}</div>}

        <form className="chat-input-row" onSubmit={handleSend}>
          <textarea
            className="field"
            placeholder="Ask a question about your documents…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button
            className="btn btn-solid"
            type="submit"
            disabled={loading || !input.trim() || docs.length === 0}
          >
            Ask →
          </button>
        </form>
      </div>
    </section>
  );
}