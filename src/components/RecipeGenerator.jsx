import { useState } from "react";
import { createRecipe } from "../api";

const CUISINES = ["Any", "Italian", "Mexican", "Indian", "Thai", "Mediterranean"];

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [dietary, setDietary] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e) {
    e.preventDefault();
    if (!ingredients.trim()) {
      setError("List a few ingredients first — even just two or three.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await createRecipe(ingredients.trim(), cuisine, dietary.trim());
      setRecipe(result);
    } catch (err) {
      setError(err.message || "Couldn't put a recipe together. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-panel">
      <div className="tool-panel-head">
        <div>
          <span className="eyebrow">03 · Recipe Creator</span>
          <h3>Got ingredients? We'll make it dinner.</h3>
        </div>
      </div>

      <div className="tool-panel-body two-col">
        <form className="form-grid" onSubmit={handleGenerate}>
          <div>
            <label className="field-label" htmlFor="recipe-ingredients">
              Ingredients on hand
            </label>
            <textarea
              id="recipe-ingredients"
              className="field"
              placeholder="chicken thighs, canned tomatoes, garlic, spinach"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-row-2">
            <div>
              <label className="field-label" htmlFor="recipe-cuisine">
                Cuisine
              </label>
              <select
                id="recipe-cuisine"
                className="field"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              >
                {CUISINES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="recipe-dietary">
                Dietary notes
              </label>
              <input
                id="recipe-dietary"
                className="field"
                placeholder="gluten-free, no nuts…"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="btn btn-coral" type="submit" disabled={loading}>
            {loading ? "Cooking…" : "Create recipe →"}
          </button>
        </form>

        <div className="output-frame">
          {loading && (
            <div className="loading-strip">
              <span className="pulse-dot" /> simmering ideas
            </div>
          )}

          {!loading && recipe && (
            <>
              <div className="recipe-output">{recipe}</div>
              <div className="download-row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setRecipe("");
                    setIngredients("");
                    setDietary("");
                  }}
                >
                  Clear
                </button>
              </div>
            </>
          )}

          {!loading && !recipe && (
            <p className="placeholder">
              Nothing cooked up yet. Add what's in your fridge on the left and hit
              create — your recipe lands here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
