import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Splash() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const handleTap = () => {
    if (user) {
      if (user.role === 'provider') navigate('/provider');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/home');
    } else {
      navigate('/login');
    }
  };

  // Auto-advance after 2s
  useEffect(() => {
    const t = setTimeout(handleTap, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="splash-screen screen-enter" onClick={handleTap} style={{ cursor: 'pointer' }}>
      <div className="splash-glow" />
      <img src="/fixmate-logo.png" alt="FixMate" style={{ width: 180, maxWidth: '80%', height: 'auto', objectFit: 'contain', zIndex: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
      <div className="splash-dot" style={{ marginTop: 16 }} />
      <p className="splash-sub">Tap to continue</p>
    </div>
  );
}
