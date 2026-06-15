import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Theme } from "./types";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Auth from "./components/Auth";
import Workspace from "./components/Workspace";
import FullScreenLoader from "./components/FullScreenLoader";

// View Imports
import Dashboard from "./components/Dashboard";
import AIVisualAnalyzer from "./components/AIVisualAnalyzer";
import AIKeywordGenerator from "./components/AIKeywordGenerator";
import OnPageSeoOptimizer from "./components/OnPageSeoOptimizer";
import AIMetaTagGenerator from "./components/AIMetaTagGenerator";
import WorkspaceArchive from "./components/ProjectHistory";
import UserProfile from "./components/UserProfile";
import AdminDashboard from "./components/AdminDashboard";
import AuditTrail from "./components/AuditTrail";
import FAQManager from "./components/FAQManager";
import FAQViewer from "./components/FAQViewer";
import WorkspaceManager from "./components/WorkspaceManager";
import TeamManagement from "./components/TeamManagement";
import TaskBoard from "./components/TaskBoard";
import ContentApproval from "./components/ContentApproval";

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [isLoading, setIsLoading] = useState(false);
  const [mockUser, setMockUser] = useState<{
    name: string;
    email: string;
    role: string;
    workspaceName?: string;
    workspaceBgUrl?: string;
    workspace_id?: number;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Rehydrate user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Map backend role to frontend role key
        const roleMap: Record<string, string> = {
          'SEO Manager': 'manager',
          'SEO Analyst': 'analyst',
          'Content Writer': 'writer',
          'Admin': 'admin',
        };
        setMockUser({
          name: userData.name,
          email: userData.email,
          role: roleMap[userData.role] || userData.role,
          workspaceName: userData.workspace_name,
          workspace_id: userData.workspace_id,
        });
      } catch (e) {
        // Corrupted data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleAuthSubmit = (data: {
    name: string;
    email: string;
    role: string;
    workspaceName?: string;
    workspace_id?: number;
    token?: string;
  }) => {
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Small delay for the loader animation to feel natural
    setTimeout(() => {
      setMockUser({
        name: data.name,
        email: data.email,
        role: data.role,
        workspaceName: data.workspaceName,
        workspace_id: data.workspace_id,
      });
      setIsLoading(false);
      navigate(data.role === "admin" ? "/admin" : "/workspace/dashboard");
    }, 1500);
  };

  const handleLogout = () => {
    setMockUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isWorkspaceRoute =
    location.pathname.startsWith("/workspace") ||
    location.pathname === "/profile" ||
    location.pathname === "/admin" ||
    location.pathname === "/audit-trail" ||
    location.pathname === "/manage-faqs";

  if (isWorkspaceRoute) {
    if (!mockUser) {
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {!isWorkspaceRoute && (
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          currentView={
            location.pathname === "/login"
              ? "login"
              : location.pathname === "/register"
                ? "register"
                : "landing"
          }
          navigate={(path: string) => {
            if (path === "landing") navigate("/");
            else navigate(`/${path}`);
          }}
        />
      )}

      <main className="flex-grow flex flex-col relative z-0">
        <Routes>
          <Route
            path="/"
            element={
              <Landing
                navigate={(path: string) => {
                  if (path === "landing") navigate("/");
                  else navigate(`/${path}`);
                }}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Auth
                view="login"
                navigate={(path: string) =>
                  navigate(path === "landing" ? "/" : `/${path}`)
                }
                onSubmit={handleAuthSubmit}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Auth
                view="register"
                navigate={(path: string) =>
                  navigate(path === "landing" ? "/" : `/${path}`)
                }
                onSubmit={handleAuthSubmit}
              />
            }
          />

          <Route
            element={
              <Workspace
                theme={theme}
                toggleTheme={toggleTheme}
                mockUser={mockUser}
                setMockUser={setMockUser}
                onLogout={handleLogout}
                setIsLoading={setIsLoading}
              />
            }
          >
            <Route
              path="/workspace/dashboard"
              element={<Dashboard mockUser={mockUser} />}
            />
            <Route
              path="/workspace/task-board"
              element={<TaskBoard mockUser={mockUser} />}
            />
            <Route
              path="/workspace/visual-analyzer"
              element={<AIVisualAnalyzer setIsLoading={setIsLoading} />}
            />
            <Route
              path="/workspace/keyword-generator"
              element={<AIKeywordGenerator setIsLoading={setIsLoading} />}
            />
            <Route
              path="/workspace/on-page-optimizer"
              element={<OnPageSeoOptimizer setIsLoading={setIsLoading} />}
            />
            <Route
              path="/workspace/meta-tag-generator"
              element={<AIMetaTagGenerator setIsLoading={setIsLoading} />}
            />
            <Route
              path="/workspace/content-approval"
              element={<ContentApproval />}
            />
            <Route path="/workspace/archive" element={<WorkspaceArchive />} />
            <Route
              path="/workspace/team"
              element={<TeamManagement mockUser={mockUser} />}
            />
            <Route path="/workspace/faqs" element={<FAQViewer />} />

            <Route
              path="/profile"
              element={
                <UserProfile mockUser={mockUser} setMockUser={setMockUser} />
              }
            />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/manage-workspaces" element={<WorkspaceManager />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/manage-faqs" element={<FAQManager />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AnimatePresence>{isLoading && <FullScreenLoader />}</AnimatePresence>
    </div>
  );
}
