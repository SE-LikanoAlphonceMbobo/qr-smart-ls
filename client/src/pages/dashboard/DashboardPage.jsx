import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, Avatar, Chip, CircularProgress, Alert
} from '@mui/material';
import {
  Restaurant as RestaurantIcon, Link as LinkIcon, QrCode as QrCodeIcon, 
  Add as AddIcon, MenuBook as MenuIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // ✅ import AuthContext

const StatCard = ({ title, value, color, icon }) => (
  <Paper
    elevation={0}
    sx={{
      display: 'flex',
      alignItems: 'center',
      p: 3,
      borderRadius: 3,
      border: '1px solid #e0e0e0',
      bgcolor: 'white',
      transition: '0.3s',
      '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
    }}
  >
    <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h4" fontWeight="bold" color="textPrimary">
        {value}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
        {title}
      </Typography>
    </Box>
  </Paper>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ dynamic user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ totalRestaurants: 0, totalLinks: 0, totalActiveLinks: 0, totalScans: 0 });
  const [recentLinks, setRecentLinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/dashboard');
        setStats(res.data.stats);
        setRecentLinks(res.data.links);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Determine next action
  const getNextAction = () => {
    if (stats.totalRestaurants === 0) {
      return {
        text: "Create Restaurant",
        icon: <AddIcon />,
        path: "/create-restaurant",
        desc: "Start by adding your venue."
      };
    } else if (stats.totalLinks === 0) {
      return {
        text: "Add Links",
        icon: <LinkIcon />,
        path: "/manage-links",
        desc: "Your restaurant is ready. Add your menu and social links."
      };
    } else {
      return {
        text: "Generate QR Code",
        icon: <QrCodeIcon />,
        path: "/qr-generator",
        desc: "Setup complete. Print your QR codes."
      };
    }
  };

  const action = getNextAction();

  const getIconForType = (type) => {
    switch(type) {
      case 'menu': return <MenuIcon />;
      case 'website': return <LinkIcon />;
      default: return <LinkIcon />;
    }
  };

  return (
    <Box>
      {/* Smart Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          {/* Avatar with first letter */}
          <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56, fontSize: 24 }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </Avatar>

          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {user?.name || 'Admin'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {action.desc}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={action.icon}
          size="large"
          onClick={() => navigate(action.path)}
          sx={{ borderRadius: 3, px: 4, py: 1.5, boxShadow: 3 }}
        >
          {action.text}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Grid */}
      <Box display="flex" gap={3} mb={4} flexWrap="wrap" sx={{ '& > *': { flex: '1 1 200px' } }}>
        <StatCard title="Total Restaurants" value={stats.totalRestaurants} color="#1976d2" icon={<RestaurantIcon />} />
        <StatCard title="Active Links" value={stats.totalActiveLinks} color="#2e7d32" icon={<LinkIcon />} />
        <StatCard title="Total Scans" value={stats.totalScans} color="#ed6c02" icon={<QrCodeIcon />} />
      </Box>

      {/* Recent Links */}
      <Paper 
        elevation={0} 
        sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0', minHeight: 300, bgcolor: 'white' }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
            Recent Active Links
          </Typography>
          <Button color="primary" onClick={() => navigate('/dashboard')}>View All</Button>
        </Box>

        {recentLinks.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300} textAlign="center" color="textSecondary">
            <QrCodeIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
            <Typography variant="h5" fontWeight="bold" mb={1}>No links yet</Typography>
            <Typography variant="body1" mb={3} sx={{ maxWidth: 400 }}>
              {stats.totalRestaurants > 0 
                ? "You have a restaurant, but no links yet. Add your first link." 
                : "Create a restaurant first to add links."}
            </Typography>
            {stats.totalRestaurants === 0 && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-restaurant')}
                sx={{ borderRadius: 2, px: 4 }}
              >
                Create Restaurant
              </Button>
            )}
          </Box>
        ) : (
          recentLinks.map((link) => (
            <Box
              key={link.id}
              sx={{
                py: 2,
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:last-child': { borderBottom: 'none' },
                transition: 'background 0.2s',
                '&:hover': { bgcolor: '#fafafa', borderRadius: 2 }
              }}
            >
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={{ bgcolor: '#f5f5f5', width: 48, height: 48, color: '#666' }}>
                  {getIconForType(link.icon)}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold" color="textPrimary">{link.label}</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="caption" color="textSecondary">{link.url}</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ opacity: 0.5 }}>•</Typography>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>{link.restaurant}</Typography>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip 
                  label={link.status} 
                  color={link.status === 'Active' ? 'success' : 'default'} 
                  size="small" 
                  variant="outlined"
                  sx={{ borderRadius: '12px', fontWeight: 600 }}
                />
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage;
