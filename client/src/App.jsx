import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewGDPage from './pages/NewGDPage';
import GDRoomPage from './pages/GDRoomPage';
import ReportPage from './pages/ReportPage';
import ReportsListPage from './pages/ReportsListPage';
import LeaderboardPage from './pages/LeaderboardPage';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/gd/new" element={<NewGDPage />} />
        <Route path="/reports" element={<ReportsListPage />} />
        <Route path="/reports/:sessionId" element={<ReportPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>
      <Route path="/gd/:sessionId" element={<ProtectedRoute><GDRoomPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
