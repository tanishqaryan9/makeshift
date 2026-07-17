import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import PhotoGenerator from "./components/PhotoGenerator";
import AIAssistant from "./components/AIAssistant";
import RecipeGenerator from "./components/RecipeGenerator";

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTool, setActiveTool] = useState("photo"); // "photo" | "chat" | "recipe"
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on tool change (for mobile layout)
  const selectTool = (tool) => {
    setActiveTool(tool);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      {/* Mobile Toggle Button */}
      <button
        type="button"
        className="mobile-toggle"
        onClick={() => setSidebarOpen((s) => !s)}
        aria-label="Toggle Navigation Sidebar"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Navigation Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="dot" />
          <span>MAKESHIFT</span>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                type="button"
                className={activeTool === "photo" ? "active" : ""}
                onClick={() => selectTool("photo")}
              >
                <span className="nav-icon blue">01</span>
                <span>Photo Generator</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={activeTool === "chat" ? "active" : ""}
                onClick={() => selectTool("chat")}
              >
                <span className="nav-icon yellow">02</span>
                <span>AI Assistant</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={activeTool === "recipe" ? "active" : ""}
                onClick={() => selectTool("recipe")}
              >
                <span className="nav-icon coral">03</span>
                <span>Recipe Creator</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">
              {user?.email ? user.email.substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="user-email" title={user?.email}>
              {user?.email || "User"}
            </div>
          </div>
          <button type="button" className="sidebar-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTool === "photo" && <PhotoGenerator />}
        {activeTool === "chat" && <AIAssistant />}
        {activeTool === "recipe" && <RecipeGenerator />}
      </main>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
