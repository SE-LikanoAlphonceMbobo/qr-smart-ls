import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Alert, CircularProgress, 
  Avatar, InputLabel, Select, MenuItem, FormControl, IconButton, Divider
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';

const RESTAURANT_TYPES = [
  'Restaurant',
  'Bar',
  'Lounge',
  'Takeaway',
  'Cafe'
];

const CreateRestaurantPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Restaurant',
    logo_url: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      // 1. Get Signature
      console.log("Requesting Signature from backend...");
      const signRes = await api.post('/api/upload/sign-upload', { folder: 'qr-uploads' });
      const { signature, timestamp, cloudname, apikey, folder } = signRes.data;
      
      console.log("Signature received:", signRes.data);

      // 2. Upload to Cloudinary
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('api_key', apikey);
      uploadData.append('timestamp', timestamp);
      uploadData.append('signature', signature);
      uploadData.append('folder', folder);

      console.log("Uploading to Cloudinary...");

      // Direct Axios call (Don't use api.js to avoid header interference)
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
        uploadData
      );

      console.log("Cloudinary Response:", cloudRes.data);

      if (cloudRes.data.secure_url) {
        const logoUrl = cloudRes.data.secure_url;
        setFormData({ ...formData, logo_url: logoUrl });
        setPreviewUrl(logoUrl);
        alert("✅ Upload Successful!");
      } else {
        throw new Error("No URL returned from Cloudinary");
      }

    } catch (err) {
      console.error("FULL CLOUDINARY ERROR:", err);
      
      // Specific error message
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message || "Unknown error";
      alert(`❌ Upload Failed: ${errorMsg}`);
      setError(`Upload Failed: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATION: Prevent submission if logo is missing
    if (!formData.logo_url) {
      setError("Please upload a logo before creating the restaurant.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/restaurant', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="sm" mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Create New Restaurant
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>
          
          {/* Logo Upload Section */}
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar 
              src={previewUrl} 
              sx={{ width: 100, height: 100, bgcolor: '#e0e0e0' }}
            >
              {!previewUrl && <Typography variant="h4">Logo</Typography>}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                Select Image
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              
              {previewUrl && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleUpload}
                  disabled={uploading || formData.logo_url !== ''} // Disable if already uploaded
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  {uploading ? 'Uploading...' : (formData.logo_url ? 'Done' : 'Upload to Cloud')}
                </Button>
              )}
              
              {formData.logo_url && (
                <Typography variant="caption" color="success.main" display="block" mt={1} fontWeight="bold">
                  ✓ Logo Ready
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Restaurant Details */}
          <TextField
            label="Restaurant Name"
            name="name"
            variant="outlined"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Mario's Pizza"
          />

          <FormControl fullWidth required>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              {RESTAURANT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={2} mt={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Restaurant'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateRestaurantPage;