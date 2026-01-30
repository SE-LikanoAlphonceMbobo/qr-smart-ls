import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Paper, Alert, InputAdornment, IconButton, Stepper, Step, StepLabel
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const steps = ['Verify Identity', 'Enter OTP', 'Reset Password'];

const ForgotPasswordPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call to send OTP
      // await api.post('/api/auth/send-otp', { email });
      console.log("Simulating OTP sent to:", email);
      setMessage('OTP sent to your registered mobile/email.');
      setActiveStep(1);
    } catch (err) {
      setMessage('Failed to find user.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setActiveStep(2);
      setLoading(false);
      setMessage('');
    }, 1000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      await api.post('/api/auth/reset-password', { email, newPassword });
      alert('Password reset successful. Please login.');
      navigate('/login');
    } catch (err) {
      setMessage('Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f0f2f5">
      <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/login')} sx={{ mb: 2 }}>
          Back
        </Button>
        
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Reset Password
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

        {/* Step 1: Email */}
        {activeStep === 0 && (
          <Box component="form" onSubmit={handleSendOTP} display="flex" flexDirection="column" gap={2}>
            <Typography variant="body2" color="textSecondary">
              Enter your email to receive a One-Time Password (OTP).
            </Typography>
            <TextField label="Email Address" type="email" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </Box>
        )}

        {/* Step 2: OTP */}
        {activeStep === 1 && (
          <Box component="form" onSubmit={handleVerifyOTP} display="flex" flexDirection="column" gap={2}>
            <Typography variant="body2" color="textSecondary">
              Enter the 6-digit code sent to your phone/email.
            </Typography>
            <TextField label="OTP Code" required fullWidth value={otp} onChange={(e) => setOtp(e.target.value)} inputProps={{ maxLength: 6 }} />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              Verify Code
            </Button>
          </Box>
        )}

        {/* Step 3: New Password */}
        {activeStep === 2 && (
          <Box component="form" onSubmit={handleResetPassword} display="flex" flexDirection="column" gap={2}>
            <Typography variant="body2" color="textSecondary">
              Create a new secure password.
            </Typography>
            <TextField 
              label="New Password" 
              type={showPassword ? "text" : "password"} 
              required 
              fullWidth 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;