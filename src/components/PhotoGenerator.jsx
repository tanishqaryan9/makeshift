import { useState } from "react";
import { generateImage } from "../api";

const IDEAS = [
  "a lighthouse made of stained glass at dusk",
  "a corgi astronaut planting a flag on toast",
  "brutalist library floating above the clouds",
  "a neon jellyfish drifting through a subway station",
];

export default function PhotoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e) {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Give it something to draw. A blank prompt gets a blank stare.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const url = await generateImage(prompt.trim());
      setImageUrl(url);
    } catch (err) {
      setError(err.message || "Image generation failed. Backend might be sleeping.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-panel">
      <div className="tool-panel-head">
        <div>
          <span className="eyebrow">01 · Photo Generator</span>
          <h3>Describe it. We'll draw it.</h3>
        </div>
      </div>

      <div className="tool-panel-body two-col">
        <form className="form-grid" onSubmit={handleGenerate}>
          <div>
            <label className="field-label" htmlFor="photo-prompt">
              Prompt
            </label>
            <textarea
              id="photo-prompt"
              className="field"
              placeholder="a diner floating in outer space, neon signs, 35mm film"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />
          </div>

          <div className="tag-select">
            {IDEAS.map((idea) => (
              <button
                type="button"
                key={idea}
                onClick={() => setPrompt(idea)}
                title="Use this idea"
              >
                {idea}
              </button>
            ))}
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="btn btn-blue" type="submit" disabled={loading}>
            {loading ? "Rendering…" : "Generate image →"}
          </button>
        </form>

        <div className="output-frame">
          {loading && (
            <div className="loading-strip">
              <span className="pulse-dot" /> painting pixels, hold on
            </div>
          )}

          {!loading && imageUrl && (
            <>
              <img src={imageUrl} alt={prompt} />
              <div className="download-row">
                <a className="btn" href={imageUrl} download="generated-image.png">
                  Download PNG
                </a>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setImageUrl(null);
                    setPrompt("");
                  }}
                >
                  Clear
                </button>
              </div>
            </>
          )}

          {!loading && !imageUrl && (
            <p className="placeholder">
              Nothing here yet. Write a prompt on the left and hit generate — your image
              shows up in this frame.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
