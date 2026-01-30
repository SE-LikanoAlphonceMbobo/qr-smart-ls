import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          QR Platform
        </Typography>

        {user && (
          <Typography sx={{ mr: 3 }}>
            Welcome, <strong>{user.name}</strong>
          </Typography>
        )}

        <Box display="flex" gap={2}>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/qr-generator')}>
            Generate QR
          </Button>
          <Button color="error" variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
