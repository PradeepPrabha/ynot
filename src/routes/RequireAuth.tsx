import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

/** Client-side guard. When real auth is connected, ALSO enforce access server-side (RLS / API checks). */
export default function RequireAuth() {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search, reason: 'Log in to view your account.' }} />;
  return <Outlet />;
}
