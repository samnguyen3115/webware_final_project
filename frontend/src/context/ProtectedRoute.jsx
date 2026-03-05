import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const hasRoleRestriction = Array.isArray(allowedRoles) && allowedRoles.length > 0;
  const hasAccess = !hasRoleRestriction || allowedRoles.includes(user?.role);

  if (!hasAccess) {
    if (user?.role === 'admin') {
      return <Navigate to="/benchmark" />;
    }
    if (user?.role === 'school') {
      return <Navigate to="/dashboard" />;
    }
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
