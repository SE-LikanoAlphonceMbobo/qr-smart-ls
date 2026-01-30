import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // 2. If not authenticated, redirect to login (replace history to prevent back loop)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If authenticated, render the child component
  return children;
};

export default ProtectedRoute;