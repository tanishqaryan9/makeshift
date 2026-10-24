const API_BASE = "https://springai-learning.onrender.com";

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

// ── Voice Studio: Speech → Text ─────────────────────────────────────────────

export async function transcribeAudio(fileOrBlob) {
  const formData = new FormData();
  // Backend expects @RequestParam("file") MultipartFile — filename matters for content-type sniffing
  const filename = fileOrBlob.name || "recording.webm";
  formData.append("file", fileOrBlob, filename);

  const res = await fetch(`${API_BASE}/ai/audio`, {
    method: "POST",
    headers: authHeaders(), // do NOT set Content-Type — browser sets the multipart boundary
    body: formData,
  });
  if (!res.ok) throw new Error("Couldn't transcribe that audio. Try again.");
  return res.text();
}

// ── Voice Studio: Text → Speech ─────────────────────────────────────────────

export async function textToSpeech(text) {
  const res = await fetch(
    `${API_BASE}/ai/speak?text=${encodeURIComponent(text)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Couldn't generate speech. Try again.");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ── Knowledge Base (RAG) ──────────────────────────────────────────────────

export async function uploadDocument(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/ai/rag/documents`, {
    method: "POST",
    headers: authHeaders(), // no Content-Type, the browser sets the multipart boundary
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed. Use a .pdf, .txt or .md file under 10 MB.");
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/ai/rag/documents`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Couldn't load your documents.");
  return res.json();
}

export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE}/ai/rag/documents/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Couldn't delete that document.");
}

export async function askDocs(question) {
  const res = await fetch(`${API_BASE}/ai/rag/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Couldn't answer from your documents.");
  return (await res.json()).answer;
}
