import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/useAuthStore';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  // Check Redux store for admin users (admin login uses Redux)
  const { user: reduxUser, isAuthenticated: reduxAuthenticated } = useSelector((state: RootState) => state.auth);

  // Check if user is admin (from Redux store - admin login)
  if (reduxAuthenticated && reduxUser?.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  // Check if user is authenticated (from useAuthStore - regular user login)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

