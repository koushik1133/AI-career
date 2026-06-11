import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResumePage from './pages/ResumePage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import JobsPage from './pages/JobsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NetworkingPage from './pages/NetworkingPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/resume" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/resume" replace />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="builder" element={<ResumeBuilderPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="networking" element={<NetworkingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
