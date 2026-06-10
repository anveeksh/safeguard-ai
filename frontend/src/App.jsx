import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import AnalyzePage from "./pages/AnalyzePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DemoModePage from "./pages/DemoModePage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ProfessorDemoPage from "./pages/ProfessorDemoPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import ResearchStudyModePage from "./pages/ResearchStudyModePage.jsx";
import ResearcherDashboardPage from "./pages/ResearcherDashboardPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { useState } from "react";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("safeguard_user"));
  } catch {
    return null;
  }
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("safeguard_token"));
  const [user, setUser] = useState(() => readStoredUser());

  function handleSession(session) {
    localStorage.setItem("safeguard_token", session.access_token);
    localStorage.setItem("safeguard_user", JSON.stringify(session.user));
    setToken(session.access_token);
    setUser(session.user);
  }

  function handleLogout() {
    localStorage.removeItem("safeguard_token");
    localStorage.removeItem("safeguard_user");
    setToken(null);
    setUser(null);
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage token={token} />} />
        <Route path="/professor-demo" element={<ProfessorDemoPage token={token} />} />
        <Route path="/login" element={<AuthPage onSession={handleSession} token={token} />} />
        <Route
          element={
            <ProtectedRoute token={token}>
              <AppShell user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/demo" element={<DemoModePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/researcher" element={<ResearcherDashboardPage />} />
          <Route path="/researcher-dashboard" element={<ResearcherDashboardPage />} />
          <Route path="/settings" element={<SettingsPage user={user} onLogout={handleLogout} />} />
          <Route path="/research" element={<ResearchStudyModePage />} />
          <Route path="/research-mode" element={<ResearchStudyModePage />} />
        </Route>
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
