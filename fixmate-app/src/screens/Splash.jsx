import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useCallback } from 'react';

export default function Splash() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAdvance = useCallback(() => {
    if (user) {
      if (user.role === 'provider') navigate('/provider', { replace: true });
      else if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/home', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Auto-advance after 1.5s
  useEffect(() => {
    const timer = setTimeout(handleAdvance, 1500);
    return () => clearTimeout(timer);
  }, [handleAdvance]);

  return (
    <div
      onClick={handleAdvance}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      <img
        src="/fixmate-logo.webp"
        alt="FixMate"
        style={{
          width: 220,
          maxWidth: '72vw',
          height: 'auto',
          objectFit: 'contain',
          animation: 'splashLogoIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      />
      <style>{`
        @keyframes splashLogoIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
