/**
 * App.jsx — Unified Routing
 * ──────────────────────────
 * Route map:
 *   /                → LandingPage  (public)
 *   /login           → LoginPage    (public)
 *   /register        → RegisterPage (public)
 *   /forgot-password → ForgotPasswordPage (public)
 *   /reset-password  → ResetPasswordPage  (public)
 *   /respond/:id     → SurveyRespondPage  (public)
 *   /dashboard, etc. → Protected app shell (requires auth)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// App shell
import Layout from './components/ui/Layout';

// App pages
import LoginPage            from './pages/LoginPage';
import RegisterPage         from './pages/RegisterPage';
import DashboardPage        from './pages/DashboardPage';
import SurveysPage          from './pages/SurveysPage';
import SurveyDetailPage     from './pages/SurveyDetailPage';
import SurveyCreatePage     from './pages/SurveyCreatePage';
import ClientsPage          from './pages/ClientsPage';
import ClientDetailPage     from './pages/ClientDetailPage';
import AssignmentsPage      from './pages/AssignmentsPage';
import AnalyticsPage        from './pages/AnalyticsPage';
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage';
import DistributionPage     from './pages/DistributionPage';
import ExportPage           from './pages/ExportPage';
import ForgotPasswordPage   from './pages/ForgotPasswordPage';
import ResetPasswordPage    from './pages/ResetPasswordPage';
import UsersPage            from './pages/UsersPage';
import SurveyRespondPage    from './pages/SurveyRespondPage';

// Landing page (scoped, isolated styles)
import LandingPage from './landing/LandingPage';

// ── Route guards ──────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  return user?.role === 'admin' ? children : <Navigate to="/app/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Landing (root) ── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Public app routes ── */}
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
        <Route path="/reset-password"   element={<ResetPasswordPage />} />
        <Route path="/respond/:surveyId" element={<SurveyRespondPage />} />

        {/* ── Protected app shell ── */}
        <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"              element={<DashboardPage />} />
          <Route path="surveys"                element={<SurveysPage />} />
          <Route path="surveys/new"            element={<SurveyCreatePage />} />
          <Route path="surveys/:id"            element={<SurveyDetailPage />} />
          <Route path="surveys/:id/edit"       element={<SurveyCreatePage />} />
          <Route path="clients"                element={<ClientsPage />} />
          <Route path="clients/:id"            element={<ClientDetailPage />} />
          <Route path="assignments"            element={<AssignmentsPage />} />
          <Route path="analytics"              element={<AnalyticsPage />} />
          <Route path="analytics/advanced"     element={<AdvancedAnalyticsPage />} />
          <Route path="distribution"           element={<DistributionPage />} />
          <Route path="export"                 element={<ExportPage />} />
          <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        </Route>

        {/* Legacy /dashboard redirect → /app/dashboard */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

        {/* Catch-all: if authenticated go to app, else landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
