import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Admin Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateRestaurantPage from './pages/restaurant/CreateRestaurantPage'; // <--- New Import
import QRPage from './pages/qr/QRPage';
import ManageLinksPage from './pages/links/ManageLinksPage';
import SettingsPage from './pages/dashboard/SettingsPage';

// Public Pages
import PublicLandingPage from './pages/public/PublicLandingPage';

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/r/:slug" element={<PublicLandingPage />} />

      {/* --- PROTECTED ROUTES --- */}
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-restaurant"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CreateRestaurantPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
  path="/manage-links"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <ManageLinksPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

      <Route
        path="/qr-generator"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QRPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* --- DEFAULT REDIRECT --- */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;