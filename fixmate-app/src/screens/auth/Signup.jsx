import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Signup() {
  const { signup } = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [phone,    setPhone]    = useState('');
  const [role,     setRole]     = useState('customer');
  const [bizName,  setBizName]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim())       { setError('Please enter your name.');  return; }
    if (!email.trim())      { setError('Please enter your email.'); return; }
    if (password.length < 4){ setError('Password must be at least 4 characters.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = signup({ name, email, password, phone, role, businessName: bizName });
    setLoading(false);

    if (result.error) { setError(result.error); return; }
    toast('Account created! Welcome to FixMate.', 'ok');
    if (role === 'provider') navigate('/provider');
    else navigate('/home');
  }

  const roles = [
    { id: 'customer', icon: 'person',         label: 'Customer' },
    { id: 'provider', icon: 'handyman',        label: 'Provider' },
  ];

  return (
    <div className="auth-wrap screen-enter">
      <div className="auth-logo" style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src="/fixmate-logo.png" alt="FixMate" style={{ height: 48, width: 'auto', objectFit: 'contain', margin: '0 auto 8px', display: 'block' }} />
        <p>Create your account</p>
      </div>

      <div className="auth-body">
        <p className="section-title" style={{ marginBottom: 10 }}>I am a…</p>
        <div className="role-grid">
          {roles.map(r => (
            <div key={r.id} className={`role-card${role === r.id ? ' active' : ''}`}
              onClick={() => setRole(r.id)} role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setRole(r.id)}>
              <span className="material-symbols-outlined">{r.icon}</span>
              <span>{r.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="sName">Full name</label>
            <input id="sName" type="text" placeholder="Aditi Sharma"
              value={name} onChange={e => setName(e.target.value)} />
          </div>

          {role === 'provider' && (
            <div className="field">
              <label htmlFor="bizName">Business / trade name</label>
              <input id="bizName" type="text" placeholder="e.g. Rakesh Kumar Electricals"
                value={bizName} onChange={e => setBizName(e.target.value)} />
            </div>
          )}

          <div className="field">
            <label htmlFor="sEmail">Email</label>
            <input id="sEmail" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="sPhone">Phone (optional)</label>
            <input id="sPhone" type="tel" placeholder="+91 98765 43210"
              value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="sPass">Password</label>
            <input id="sPass" type="password" placeholder="Min 4 characters"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <p className="field-err" style={{ marginBottom: 14 }}>{error}</p>}

          <button type="submit" className={`btn btn-primary${loading ? ' loading' : ''}`} disabled={loading}>
            {!loading && <><span className="material-symbols-outlined">person_add</span> Create account</>}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 20 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
