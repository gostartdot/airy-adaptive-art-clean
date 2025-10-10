import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/useAuthStore';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

