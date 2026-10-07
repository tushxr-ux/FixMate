import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProviders, saveJob } from '../../store';
import MapView, { customerIcon, makeProviderIcon } from '../../components/MapView';
import TopBar from '../../components/TopBar';

export default function Matching() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const mapRef    = useRef(null);

  const [phase,     setPhase]     = useState('broadcasting'); // broadcasting | found
  const [notified,  setNotified]  = useState(0);   // how many providers received request
  const [accepted,  setAccepted]  = useState([]);  // providers who "accepted" (simulated)
  const [job,       setJob]       = useState(null);
  const [allProvs,  setAllProvs]  = useState([]);

  useEffect(() => {
    const j = getJob(jobId);
    if (!j) { navigate('/home'); return; }
    setJob(j);

    // All available providers for this category
    const provs = getProviders({ category: j.category, available: true });
    setAllProvs(provs);

    // Simulate broadcast: notify providers one by one every ~600ms
    let notifiedSoFar = 0;
    const notifyInterval = setInterval(() => {
      notifiedSoFar++;
      setNotified(notifiedSoFar);
      if (notifiedSoFar >= provs.length) clearInterval(notifyInterval);
    }, 600);

    // Simulate first provider accepting after 2.8s
    const acceptTimer = setTimeout(() => {
      const matched = provs[0];
      if (!matched) {
        navigate(`/no-provider?jobId=${jobId}`);
        return;
      }
      setAccepted([matched]);
      setPhase('found');

      // Advance to assigned screen after showing acceptance for 1.5s
      setTimeout(() => {
        const updated = { ...j, providerId: matched.id, status: 'matched' };
        saveJob(updated);
        navigate(`/provider-assigned/${jobId}`);
      }, 1800);
    }, 2800);

    return () => {
      clearInterval(notifyInterval);
      clearTimeout(acceptTimer);
    };
  }, [jobId, navigate]);

  if (!job) return null;

  // Map markers: customer pin + all notified providers + accepted (highlighted)
  const customerLat = job.location?.lat || 19.2085;
  const customerLng = job.location?.lng || 72.8735;

  const markers = [
    { lat: customerLat, lng: customerLng, icon: customerIcon, popup: 'Your location' },
    ...allProvs.slice(0, notified).map(p => ({
      lat: p.lat, lng: p.lng,
      icon: makeProviderIcon(accepted.some(a => a.id === p.id)),
      popup: `<strong>${p.name}</strong><br>${p.rating}★ · ${p.distKm.toFixed(1)} km away`,
    })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Finding a provider" back={false} />

      {/* Map takes top half */}
      <div style={{ position: 'relative', height: 260, flexShrink: 0 }}>
        <MapView
          ref={mapRef}
          center={[customerLat, customerLng]}
          zoom={14}
          height="260px"
          markers={markers}
          onReady={map => setTimeout(() => map.invalidateSize(), 100)}
        />
        {/* Pulse overlay on map */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: '5px 14px',
          fontSize: 12, fontWeight: 700, color: 'var(--blue)',
          boxShadow: '0 2px 8px rgba(0,0,0,.15)', zIndex: 500, whiteSpace: 'nowrap',
        }}>
          📡 Broadcasting request to nearby providers
        </div>
      </div>

      {/* Bottom status panel */}
      <div className="body" style={{ flex: 1, paddingTop: 20 }}>

        {/* Provider count banner */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 16,
        }}>
          <div style={{
            flex: 1, background: '#EFF6FF', borderRadius: 12, padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{notified}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
              Providers notified
            </div>
          </div>
          <div style={{
            flex: 1, background: accepted.length > 0 ? '#F0FDF4' : '#F8FAFC',
            borderRadius: 12, padding: '14px 16px', textAlign: 'center',
            border: accepted.length > 0 ? '1.5px solid #22C55E' : '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: accepted.length > 0 ? '#16A34A' : 'var(--text-muted)', lineHeight: 1 }}>
              {accepted.length}
            </div>
            <div style={{ fontSize: 11, color: accepted.length > 0 ? '#16A34A' : 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
              {accepted.length > 0 ? 'Accepted ✓' : 'Waiting...'}
            </div>
          </div>
        </div>

        {/* Status message */}
        {phase === 'broadcasting' ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="pulse-ring" style={{ margin: '0 auto 12px' }}>
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>Sending request to providers…</h3>
            <p className="muted" style={{ fontSize: 12 }}>Matching by skill, distance & rating</p>
          </div>
        ) : (
          <div style={{
            background: '#F0FDF4', border: '1.5px solid #22C55E', borderRadius: 12,
            padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: '#22C55E',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22 }}>check_circle</span>
            </div>
            <div>
              <strong style={{ fontSize: 14, color: '#15803D', display: 'block' }}>Provider accepted!</strong>
              <span style={{ fontSize: 12, color: '#16A34A' }}>{accepted[0]?.name} · {accepted[0]?.rating}★ · {accepted[0]?.distKm?.toFixed(1)} km away</span>
            </div>
          </div>
        )}

        {/* Accepted providers list */}
        {accepted.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {accepted.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: '#fff', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: '#0f7a3d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: '#fff', fontSize: 14, flexShrink: 0,
                }}>
                  {p.init}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 13, display: 'block' }}>{p.name}</strong>
                  <span style={{ fontSize: 11, color: 'var(--gray)' }}>
                    {p.rating}★ · {p.distKm.toFixed(1)} km · Heading to you
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#22C55E', fontSize: 20 }}>
                  directions_run
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="muted" style={{ textAlign: 'center', marginTop: 12, fontSize: 11 }}>
          🟢 Provider pins appear on the map as they receive your request
        </p>
      </div>
    </div>
  );
}
