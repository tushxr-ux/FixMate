import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import RequireAuth from './components/RequireAuth';

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

/* Desktop sidebar — shown alongside the app "phone" frame */
function Sidebar() {
  return (
    <div className="side">
      <img src="/fixmate-logo.png" alt="FixMate" style={{ width: 160, maxWidth: '100%', height: 'auto', objectFit: 'contain', marginBottom: 16 }} />
      <p>
        An open, hyperlocal marketplace for home repair and roadside assistance —
        verified local providers, matched on demand with transparent, diagnosis-first pricing.
      </p>
      <ul>
        <li><span className="material-symbols-outlined">verified</span> Verified local providers</li>
        <li><span className="material-symbols-outlined">receipt_long</span> Diagnosis-first, no surprise bills</li>
        <li><span className="material-symbols-outlined">location_on</span> Live tracking once assigned</li>
        <li><span className="material-symbols-outlined">car_crash</span> Roadside assistance too</li>
      </ul>

      <div style={{ marginTop: 24, padding: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: 10 }}>
        <strong style={{ fontSize: 13, color: '#93C5FD', display: 'block', marginBottom: 8 }}>
          🌐 Responsive Public Website
        </strong>
        <a
          href="/website"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 6, background: '#1A56DB', color: '#fff',
            textDecoration: 'none', fontSize: 12, fontWeight: 700
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>language</span>
          Explore Marketing Website
        </a>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
        <strong style={{ color: '#fff' }}>Demo Accounts:</strong><br />
        Customer: <code>aditi@demo.com</code> / <code>demo</code><br />
        Provider: <code>rakesh@demo.com</code> / <code>demo</code><br />
        Admin: <code>admin@fixmate.com</code> / <code>admin</code>
      </div>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();

  if (location.pathname === '/website') {
    return <Website />;
  }

  return (
    <div className="shell">
      <Sidebar />
      <div className="phonewrap">
        <div className="app-frame">
          <Routes>
            {/* Public */}
            <Route path="/"        element={<Splash />} />
            <Route path="/login"   element={<Login />} />
            <Route path="/signup"  element={<Signup />} />
            <Route path="/website" element={<Website />} />

            {/* Customer */}
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

            {/* Provider */}
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

            {/* Admin */}
            <Route path="/admin" element={
              <RequireAuth requiredRole="admin"><AdminDashboard /></RequireAuth>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
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
