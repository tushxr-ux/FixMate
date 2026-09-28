import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isCustomer = user?.role === 'customer';
  const isProvider = user?.role === 'provider';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Brand Logo & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to={user ? (isProvider ? '/provider' : isAdmin ? '/admin' : '/home') : '/website'} style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/fixmate-logo.webp"
              alt="FixMate"
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {isCustomer && (
            <div
              onClick={() => navigate('/location-picker')}
              className="location-pill"
              title="Click to change service location"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--blue)' }}>location_on</span>
              <span style={{ fontWeight: 600 }}>Thakur Village, Kandivali</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94A3B8' }}>expand_more</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-app-nav">
          {isCustomer && (
            <>
              <Link to="/home" className={`app-nav-link ${location.pathname === '/home' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">home</span>
                <span>Dashboard</span>
              </Link>
              <Link to="/items/electronics" className={`app-nav-link ${location.pathname.startsWith('/items') || location.pathname.startsWith('/request') ? 'active' : ''}`}>
                <span className="material-symbols-outlined">build</span>
                <span>Book Service</span>
              </Link>
              <Link to="/emergency" className={`app-nav-link emergency-link ${location.pathname === '/emergency' ? 'active' : ''}`}>
                <span className="material-symbols-outlined" style={{ color: '#DC2626' }}>car_crash</span>
                <span style={{ color: '#DC2626', fontWeight: 700 }}>24/7 Roadside SOS</span>
              </Link>
              <Link to="/history" className={`app-nav-link ${location.pathname === '/history' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">history</span>
                <span>My Bookings</span>
              </Link>
            </>
          )}

          {isProvider && (
            <>
              <Link to="/provider" className={`app-nav-link ${location.pathname === '/provider' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">dashboard</span>
                <span>Provider Dashboard</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin" className={`app-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span>Admin Console</span>
              </Link>
            </>
          )}

          <Link to="/website" className="app-nav-link" target="_blank" rel="noopener noreferrer">
            <span className="material-symbols-outlined">open_in_new</span>
            <span>Marketing Website</span>
          </Link>
        </nav>

        {/* User Profile & Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isCustomer && (
            <button
              onClick={() => navigate('/emergency')}
              className="sos-nav-btn"
              title="24/7 Roadside Emergency Breakdown"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>car_crash</span>
              <span>Roadside SOS</span>
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                onClick={() => isCustomer && navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px 5px 6px',
                  borderRadius: 9999,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  cursor: isCustomer ? 'pointer' : 'default'
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--blue)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12
                }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left' }} className="user-name-wrapper">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="icon-btn"
                title="Log out"
                style={{ width: 36, height: 36 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-outline btn-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn btn-primary btn-sm"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-nav-toggle"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          {isCustomer && (
            <>
              <Link to="/home" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <span className="material-symbols-outlined">home</span>
                <span>Dashboard Home</span>
              </Link>
              <Link to="/items/electronics" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <span className="material-symbols-outlined">build</span>
                <span>Book a Service</span>
              </Link>
              <Link to="/emergency" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item" style={{ color: '#DC2626' }}>
                <span className="material-symbols-outlined">car_crash</span>
                <span>24/7 Roadside SOS</span>
              </Link>
              <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <span className="material-symbols-outlined">history</span>
                <span>My Service History</span>
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <span className="material-symbols-outlined">person</span>
                <span>My Profile</span>
              </Link>
            </>
          )}

          {isProvider && (
            <Link to="/provider" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Provider Dashboard</span>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span>Admin Console</span>
            </Link>
          )}

          <Link to="/website" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
            <span className="material-symbols-outlined">language</span>
            <span>Marketing Website</span>
          </Link>

          {user && (
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="mobile-nav-item"
              style={{ color: '#DC2626', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
