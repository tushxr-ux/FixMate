import React, { lazy, Suspense } from 'react';
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
  // matchMedia is the most reliable way — innerWidth can be wrong before layout
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  return isMobileUA || isSmallScreen;
}

// PWA install prompt — shown once per device
function InstallBanner() {
  const [prompt, setPrompt] = window.__deferredInstallPrompt
    ? [window.__deferredInstallPrompt, () => {}]
    : [null, () => {}];
  const [show, setShow] = React.useState(
    () => !localStorage.getItem('pwa_install_dismissed') && isMobileDevice()
  );

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      window.__deferredInstallPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem('pwa_install_dismissed', '1');
    setShow(false);
  };

  const install = async () => {
    const evt = window.__deferredInstallPrompt;
    if (evt) {
      evt.prompt();
      await evt.userChoice;
      window.__deferredInstallPrompt = null;
    }
    dismiss();
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1A56DB', color: '#fff',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <img src="/fixmate-logo.webp" alt="" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Install FixMate App</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>Add to home screen for the best experience</div>
      </div>
      <button onClick={install} style={{
        background: '#fff', color: '#1A56DB', border: 'none',
        borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0
      }}>Install</button>
      <button onClick={dismiss} style={{
        background: 'transparent', color: '#fff', border: 'none',
        fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1, flexShrink: 0
      }} aria-label="Dismiss">×</button>
    </div>
  );
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
          <InstallBanner />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
