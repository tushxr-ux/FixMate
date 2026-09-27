import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { useToast } from '../../context/ToastContext';

export default function NoProvider() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [notified, setNotified] = useState(false);

  function handleExpandRadius() {
    setExpanded(true);
    toast.info('Search radius expanded by 5km. Searching again...');
    setTimeout(() => {
      if (jobId) {
        navigate(`/matching/${jobId}`);
      } else {
        navigate('/home');
      }
    }, 1200);
  }

  function handleNotifyMe() {
    setNotified(true);
    toast.success("We'll alert you the moment a verified provider becomes available!");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title="No Provider Available" back={true} backTo="/home" />

      <div className="body screen-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 20px', flex: 1 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#FEF3C7', color: '#D97706',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>person_search</span>
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 700 }}>No Providers Found Nearby</h3>
        <p className="muted" style={{ maxWidth: 300, margin: '0 0 28px', fontSize: 13, lineHeight: 1.5 }}>
          All verified specialists in your current radius are currently occupied or outside operating hours.
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={handleExpandRadius}
            disabled={expanded}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>radar</span>
            {expanded ? 'Expanding Radius...' : 'Expand Radius (+5 km)'}
          </button>

          <button 
            className="btn btn-outline" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={() => navigate('/home')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>
            Schedule for Later
          </button>

          {!notified ? (
            <button 
              className="btn btn-ghost" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={handleNotifyMe}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications_active</span>
              Notify Me When Available
            </button>
          ) : (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--green-bg, #DCFCE7)', color: 'var(--green, #16A34A)', fontSize: 13, fontWeight: 600 }}>
              ✓ Alert set. We'll notify you soon.
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24, width: '100%' }}>
          <button 
            className="btn btn-ghost" 
            style={{ width: '100%', color: 'var(--gray, #64748B)' }}
            onClick={() => navigate('/home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
