import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps a route so only authenticated users can access it.
 * Unauthenticated users are sent to /login with the attempted path in state
 * so Login can redirect them back after a successful sign-in.
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard/founder" element={
 *     <ProtectedRoute><FounderDashboard /></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth state to initialise before deciding
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#F4F6F8',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(124,58,237,0.2)',
          borderTop: '3px solid #7C3AED',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → redirect to /login, preserve intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashMap = {
      founder:     '/dashboard/founder',
      investor:    '/dashboard/investor',
      super_admin:      '/dashboard/admin',
      incubator:        '/dashboard/incubator',
      service_provider: '/dashboard/service_provider',
      job_seeker:       '/dashboard/jobseeker'
    };
    return <Navigate to={dashMap[user.role] || '/'} replace />;
  }

  return children;
}
