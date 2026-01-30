import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Select, MenuItem, Button, CircularProgress, 
  TextField, Stack, IconButton, Divider, Alert
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, 
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LINK_TYPES = [
  { label: 'Website', icon: 'language' },
  { label: 'Menu', icon: 'restaurant_menu' },
  { label: 'Instagram', icon: 'camera_alt' },
  { label: 'Facebook', icon: 'thumb_up' },
  { label: 'WhatsApp', icon: 'chat' },
  { label: 'Wi-Fi', icon: 'wifi' },
  { label: 'Google Maps', icon: 'map' },
  { label: 'Custom', icon: 'link' }
];

const ManageLinksPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true); // Initial load
  const [linksLoading, setLinksLoading] = useState(false); // When switching restaurants

  // Add Link Form State
  const [newLink, setNewLink] = useState({ label: '', url: '', icon: 'link' });
  const [showForm, setShowForm] = useState(false);

  // 1. Fetch Restaurants on Mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/api/restaurant');
        setRestaurants(res.data);
        if (res.data.length > 0) {
          setSelectedRestaurant(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // 2. Fetch Links when Restaurant Selection Changes
  useEffect(() => {
    if (selectedRestaurant) {
      fetchLinks(selectedRestaurant.id);
    }
  }, [selectedRestaurant]);

  const fetchLinks = async (restId) => {
    setLinksLoading(true);
    try {
      const res = await api.get(`/api/links/${restId}`);
      setLinks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLinksLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.label || !newLink.url) return;

    try {
      const res = await api.post('/api/links', {
        restaurant_id: selectedRestaurant.id,
        label: newLink.label,
        url: newLink.url,
        icon: newLink.icon
      });
      
      setLinks([...links, res.data]);
      setNewLink({ label: '', url: '', icon: 'link' });
      setShowForm(false);
    } catch (err) {
      alert("Failed to add link");
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (window.confirm("Delete this link?")) {
      try {
        await api.delete(`/api/links/${linkId}`);
        setLinks(links.filter(l => l.id !== linkId));
      } catch (err) {
        alert("Failed to delete link");
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/dashboard')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Manage Links
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        
        {/* Restaurant Selector */}
        <Select
          fullWidth
          value={selectedRestaurant?.id || ''}
          onChange={(e) => setSelectedRestaurant(restaurants.find(r => r.id === e.target.value))}
          sx={{ mb: 4 }}
        >
          {restaurants.map(r => (
            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
          ))}
        </Select>

        {/* Add Link Toggle */}
        {!showForm ? (
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            sx={{ mb: 4, py: 2, borderRadius: 2 }}
          >
            Add New Link
          </Button>
        ) : (
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 4 }}>
            <Stack spacing={2}>
              <TextField
                label="Link Label"
                placeholder="e.g. Takeout Menu"
                size="small"
                fullWidth
                value={newLink.label}
                onChange={(e) => setNewLink({...newLink, label: e.target.value})}
              />
              <Stack direction="row" spacing={2}>
                <Select
                  value={newLink.icon}
                  size="small"
                  onChange={(e) => setNewLink({...newLink, icon: e.target.value})}
                  sx={{ minWidth: 140 }}
                >
                  {LINK_TYPES.map((t, i) => (
                    <MenuItem key={i} value={t.icon}>{t.label}</MenuItem>
                  ))}
                </Select>
                <TextField
                  label="URL"
                  placeholder="https://..."
                  size="small"
                  fullWidth
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleAddLink}>Save</Button>
                <Button variant="text" onClick={() => setShowForm(false)}>Cancel</Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Links List */}
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Active Links ({links.length})
        </Typography>

        {linksLoading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
        ) : links.length === 0 ? (
          <Alert severity="info">No links configured for this restaurant.</Alert>
        ) : (
          <Stack spacing={2}>
            {links.map((link) => (
              <Box
                key={link.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                border="1px solid #eee"
                borderRadius={2}
                sx={{ bgcolor: 'white' }}
              >
                {/* FIX: Layout Logic for Long URLs */}
                <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                  <Typography fontWeight="bold" noWrap>{link.label}</Typography>
                  
                  <Typography 
                    variant="caption" 
                    color="textSecondary" 
                    noWrap 
                    title={link.url} // Hover to see full URL
                    sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {link.url}
                  </Typography>
                </Box>
                {/* End Fix */}
                
                <IconButton color="error" onClick={() => handleDeleteLink(link.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

      </Paper>
    </Box>
  );
};

export default ManageLinksPage;