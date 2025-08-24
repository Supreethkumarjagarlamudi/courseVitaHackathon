import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { OccasioContext } from '../context/OccasioContext';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { user, isAuthenticated, loading } = useContext(OccasioContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (requireAuth && (!isAuthenticated || !user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

