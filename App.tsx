
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PetProfile from './pages/PetProfile';
import AddPet from './pages/AddPet';
import AddRecord from './pages/AddRecord';
import MyPets from './pages/MyPets';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Reminders from './pages/Reminders';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';

// Provider Pages
import ProviderAuth from './pages/provider/ProviderAuth';
import ProviderRegister from './pages/provider/ProviderRegister';
import ProviderDashboard from './pages/provider/ProviderDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetails from './pages/admin/AdminUserDetails';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminCampaignDetails from './pages/admin/AdminCampaignDetails';
import AdminProviders from './pages/admin/AdminProviders';
import AdminProviderDetails from './pages/admin/AdminProviderDetails';
import AdminSettings from './pages/admin/AdminSettings';
import AdminFeatureFlags from './pages/admin/AdminFeatureFlags';

import ReminderNotificationSystem from './components/ReminderNotificationSystem';

import { AppProvider, useApp } from './context/AppContext';
import { LocalizationProvider } from './context/LocalizationContext';
import { PlatformProvider } from './context/PlatformContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { FeatureGate } from './components/FeatureGate';
import AdminRoutes from './components/AdminRoutes';

import { ImpersonationBanner } from './components/admin/ImpersonationBanner';

// Wrapper for protected routes
const ProtectedRoutes = () => {
  const { isAuthenticated, user } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force onboarding ONLY if not completed
  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Layout>
      <ImpersonationBanner />
      <Outlet />
    </Layout>
  );
};

// Wrapper for public routes (redirects to dashboard if already logged in)
const PublicRoutes = () => {
  const { isAuthenticated, user } = useApp();

  if (isAuthenticated) {
    // If authenticated but onboarding not done, go to onboarding, else dashboard
    if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes (No Layout) */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Provider Specific Public Auth */}
        <Route path="/provider/auth" element={<ProviderAuth />} />
      </Route>

      {/* Onboarding Route (Separate to avoid layout loops) */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected Routes (With Layout) */}
      <Route element={<ProtectedRoutes />}>
        {/* User Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/pets" element={<MyPets />} />
        <Route path="/appointments" element={<Calendar />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/pet/:id" element={<PetProfile />} />
        <Route path="/pet/:id/add-record" element={<AddRecord />} />
        <Route path="/pet/:id/edit" element={<AddPet />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Services Routes - Feature Gated */}
        <Route element={
          <FeatureGate feature="services_module">
            <Outlet />
          </FeatureGate>
        }>
          <Route path="/discover" element={<Services defaultCategory="All" />} />
          <Route path="/service/:id" element={<ServiceDetails />} />
          <Route path="/find-vet" element={<Services defaultCategory="Vet" />} />
        </Route>

        {/* Provider Routes (Authenticated) */}
        <Route path="/provider/register" element={<ProviderRegister />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />

        {/* Admin Routes (RBAC Protected) */}
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetails />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/providers/:id" element={<AdminProviderDetails />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/marketing" element={<AdminMarketing />} />
          <Route path="/admin/marketing/:id" element={<AdminCampaignDetails />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/features" element={<AdminFeatureFlags />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <PlatformProvider>
      <LocalizationProvider>
        <FeatureFlagProvider>
          <AppProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    borderRadius: '12px',
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#F0FDF4',
                      color: '#15803D',
                      border: '1px solid #BBF7D0'
                    },
                    iconTheme: {
                      primary: '#15803D',
                      secondary: '#F0FDF4',
                    },
                  },
                  error: {
                    style: {
                      background: '#FEF2F2',
                      color: '#B91C1C',
                      border: '1px solid #FECACA'
                    },
                    iconTheme: {
                      primary: '#B91C1C',
                      secondary: '#FEF2F2',
                    },
                  },
                }}
              />
              <AppRoutes />
              <ReminderNotificationSystem />
            </Router>
          </AppProvider>
        </FeatureFlagProvider>
      </LocalizationProvider>
    </PlatformProvider>
  );
};

export default App;
