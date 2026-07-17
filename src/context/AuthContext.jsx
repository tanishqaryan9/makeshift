import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("userEmail");
    return email ? { email } : null;
  });
  const [authError, setAuthError] = useState(null);

  // Pick up token/email from OAuth2 redirect (?token=...&email=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlEmail = params.get("email");
    const oauthError = params.get("error");

    if (urlToken && urlEmail) {
      setToken(urlToken);
      setUser({ email: urlEmail });
      localStorage.setItem("userEmail", urlEmail);
      // strip params so refresh/back doesn't replay them
      window.history.replaceState({}, "", window.location.pathname);
    } else if (oauthError) {
      console.error("OAuth login failed:", oauthError);
      setAuthError("OAuth authentication failed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
    }
  }, [token]);

  async function login(email, password) {
    const jwt = await loginUser(email, password);
    setToken(jwt);
    setUser({ email });
    localStorage.setItem("userEmail", email);
  }

  async function signup(email, password) {
    const jwt = await registerUser(email, password);
    setToken(jwt);
    setUser({ email });
    localStorage.setItem("userEmail", email);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, isAuthenticated: !!token, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}