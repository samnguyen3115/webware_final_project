import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!token){
    return <Navigate to="/login" />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    if (user?.role === "admin"){
      return <Navigate to="/benchmark" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
