import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useCallback } from 'react';

export default function Splash() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const handleTap = useCallback(() => {
    if (user) {
      if (user.role === 'provider') navigate('/provider');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/home');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // Auto-advance after 2s
  useEffect(() => {
    const t = setTimeout(handleTap, 2000);
    return () => clearTimeout(t);
  }, [handleTap]);

  return (
    <div className="splash-screen screen-enter" onClick={handleTap} style={{ cursor: 'pointer' }}>
      <div className="splash-glow" />
      <img
        src="/fixmate-logo.png"
        alt="FixMate"
        style={{
          width: 190,
          maxWidth: '80%',
          height: 'auto',
          objectFit: 'contain',
          zIndex: 1,
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))'
        }}
      />
      <div className="splash-dot" style={{ marginTop: 18 }} />
      <p className="splash-sub">Hyperlocal repairs &amp; roadside network</p>
    </div>
  );
}
