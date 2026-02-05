import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Paper, Select, MenuItem, Button, CircularProgress, 
  IconButton, Alert, Stack, TextField, Slider, Grid, Divider, Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon, ContentCopy as CopyIcon, QrCode as QrCodeIcon,
  OpenInNew as PreviewIcon, Edit as EditIcon, Palette as PaletteIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';
import api from '../../services/api';

const QRPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  
  // Customization States
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrMargin, setQrMargin] = useState(2);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref to hold the canvas element in memory (not rendered to DOM)
  const canvasRef = useRef(document.createElement('canvas'));

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

  // Re-generate whenever settings or restaurant change
  useEffect(() => {
    if (selectedRestaurant) {
      generateCompositeQR(selectedRestaurant);
    }
  }, [selectedRestaurant, fgColor, bgColor, qrMargin]);

  /**
   * Generates the QR code, draws it onto a canvas with the background color
   * and logo, then converts it to a Data URL for display and download.
   */
  const generateCompositeQR = async (restaurant) => {
    try {
      const fullUrl = `${import.meta.env.VITE_PUBLIC_URL}/r/${restaurant.public_slug}`;
      
      // 1. Generate the raw QR code data
      // We use High (H) error correction to allow for the logo and color changes
      const qrDataUrl = await QRCode.toDataURL(fullUrl, {
        width: 1024,
        margin: qrMargin, 
        color: {
          dark: fgColor,
          light: bgColor // This fills the 'empty' modules with the chosen bg color
        },
        errorCorrectionLevel: 'H' 
      });

      // 2. Prepare Canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const size = 1024 + (qrMargin * 20); // Extra padding for the background
      canvas.width = size;
      canvas.height = size;

      // 3. Fill Background (Solid color)
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // 4. Draw the generated QR code onto the canvas
      const qrImage = new Image();
      qrImage.src = qrDataUrl;
      
      await new Promise((resolve) => {
        qrImage.onload = () => {
          // Center the QR code on the canvas
          const x = (size - 1024) / 2;
          const y = (size - 1024) / 2;
          ctx.drawImage(qrImage, x, y, 1024, 1024);
          resolve();
        };
      });

      // 5. Draw Logo Overlay (if exists)
      if (restaurant.logo_url) {
        const logoImage = new Image();
        // Use anonymous to attempt to avoid CORS taint, though server must support it
        logoImage.crossOrigin = "anonymous"; 
        logoImage.src = restaurant.logo_url;

        await new Promise((resolve) => {
          logoImage.onload = () => {
            const logoSize = 200;
            const center = size / 2;
            
            // Draw a white circle/background behind logo for contrast
            ctx.beginPath();
            ctx.arc(center, center, logoSize / 2 + 15, 0, 2 * Math.PI);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            // Draw Logo
            ctx.drawImage(
              logoImage, 
              center - logoSize / 2, 
              center - logoSize / 2, 
              logoSize, 
              logoSize
            );
            resolve();
          };
          // If logo fails to load (CORS/404), we just resolve without drawing it
          logoImage.onerror = () => resolve();
        });
      }

      // 6. Set the final image URL
      setQrDataUrl(canvas.toDataURL('image/png'));

    } catch (err) {
      console.error("QR Generation Error", err);
      // Fallback: try to generate without logo if canvas taint occurs
      try {
        const fallbackUrl = await QRCode.toDataURL(fullUrl, {
          width: 1024,
          margin: qrMargin,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: 'H'
        });
        setQrDataUrl(fallbackUrl);
      } catch (e) {
        console.error("Fallback failed", e);
      }
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
    // Using a simple timeout-based alert replacement or keeping the alert
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
    <Box maxWidth="md" mx="auto" pb={10}>
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

          <Grid container spacing={4}>
            {/* Left Column: Customization Controls */}
            <Grid item xs={12} md={5}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <PaletteIcon sx={{ mr: 1, fontSize: 20 }} /> Customization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Adjust colors and margin. Ensure high contrast for scanability.
                </Typography>

                <Stack spacing={3}>
                  {/* Foreground Color */}
                  <Box>
                    <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                      Dot Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField 
                        type="color" 
                        value={fgColor} 
                        onChange={(e) => setFgColor(e.target.value)}
                        sx={{ width: 60, p: 0, '& input': { p: 0, border: 'none' } }}
                      />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{fgColor}</Typography>
                    </Box>
                  </Box>

                  {/* Background Color */}
                  <Box>
                    <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                      Background Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        sx={{ width: 60, p: 0, '& input': { p: 0, border: 'none' } }}
                      />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{bgColor}</Typography>
                    </Box>
                  </Box>

                  {/* Margin Slider */}
                  <Box>
                    <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                      Margin (Quiet Zone): {qrMargin}
                    </Typography>
                    <Slider
                      value={qrMargin}
                      onChange={(e, val) => setQrMargin(val)}
                      min={0}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Right Column: Preview */}
            <Grid item xs={12} md={7} display="flex" flexDirection="column" alignItems="center">
              <Box 
                sx={{ 
                  position: 'relative', 
                  display: 'inline-block',
                  mb: 3,
                  p: 2,
                  border: '1px dashed #ccc',
                  borderRadius: 2,
                  bgcolor: '#f9f9f9'
                }}
              >
                {qrDataUrl && (
                  <Box
                    component="img"
                    src={qrDataUrl}
                    alt="QR Code"
                    sx={{
                      width: '100%',
                      maxWidth: 300,
                      height: 'auto',
                      borderRadius: 1,
                      boxShadow: 3
                    }}
                  />
                )}
              </Box>

              <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
                {selectedRestaurant.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3} align="center">
                Scan to open smart links
              </Typography>

              <Stack direction="row" spacing={2} width="100%" justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  disabled={!qrDataUrl}
                  sx={{ borderRadius: 2 }}
                >
                  Download PNG
                </Button>
                <Tooltip title="Copy Link">
                  <IconButton 
                    color="primary"
                    onClick={handleCopyLink}
                    sx={{ border: '1px solid #ddd', borderRadius: 2 }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Open Link">
                  <IconButton 
                    color="primary"
                    href={`${import.meta.env.VITE_PUBLIC_URL}/r/${selectedRestaurant.public_slug}`}
                    target="_blank"
                    sx={{ border: '1px solid #ddd', borderRadius: 2 }}
                  >
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default QRPage;