import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import RequireAuth from './components/RequireAuth';
import AppHeader from './components/AppHeader';

// Auth
import Login  from './screens/auth/Login';
import Signup from './screens/auth/Signup';

// Shared
import Splash from './screens/Splash';

// Customer
import Home             from './screens/customer/Home';
import Items            from './screens/customer/Items';
import Request          from './screens/customer/Request';
import LocationPicker   from './screens/customer/LocationPicker';
import Matching         from './screens/customer/Matching';
import ProviderAssigned from './screens/customer/ProviderAssigned';
import Tracking         from './screens/customer/Tracking';
import Quote            from './screens/customer/Quote';
import Complete         from './screens/customer/Complete';
import Done             from './screens/customer/Done';
import History          from './screens/customer/History';
import JobDetail        from './screens/customer/JobDetail';
import Profile          from './screens/customer/Profile';
import Emergency        from './screens/customer/Emergency';
import ProviderProfile  from './screens/customer/ProviderProfile';
import NoProvider       from './screens/customer/NoProvider';
import Dispute          from './screens/customer/Dispute';

// Provider
import ProviderDashboard from './screens/provider/Dashboard';
import ProviderJob        from './screens/provider/Job';
import Diagnose          from './screens/provider/Diagnose';
import ProviderQuote     from './screens/provider/ProviderQuote';

// Admin
import AdminDashboard from './screens/admin/Dashboard';

// Public Website
import Website from './screens/public/Website';

function AppLayout() {
  const location = useLocation();

  // 1. Marketing Website (Root / or /website)
  if (location.pathname === '/website' || location.pathname === '/') {
    return <Website />;
  }

  // 2. Full-page Auth (Desktop & Mobile)
  if (location.pathname === '/login') {
    return <Login />;
  }
  if (location.pathname === '/signup') {
    return <Signup />;
  }
  if (location.pathname === '/splash') {
    return <Splash />;
  }

  // 3. True Full-Width Web Application for Laptops & Mobiles
  return (
    <div className="web-app-shell">
      <AppHeader />
      <main className="web-app-content">
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
