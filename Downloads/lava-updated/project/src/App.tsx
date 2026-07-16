import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AssessmentProvider, useAssessment } from './context/AssessmentContext';

// Route-level code splitting: each page loads on demand instead of shipping one large bundle.
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ModulePage = lazy(() => import('./pages/ModulePage').then(m => ({ default: m.ModulePage })));
const ReportPage = lazy(() => import('./pages/ReportPage').then(m => ({ default: m.ReportPage })));
const CertificatePage = lazy(() => import('./pages/CertificatePage').then(m => ({ default: m.CertificatePage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const PracticePage = lazy(() => import('./pages/PracticePage').then(m => ({ default: m.PracticePage })));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-100 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-lava-500 border-t-transparent animate-spin" />
        <p className="text-sm text-ink-500">Loading…</p>
      </div>
    </div>
  );
}

function SessionRestore() {
  const { resumeAssessment } = useAssessment();
  useEffect(() => {
    const saved = localStorage.getItem('lava_assessment_session');
    if (saved) {
      try {
        const { assessmentId } = JSON.parse(saved);
        if (assessmentId) resumeAssessment(assessmentId);
      } catch { /* ignore */ }
    }
  }, [resumeAssessment]);
  return null;
}

function AppRoutes() {
  const { assessment } = useAssessment();
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={assessment ? <DashboardPage /> : <Navigate to="/" replace />} />
        <Route path="/module/:moduleNumber" element={assessment ? <ModulePage /> : <Navigate to="/" replace />} />
        <Route path="/report" element={assessment ? <ReportPage /> : <Navigate to="/" replace />} />
        <Route path="/certificate" element={assessment ? <CertificatePage /> : <Navigate to="/" replace />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AssessmentProvider>
        <BrowserRouter>
          <SessionRestore />
          <AppRoutes />
        </BrowserRouter>
      </AssessmentProvider>
    </ThemeProvider>
  );
}
