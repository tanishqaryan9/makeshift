const API_BASE = "http://localhost:8081";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Invalid credentials");
  }
  const data = await res.json();
  return data.token;
}

export async function registerUser(email, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Registration failed");
  }
  const data = await res.json();
  return data.token;
}

// ── AI Chat ───────────────────────────────────────────────────────────────

export async function askAI(prompt) {
  const res = await fetch(
    `${API_BASE}/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Couldn't reach the assistant. Try again.");
  return res.text();
}

// ── Image Generation ──────────────────────────────────────────────────────

export async function generateImage(prompt) {
  const res = await fetch(
    `${API_BASE}/ai/generate-image?prompt=${encodeURIComponent(prompt)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Image generation failed. The backend might be sleeping.");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ── Recipe Creator ────────────────────────────────────────────────────────

export async function createRecipe(ingredients, cuisine, dietaryRestrictions) {
  const params = new URLSearchParams({ ingredients, cuisine, dietaryRestrictions });
  const res = await fetch(`${API_BASE}/ai/recipe-creator?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Couldn't put a recipe together. Try again.");
  return res.text();
}
