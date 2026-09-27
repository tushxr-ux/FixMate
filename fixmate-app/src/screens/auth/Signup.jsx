import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [bizName, setBizName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = signup({ name, email, password, phone, role, businessName: bizName });
    setLoading(false);

    if (result.error) { setError(result.error); return; }
    toast.success('Account created! Welcome to FixMate.');
    if (role === 'provider') navigate('/provider');
    else navigate('/home');
  }

  const roles = [
    { id: 'customer', icon: 'person', label: 'Customer', desc: 'Need home repairs or roadside help' },
    { id: 'provider', icon: 'handyman', label: 'Service Pro', desc: 'Offer repair services and earn' },
  ];

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
              src="/fixmate-logo.png"
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
            Join India&apos;s Most Trusted Repair Platform
          </h1>

          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: '#CBD5E1',
            maxWidth: 380,
            margin: '0 0 32px'
          }}>
            Whether you need a quick reliable fix at home or want to grow your independent service business, FixMate provides upfront diagnosis and guaranteed payment protection.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: 'bolt', text: 'Instant On-Demand Matching in 60s' },
              { icon: 'lock', text: 'Escrow Payment Hold — Pay only when satisfied' },
              { icon: 'shield_with_heart', text: '30-Day Service Warranty on all repairs' },
              { icon: 'support_agent', text: '24/7 Roadside & Household Helpdesk' }
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

        <div style={{
          background: 'rgba(255, 255, 255, 0.07)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 14,
          padding: '16px 20px',
          backdropFilter: 'blur(8px)',
          marginTop: 40
        }}>
          <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600 }}>
            🛡️ 100% Data &amp; Payment Privacy Guaranteed
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Bank-grade SSL encryption and RBI compliant escrow infrastructure.
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
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src="/fixmate-logo.png"
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
              Create Account
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Join thousands of satisfied homeowners and verified technicians
            </p>
          </div>

          {/* Role Grid */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
              I want to register as:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {roles.map(r => (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: role === r.id ? '2px solid var(--blue)' : '1.5px solid #E2E8F0',
                    background: role === r.id ? 'var(--blue-light, #EFF6FF)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: role === r.id ? '#1A56DB' : '#F1F5F9',
                    color: role === r.id ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{r.icon}</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: '#0F172A', display: 'block' }}>{r.label}</strong>
                    <span style={{ fontSize: 11, color: '#64748B' }}>{r.id === 'customer' ? 'Hire Pros' : 'Earn Money'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Aditi Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {role === 'provider' && (
              <div className="field">
                <label htmlFor="reg-biz">Business / Trade Name</label>
                <input
                  id="reg-biz"
                  type="text"
                  placeholder="e.g. Sharma Appliance &amp; Electricals"
                  value={bizName}
                  onChange={e => setBizName(e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="reg-phone">Phone Number (Optional)</label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 4 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 40 }}
                />
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
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Create FixMate Account</span>
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>
              Sign in
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
