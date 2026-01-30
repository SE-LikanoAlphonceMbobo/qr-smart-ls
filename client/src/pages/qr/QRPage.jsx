import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Select, MenuItem, Button, CircularProgress, 
  Avatar, IconButton, Alert, Stack 
} from '@mui/material';
import {
  Download as DownloadIcon, ContentCopy as CopyIcon, QrCode as QrCodeIcon,
  OpenInNew as PreviewIcon, Edit as EditIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';
import api from '../../services/api';

const QRPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/api/restaurant');
        setRestaurants(res.data);
        if (res.data.length > 0) {
          setSelectedRestaurant(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch restaurants:", err);
        setError("Failed to load restaurants. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      generateQR(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const generateQR = async (restaurant) => {
    try {
      const fullUrl = `${import.meta.env.VITE_PUBLIC_URL}/r/${restaurant.public_slug}`;
      const url = await QRCode.toDataURL(fullUrl, {
        width: 1024,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("QR Generation Error", err);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${selectedRestaurant.name}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    const fullUrl = `${import.meta.env.VITE_PUBLIC_URL}/r/${selectedRestaurant.public_slug}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth="md" mx="auto" mt={4} textAlign="center">
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={() => window.location.reload()} variant="contained">Retry</Button>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">
          QR Code Generator
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={() => window.location.href='/manage-links'}
        >
          Manage Links
        </Button>
      </Box>

      {!selectedRestaurant ? (
        <Alert severity="info">
          No restaurant found. Create one first.
        </Alert>
      ) : (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          
          <Select
            fullWidth
            value={selectedRestaurant.id}
            onChange={(e) => setSelectedRestaurant(restaurants.find(r => r.id === e.target.value))}
            sx={{ mb: 4 }}
          >
            {restaurants.map(r => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </Select>

          <Box display="flex" flexDirection="column" alignItems="center">
            
            {/* QR Code Container with Logo Overlay */}
            <Box 
              sx={{ 
                position: 'relative', 
                display: 'inline-block',
                mb: 4
              }}
            >
              {/* The QR Code */}
              {qrDataUrl && (
                <Box
                  component="img"
                  src={qrDataUrl}
                  alt="QR Code"
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 'auto',
                    borderRadius: 2,
                    border: '8px solid white',
                    boxShadow: 3
                  }}
                />
              )}

              {/* The Logo Overlay (Centered) */}
              {qrDataUrl && selectedRestaurant.logo_url && (
                <Box
                  component="img"
                  src={selectedRestaurant.logo_url}
                  alt="Logo"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 64,
                    height: 64,
                    objectFit: 'cover',
                    borderRadius: '50%',
                    bgcolor: 'white',
                    border: '4px solid white',
                    boxShadow: 2
                  }}
                />
              )}
            </Box>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {selectedRestaurant.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={3}>
              Scan to open smart links
            </Typography>

            <Stack direction="row" spacing={2} width="100%">
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={!qrDataUrl}
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Download PNG
              </Button>
              <IconButton 
                color="primary"
                onClick={handleCopyLink}
                sx={{ border: '1px solid #ddd', borderRadius: 2 }}
              >
                <CopyIcon />
              </IconButton>
              <IconButton 
                color="primary"
                href={`${import.meta.env.VITE_PUBLIC_URL}/r/${selectedRestaurant.public_slug}`}
                target="_blank"
                sx={{ border: '1px solid #ddd', borderRadius: 2 }}
              >
                <PreviewIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default QRPage;