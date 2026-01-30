import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Paper, Alert, InputAdornment, IconButton, Select, MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "In what city were you born?",
  "What is your favorite movie?",
  "What is the name of your first school?"
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    security_question: '',
    security_answer: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      // Call Backend
      await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        security_question: formData.security_question,
        security_answer: formData.security_answer
      });

      // Redirect to login on success
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 500, borderRadius: 3 }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom color="primary">
          Create Account
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Join our platform today
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          {/* Personal Info */}
          <TextField
            label="Full Name"
            name="name"
            variant="outlined"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            label="Email Address"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            required
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Phone Number"
            name="phone"
            variant="outlined"
            fullWidth
            required
            value={formData.phone}
            onChange={handleChange}
          />

          {/* Password */}
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            required
            value={formData.password}
            onChange={handleChange}
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
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            variant="outlined"
            fullWidth
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {/* Security */}
          <Typography variant="subtitle2" sx={{ mt: 1 }}>Security Setup</Typography>
          <Select
            label="Security Question"
            name="security_question"
            value={formData.security_question}
            onChange={handleChange}
            displayEmpty
            required
            fullWidth
          >
            <MenuItem value="" disabled>Select a question...</MenuItem>
            {SECURITY_QUESTIONS.map((q, idx) => (
              <MenuItem key={idx} value={q}>{q}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Security Answer"
            name="security_answer"
            type="text"
            variant="outlined"
            fullWidth
            required
            helperText="This will be used to verify your identity if you forget your password."
            value={formData.security_answer}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Already have an account? <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;