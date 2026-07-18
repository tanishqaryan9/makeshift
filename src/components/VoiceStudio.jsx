import { useState, useRef } from "react";
import { transcribeAudio, textToSpeech } from "../api";

const SAMPLE_LINES = [
  "Welcome to Makeshift, three small AI tools thrown together.",
  "Explain black holes like I'm five years old.",
  "Give me a two sentence pep talk for a Monday morning.",
];

export default function VoiceStudio() {
  const [mode, setMode] = useState("listen"); // "listen" | "speak"

  return (
    <section className="tool-panel">
      <div className="tool-panel-head">
        <div>
          <span className="eyebrow">04 · Voice Studio</span>
          <h3>Talk to it. Or make it talk.</h3>
        </div>
        <div className="mode-switch">
          <button
            type="button"
            className={mode === "listen" ? "active" : ""}
            onClick={() => setMode("listen")}
          >
            Speech → Text
          </button>
          <button
            type="button"
            className={mode === "speak" ? "active" : ""}
            onClick={() => setMode("speak")}
          >
            Text → Speech
          </button>
        </div>
      </div>

      {mode === "listen" ? <TranscribePanel /> : <SpeakPanel />}
    </section>
  );
}

// ── Speech → Text ────────────────────────────────────────────────────────

function TranscribePanel() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setTranscript("");
    } catch (err) {
      setError("Couldn't access your microphone. Check permissions and try again.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setTranscript("");
    setError("");
  }

  async function handleTranscribe() {
    if (!audioBlob) return;
    setError("");
    setLoading(true);
    try {
      const text = await transcribeAudio(audioBlob);
      setTranscript(text);
    } catch (err) {
      setError(err.message || "Transcription failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="tool-panel-body two-col">
      <div className="form-grid">
        <div>
          <label className="field-label">Record or upload</label>
          <div className="record-row">
            <button
              type="button"
              className={`btn ${recording ? "btn-coral" : "btn-blue"}`}
              onClick={recording ? stopRecording : startRecording}
            >
              {recording ? (
                <>
                  <span className="rec-dot" /> Stop recording
                </>
              ) : (
                "● Start recording"
              )}
            </button>
            <span className="field-hint">or</span>
            <button
              type="button"
              className="btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={recording}
            >
              Upload audio file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {audioUrl && (
          <div>
            <label className="field-label">Preview</label>
            <audio className="audio-player" src={audioUrl} controls />
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        <button
          className="btn btn-blue"
          type="button"
          onClick={handleTranscribe}
          disabled={!audioBlob || loading || recording}
        >
          {loading ? "Transcribing…" : "Transcribe →"}
        </button>

        {(audioBlob || transcript) && (
          <button type="button" className="btn" onClick={reset}>
            Clear
          </button>
        )}
      </div>

      <div className="output-frame">
        {loading && (
          <div className="loading-strip">
            <span className="pulse-dot" /> listening closely
          </div>
        )}

        {!loading && transcript && <div className="recipe-output">{transcript}</div>}

        {!loading && !transcript && (
          <p className="placeholder">
            Record a clip or upload an audio file on the left, then hit transcribe —
            the text shows up here.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Text → Speech ────────────────────────────────────────────────────────

function SpeakPanel() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSpeak(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Type something for it to say.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const url = await textToSpeech(text.trim());
      setAudioUrl(url);
    } catch (err) {
      setError(err.message || "Couldn't generate speech. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tool-panel-body two-col">
      <form className="form-grid" onSubmit={handleSpeak}>
        <div>
          <label className="field-label" htmlFor="speak-text">
            Text to speak
          </label>
          <textarea
            id="speak-text"
            className="field"
            placeholder="Type or paste what you want to hear…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
        </div>

        <div className="tag-select">
          {SAMPLE_LINES.map((line) => (
            <button type="button" key={line} onClick={() => setText(line)} title="Use this line">
              {line.length > 40 ? line.slice(0, 40) + "…" : line}
            </button>
          ))}
        </div>

        {error && <div className="error-box">{error}</div>}

        <button className="btn btn-coral" type="submit" disabled={loading}>
          {loading ? "Generating…" : "Speak it →"}
        </button>
      </form>

      <div className="output-frame">
        {loading && (
          <div className="loading-strip">
            <span className="pulse-dot" /> warming up the voice
          </div>
        )}

        {!loading && audioUrl && (
          <>
            <audio className="audio-player" src={audioUrl} controls autoPlay />
            <div className="download-row">
              <a className="btn" href={audioUrl} download="speech.mp3">
                Download MP3
              </a>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setAudioUrl(null);
                  setText("");
                }}
              >
                Clear
              </button>
            </div>
          </>
        )}

        {!loading && !audioUrl && (
          <p className="placeholder">
            Write something on the left and hit speak — your audio clip plays right
            here.
          </p>
        )}
      </div>
    </div>
  );
}
