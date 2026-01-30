import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/material';

const SettingsPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Account Settings
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage how your restaurant account works and how customers interact with your QR code.
      </Typography>

      <Stack spacing={3}>
        {/* Account */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Account
            </Typography>
            <Typography variant="body2">
              This account controls your restaurant profile, QR code, and links.
              Only trusted staff should have access to these settings.
            </Typography>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              QR Code
            </Typography>
            <Typography variant="body2">
              Your QR code always stays the same. You can update what customers see
              without printing a new code.
            </Typography>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Links & Menu
            </Typography>
            <Typography variant="body2">
              You can turn links on or off at any time. Changes are applied instantly
              for customers who scan the QR code.
            </Typography>
          </CardContent>
        </Card>

        {/* Access */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Staff Access
            </Typography>
            <Typography variant="body2">
              Staff access is controlled by the restaurant owner or admin to avoid
              mistakes and unauthorized changes.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default SettingsPage;
