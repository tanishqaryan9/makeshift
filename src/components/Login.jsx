import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3);
}

export default function Login() {
  const { login, signup, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setAuthError(null);
    }
  }, [authError, setAuthError]);

  const isSignup = mode === "signup";
  const strength = passwordStrength(password);

  function switchMode(next) {
    setMode(next);
    setError("");
    setConfirm("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Fill in both fields to continue.");
      return;
    }
    if (isSignup && password.length < 8) {
      setError("Passwords need at least 8 characters.");
      return;
    }
    if (isSignup && password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <span className="brand">
          <span className="dot" /> MAKESHIFT
        </span>

        <div className="pitch">
          <h1>
            Three small <span className="accent">AI tools</span>, thrown together.
          </h1>
          <p className="sub">
            One account gets you a chat assistant, an image generator, recipe
            builder, and a voice studio— no separate sign-ups, no wasted tabs.
          </p>
        </div>

        <div className="auth-tools">
          <span className="tool-line">
            <span className="swatch" style={{ background: "var(--blue)" }} />
            01 · Photo Generator — describe it, we'll draw it
          </span>
          <span className="tool-line">
            <span className="swatch" style={{ background: "var(--yellow)" }} />
            02 · AI Assistant — ask it anything
          </span>
          <span className="tool-line">
            <span className="swatch" style={{ background: "var(--coral)" }} />
            03 · Recipe Creator — turn ingredients into dinner
          </span>
          <span className="tool-line">
            <span className="swatch" style={{ background: "var(--green)" }} />
            04 · Voice Studio — speak to it, or hear it speak
          </span>
        </div>

        <span className="foot-note">© {new Date().getFullYear()} Makeshift. Built with Spring AI.</span>
      </div>

      <div className="auth-formside">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${!isSignup ? "active" : ""}`}
              onClick={() => switchMode("signin")}
            >
              Log in
            </button>
            <button
              type="button"
              className={`auth-tab ${isSignup ? "active" : ""}`}
              onClick={() => switchMode("signup")}
            >
              Sign up
            </button>
          </div>

          <div className="auth-card-body">
            <span className="eyebrow">{isSignup ? "New here" : "Welcome back"}</span>
            <h2>{isSignup ? "Create your account" : "Log in to continue"}</h2>
            <p className="lede">
              {isSignup
                ? "Takes ten seconds. No email confirmation, no nonsense."
                : "Pick up right where you left off with all three tools."}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <label className="field-label" htmlFor="auth-email">
                  Email
                </label>
                <input
                  id="auth-email"
                  className="field"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="auth-password">
                  Password
                </label>
                <div className="password-row">
                  <input
                    id="auth-password"
                    className="field"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {isSignup && password && (
                  <div className="strength-row">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`bar ${i < strength ? "filled" : ""} ${
                          strength === 2 ? "ok" : strength === 3 ? "strong" : ""
                        }`}
                      />
                    ))}
                  </div>
                )}
                {!isSignup && <p className="field-hint">At least 8 characters.</p>}
              </div>

              {isSignup && (
                <div>
                  <label className="field-label" htmlFor="auth-confirm">
                    Confirm password
                  </label>
                  <input
                    id="auth-confirm"
                    className="field"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              )}

              {error && <div className="error-box">{error}</div>}

              <button className="btn btn-solid auth-submit" type="submit" disabled={loading}>
                {loading ? "One moment…" : isSignup ? "Create account →" : "Log in →"}
              </button>
            </form>

            <div className="auth-divider">Or continue with</div>

            <div className="oauth-row">
              <button
                type="button"
                className="oauth-btn"
                onClick={() => window.location.href = "https://springai-learning-jprx.onrender.com/oauth2/authorization/github"}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
              <button
                type="button"
                className="oauth-btn"
                onClick={() => window.location.href = "https://springai-learning.onrender.com/oauth2/authorization/google"}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.19-2.77-6.19-6.19 0-3.41 2.78-6.19 6.19-6.19 1.56 0 2.97.58 4.06 1.54l3.1-3.1C19.21 2.19 15.93 1 12.24 1 5.68 1 .5 6.18.5 12.75S5.68 24.5 12.24 24.5c5.67 0 10.6-3.9 11.8-9.3.24-1.09.34-2.18.34-3.28h-12.14z" />
                </svg>
                Google
              </button>
            </div>

            <p className="auth-switch-line">
              {isSignup ? "Already have an account? " : "Don't have an account yet? "}
              <button type="button" onClick={() => switchMode(isSignup ? "signin" : "signup")}>
                {isSignup ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
