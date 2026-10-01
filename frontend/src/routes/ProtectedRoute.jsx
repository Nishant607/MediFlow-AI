import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to respective dashboard if role mismatch
    if (currentUser.role === 'patient') return <Navigate to="/patient/dashboard" replace />;
    if (currentUser.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
