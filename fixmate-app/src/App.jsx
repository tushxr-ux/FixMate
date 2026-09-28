import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import RequireAuth from './components/RequireAuth';
import AppHeader from './components/AppHeader';

// ── Lazy-loaded Route Components (Dynamic Code Splitting) ──────────
const Login            = lazy(() => import('./screens/auth/Login'));
const Signup           = lazy(() => import('./screens/auth/Signup'));
const Splash           = lazy(() => import('./screens/Splash'));
const Website          = lazy(() => import('./screens/public/Website'));

// Customer
const Home             = lazy(() => import('./screens/customer/Home'));
const Items            = lazy(() => import('./screens/customer/Items'));
const Request          = lazy(() => import('./screens/customer/Request'));
const LocationPicker   = lazy(() => import('./screens/customer/LocationPicker'));
const Matching         = lazy(() => import('./screens/customer/Matching'));
const ProviderAssigned = lazy(() => import('./screens/customer/ProviderAssigned'));
const Tracking         = lazy(() => import('./screens/customer/Tracking'));
const Quote            = lazy(() => import('./screens/customer/Quote'));
const Complete         = lazy(() => import('./screens/customer/Complete'));
const Done             = lazy(() => import('./screens/customer/Done'));
const History          = lazy(() => import('./screens/customer/History'));
const JobDetail        = lazy(() => import('./screens/customer/JobDetail'));
const Profile          = lazy(() => import('./screens/customer/Profile'));
const Emergency        = lazy(() => import('./screens/customer/Emergency'));
const ProviderProfile  = lazy(() => import('./screens/customer/ProviderProfile'));
const NoProvider       = lazy(() => import('./screens/customer/NoProvider'));
const Dispute          = lazy(() => import('./screens/customer/Dispute'));

// Provider
const ProviderDashboard = lazy(() => import('./screens/provider/Dashboard'));
const ProviderJob       = lazy(() => import('./screens/provider/Job'));
const Diagnose          = lazy(() => import('./screens/provider/Diagnose'));
const ProviderQuote     = lazy(() => import('./screens/provider/ProviderQuote'));

// Admin
const AdminDashboard    = lazy(() => import('./screens/admin/Dashboard'));

function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || isSmallScreen;
}

function RouteLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flex: 1
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid #E2E8F0',
        borderTopColor: 'var(--blue, #1A56DB)',
        borderRadius: '50%',
        animation: 'routeSpin 0.7s linear infinite'
      }} />
      <style>{`
        @keyframes routeSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();

  // 1. Explicit Marketing Website (accessible on all devices)
  if (location.pathname === '/website') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Website />
      </Suspense>
    );
  }

  // 2. Root Entry ('/') — Smart device-aware routing:
  // Mobile device: show splash screen first (logo only), then advances to app
  // Laptop / Desktop: opens the full marketing website (<Website />)
  if (location.pathname === '/') {
    if (isMobileDevice()) {
      return (
        <Suspense fallback={<RouteLoader />}>
          <Splash />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<RouteLoader />}>
        <Website />
      </Suspense>
    );
  }

  // 3. Mobile-only Splash Route
  if (location.pathname === '/splash') {
    if (!isMobileDevice()) {
      return <Navigate to="/" replace />;
    }
    return (
      <Suspense fallback={<RouteLoader />}>
        <Splash />
      </Suspense>
    );
  }

  // 4. Full-page Auth (Desktop & Mobile)
  if (location.pathname === '/login') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Login />
      </Suspense>
    );
  }
  if (location.pathname === '/signup') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Signup />
      </Suspense>
    );
  }

  // 5. True Full-Width Web Application for Laptops & Mobiles
  return (
    <div className="web-app-shell">
      <AppHeader />
      <main className="web-app-content">
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Customer Booking & Dashboard */}
            <Route path="/home" element={
              <RequireAuth requiredRole="customer"><Home /></RequireAuth>
            } />
            <Route path="/items/:categoryId" element={
              <RequireAuth requiredRole="customer"><Items /></RequireAuth>
            } />
            <Route path="/request/:categoryId/:itemName" element={
              <RequireAuth requiredRole="customer"><Request /></RequireAuth>
            } />
            <Route path="/location-picker" element={
              <RequireAuth requiredRole="customer"><LocationPicker /></RequireAuth>
            } />
            <Route path="/matching/:jobId" element={
              <RequireAuth requiredRole="customer"><Matching /></RequireAuth>
            } />
            <Route path="/no-provider" element={
              <RequireAuth requiredRole="customer"><NoProvider /></RequireAuth>
            } />
            <Route path="/provider-assigned/:jobId" element={
              <RequireAuth requiredRole="customer"><ProviderAssigned /></RequireAuth>
            } />
            <Route path="/tracking/:jobId" element={
              <RequireAuth requiredRole="customer"><Tracking /></RequireAuth>
            } />
            <Route path="/quote/:jobId" element={
              <RequireAuth requiredRole="customer"><Quote /></RequireAuth>
            } />
            <Route path="/complete/:jobId" element={
              <RequireAuth requiredRole="customer"><Complete /></RequireAuth>
            } />
            <Route path="/done/:jobId" element={
              <RequireAuth requiredRole="customer"><Done /></RequireAuth>
            } />
            <Route path="/history" element={
              <RequireAuth requiredRole="customer"><History /></RequireAuth>
            } />
            <Route path="/job/:jobId" element={
              <RequireAuth requiredRole="customer"><JobDetail /></RequireAuth>
            } />
            <Route path="/dispute/:jobId" element={
              <RequireAuth requiredRole="customer"><Dispute /></RequireAuth>
            } />
            <Route path="/profile" element={
              <RequireAuth requiredRole="customer"><Profile /></RequireAuth>
            } />
            <Route path="/emergency" element={
              <RequireAuth requiredRole="customer"><Emergency /></RequireAuth>
            } />
            <Route path="/provider-profile/:providerId" element={
              <RequireAuth><ProviderProfile /></RequireAuth>
            } />

            {/* Provider Portal */}
            <Route path="/provider" element={
              <RequireAuth requiredRole="provider"><ProviderDashboard /></RequireAuth>
            } />
            <Route path="/provider/job/:jobId" element={
              <RequireAuth requiredRole="provider"><ProviderJob /></RequireAuth>
            } />
            <Route path="/provider/diagnose/:jobId" element={
              <RequireAuth requiredRole="provider"><Diagnose /></RequireAuth>
            } />
            <Route path="/provider/quote/:jobId" element={
              <RequireAuth requiredRole="provider"><ProviderQuote /></RequireAuth>
            } />

            {/* Admin Management */}
            <Route path="/admin" element={
              <RequireAuth requiredRole="admin"><AdminDashboard /></RequireAuth>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
