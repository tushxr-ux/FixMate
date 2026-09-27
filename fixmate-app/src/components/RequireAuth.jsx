import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Protects routes by role.
   requiredRole: 'customer' | 'provider' | 'admin' | null (public) */
export default function RequireAuth({ children, requiredRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const home = user.role === 'provider' ? '/provider' : user.role === 'admin' ? '/admin' : '/home';
    return <Navigate to={home} replace />;
  }

  return children;
}
