import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function AdminProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not admin
  if (user?.role !== 'Admin') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

