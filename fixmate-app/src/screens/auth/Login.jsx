import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { login }  = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);

    // Simulate async (real backend call would go here)
    await new Promise(r => setTimeout(r, 600));
    const user = login(email, password);
    setLoading(false);

    if (!user) { setError('Incorrect email or password.'); return; }
    toast(`Welcome back, ${user.name.split(' ')[0]}!`, 'ok');
    if (user.role === 'provider') navigate('/provider');
    else if (user.role === 'admin') navigate('/admin');
    else navigate('/home');
  }

  const demoLogin = (em, pw) => { setEmail(em); setPassword(pw); };

  return (
    <div className="auth-wrap screen-enter">
      <div className="auth-logo" style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src="/fixmate-logo.png" alt="FixMate" style={{ height: 48, width: 'auto', objectFit: 'contain', margin: '0 auto 8px', display: 'block' }} />
        <p>Hyperlocal repair &amp; roadside assistance</p>
      </div>

      <div className="auth-body">
        <div className="demo-hint">
          <strong>Demo accounts</strong>
          <span onClick={() => demoLogin('aditi@demo.com','demo')} style={{cursor:'pointer',display:'block'}}>
            👤 Customer: aditi@demo.com / demo
          </span>
          <span onClick={() => demoLogin('rakesh@demo.com','demo')} style={{cursor:'pointer',display:'block'}}>
            🔧 Provider: rakesh@demo.com / demo
          </span>
          <span onClick={() => demoLogin('admin@fixmate.com','admin')} style={{cursor:'pointer',display:'block'}}>
            🛡️ Admin: admin@fixmate.com / admin
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email"
              placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className={error ? 'err' : ''} />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password"
              placeholder="Your password"
              value={password} onChange={e => setPassword(e.target.value)}
              className={error ? 'err' : ''} />
          </div>

          {error && <p className="field-err" style={{ marginBottom: 14 }}>{error}</p>}

          <button type="submit" className={`btn btn-primary${loading ? ' loading' : ''}`} disabled={loading}>
            {!loading && <><span className="material-symbols-outlined">login</span> Log in</>}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 20 }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
