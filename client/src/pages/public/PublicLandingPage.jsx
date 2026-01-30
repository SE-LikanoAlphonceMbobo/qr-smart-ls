import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Paper, CircularProgress, 
  Alert, Avatar, Chip, Divider
} from '@mui/material';
import {
  Menu as MenuIcon, 
  Instagram as InstagramIcon, 
  Facebook as FacebookIcon,
  Wifi as WifiIcon,
  Language as WebsiteIcon,
  Chat as WhatsAppIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import api from '../../services/api';

// Icon Mapper: Maps DB strings to MUI Icons
const ICON_MAP = {
  'menu': <MenuIcon />,
  'website': <WebsiteIcon />,
  'instagram': <InstagramIcon />,
  'facebook': <FacebookIcon />,
  'whatsapp': <WhatsAppIcon />,
  'wifi': <WifiIcon />,
  'camera_alt': <InstagramIcon />,
  'thumb_up': <FacebookIcon />,
  'language': <WebsiteIcon />,
  'link': <LinkIcon />
};

const PublicLandingPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/r/${slug}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Restaurant not found or inactive.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // HELPER: Fix URL to ensure it goes to external site
  const formatUrl = (url) => {
    if (!url) return '#';
    // If link doesn't start with http/https, add https://
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh" 
        bgcolor="#ffffff"
      >
        <CircularProgress sx={{ color: '#0d47a1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center" minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <Alert severity="error" variant="filled">{error}</Alert>
      </Box>
    );
  }

  // Extract initials for Avatar (e.g., "M&C" -> "MC")
  const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <Box 
      minHeight="100vh" 
      bgcolor="white"
      display="flex" 
      flexDirection="column"
    >
      {/* Main Content Wrapper */}
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
        flexGrow={1}
        py={4}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          
          {/* The Icon / Logo */}
          <Avatar 
            src={data.logoUrl}
            sx={{ 
              width: 80, 
              height: 80, 
              margin: '0 auto 16px',
              bgcolor: '#1565c0', // Blue color
              fontSize: 32,
              fontWeight: 'bold',
              boxShadow: 2
            }}
          >
            {data.logoUrl ? '' : initials}
          </Avatar>

          {/* Restaurant Name */}
          <Typography variant="h5" fontWeight="bold" gutterBottom color="textPrimary">
            {data.name}
          </Typography>

          {/* Type & Status Chips */}
          <Box display="flex" justifyContent="center" gap={1} mb={1}>
            <Chip 
              label={data.type} 
              size="small" 
              variant="outlined"
              sx={{ 
                color: '#1565c0', 
                borderColor: '#1565c0',
                fontWeight: 600
              }} 
            />
            <Chip 
              label="Open Now" 
              size="small" 
              sx={{ 
                bgcolor: '#e8f5e9', 
                color: '#2e7d32',
                fontWeight: 600 
              }} 
            />
          </Box>
          
          {/* Welcome Message */}
          <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 4 }}>
            Welcome! Please select an option below.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Links Buttons */}
          {data.links && data.links.length > 0 ? (
            <Box display="flex" flexDirection="column" gap={2} sx={{ width: '100%' }}>
              {data.links.map((link, index) => (
                <Button
                  key={index}
                  fullWidth
                  variant="outlined"
                  component="a"
                  href={formatUrl(link.url)} // <--- Uses helper to fix links
                  target="_blank"            // <--- Opens in new tab
                  rel="noopener noreferrer"
                  startIcon={ICON_MAP[link.icon] || <LinkIcon />}
                  sx={{
                    py: 1.5,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    borderColor: '#e0e0e0',
                    color: '#333',
                    fontSize: '1rem',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#1565c0',
                      bgcolor: '#e3f2fd',
                      color: '#1565c0'
                    }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" width="100%">
                    {link.label}
                  </Box>
                </Button>
              ))}
            </Box>
          ) : (
            <Box py={4} color="#999">
              <Typography variant="body2">No links available yet.</Typography>
            </Box>
          )}
        </Container>
      </Box>
      
      {/* Footer */}
      <Box 
        textAlign="center" 
        py={3}
        borderTop="1px solid #f0f0f0"
        color="#999"
        sx={{ width: '100%' }}
      >
        <Typography variant="caption" display="block" gutterBottom>
          Powered by Smart QR Platform
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicLandingPage;