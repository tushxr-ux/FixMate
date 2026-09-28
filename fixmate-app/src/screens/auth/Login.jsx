import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function performLogin(em, pw) {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 450));
    const user = login(em, pw);
    setLoading(false);

    if (!user) {
      setError('Incorrect email or password. Please try again.');
      return;
    }

    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    if (user.role === 'provider') navigate('/provider');
    else if (user.role === 'admin') navigate('/admin');
    else navigate('/home');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }
    await performLogin(email, password);
  }

  function handleDemoClick(em, pw) {
    setEmail(em);
    setPassword(pw);
    performLogin(em, pw);
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      background: '#FFFFFF',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0F172A'
    }}>
      {/* ── Left Brand Panel (Desktop) ─────────────────────────── */}
      <div
        className="auth-brand-panel"
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(150deg, #1A56DB 0%, #0F3E99 60%, #081B4B 100%)',
          color: '#FFFFFF',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div>
          <div
            onClick={() => navigate('/website')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 40 }}
          >
            <img
              src="/fixmate-logo.webp"
              alt="FixMate"
              style={{ height: 42, width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 3.5vw, 38px)',
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
            color: '#FFFFFF'
          }}>
            Fair Diagnosis.<br />
            Zero Surprise Bills.
          </h1>

          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: '#CBD5E1',
            maxWidth: 380,
            margin: '0 0 32px'
          }}>
            India&apos;s open hyperlocal network for home repair and 24/7 roadside assistance. Verified specialists dispatched to your location in minutes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: 'verified', text: '100% Police & Trade-Verified Specialists' },
              { icon: 'receipt_long', text: 'Fixed ₹50 Visit Fee & Itemized Digital Quotes' },
              { icon: 'location_on', text: 'Real-time GPS Tracking with Exact ETA' },
              { icon: 'car_crash', text: '24/7 Roadside Breakdown SOS Squad' },
              { icon: 'shield', text: '30-Day Escrow Protected Service Warranty' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#E2E8F0' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#93C5FD' }}>{f.icon}</span>
                </div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer testimonial quote */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.07)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 14,
          padding: '16px 20px',
          backdropFilter: 'blur(8px)',
          marginTop: 40
        }}>
          <p style={{ fontSize: 13, color: '#E2E8F0', fontStyle: 'italic', margin: '0 0 8px', lineHeight: 1.5 }}>
            &ldquo;The technician showed me the photo diagnosis before fixing my washing machine. Super fair and transparent!&rdquo;
          </p>
          <div style={{ fontSize: 12, color: '#93C5FD', fontWeight: 600 }}>
            — Aditi D., Verified Customer in Bengaluru
          </div>
        </div>
      </div>

      {/* ── Right Form Panel (Desktop & Mobile) ────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 24px',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Header on Mobile */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src="/fixmate-logo.webp"
              alt="FixMate"
              onClick={() => navigate('/website')}
              style={{
                height: 40,
                width: 'auto',
                objectFit: 'contain',
                margin: '0 auto 12px',
                cursor: 'pointer'
              }}
            />
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Sign in to manage your bookings or service account
            </p>
          </div>

          {/* ── Quick 1-Click Instant Demo Logins ── */}
          <div style={{
            background: 'var(--blue-light, #EFF6FF)',
            border: '1.5px solid var(--blue-tint, #DBEAFE)',
            borderRadius: 14,
            padding: 16,
            marginBottom: 24
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10
            }}>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#1A56DB',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
                1-Click Instant Demo Login
              </span>
              <span style={{ fontSize: 11, color: '#64748B' }}>No password needed</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleDemoClick('aditi@demo.com', 'demo')}
                disabled={loading}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: 10,
                  padding: '10px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                </div>
                <strong style={{ fontSize: 12, color: '#0F172A' }}>Customer</strong>
                <span style={{ fontSize: 10, color: '#64748B' }}>Book &amp; Track</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('rakesh@demo.com', 'demo')}
                disabled={loading}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: 10,
                  padding: '10px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>handyman</span>
                </div>
                <strong style={{ fontSize: 12, color: '#0F172A' }}>Provider</strong>
                <span style={{ fontSize: 10, color: '#64748B' }}>Accept Jobs</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('admin@fixmate.com', 'admin')}
                disabled={loading}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: 10,
                  padding: '10px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>admin_panel_settings</span>
                </div>
                <strong style={{ fontSize: 12, color: '#0F172A' }}>Admin</strong>
                <span style={{ fontSize: 10, color: '#64748B' }}>Disputes &amp; Pros</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '0 0 20px',
            color: '#94A3B8',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <div style={{ flex: 1, borderTop: '1px solid #E2E8F0' }} />
            <span>or sign in with credentials</span>
            <div style={{ flex: 1, borderTop: '1px solid #E2E8F0' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="login-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={error ? 'err' : ''}
                  style={{ paddingLeft: 40 }}
                />
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                    fontSize: 20,
                    pointerEvents: 'none'
                  }}
                >
                  mail
                </span>
              </div>
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                <span
                  onClick={() => toast.info('For demo accounts, use password "demo" (or "admin" for admin).')}
                  style={{ fontSize: 12, color: 'var(--blue)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={error ? 'err' : ''}
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                    fontSize: 20,
                    pointerEvents: 'none'
                  }}
                >
                  lock
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: 4,
                    display: 'flex'
                  }}
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`btn btn-primary${loading ? ' loading' : ''}`}
              disabled={loading}
              style={{ height: 48, fontSize: 15 }}
            >
              {!loading && (
                <>
                  <span className="material-symbols-outlined">login</span>
                  <span>Sign In to FixMate</span>
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748B' }}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--blue)', fontWeight: 700 }}>
              Create an account
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <Link
              to="/website"
              style={{
                fontSize: 13,
                color: '#64748B',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 500
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              <span>Back to Marketing Website</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-brand-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
