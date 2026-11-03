import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProviders, getUserById, getProviderPhone, saveJob } from '../../store';
import MapView, { customerIcon, makeProviderIcon, makeDistanceIcon } from '../../components/MapView';
import TopBar from '../../components/TopBar';
import VisitOtpCard from '../../components/VisitOtpCard';
import { useToast } from '../../context/ToastContext';

export default function Matching() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();
  const mapRef    = useRef(null);
  const advanceTimerRef = useRef(null);

  const [phase,     setPhase]     = useState('broadcasting'); // broadcasting | found
  const [notified,  setNotified]  = useState(0);   // how many providers received request
  const [accepted,  setAccepted]  = useState([]);  // providers who "accepted" (simulated)
  const [job,       setJob]       = useState(null);
  const [allProvs,  setAllProvs]  = useState([]);

  useEffect(() => {
    const j = getJob(jobId);
    if (!j) { navigate('/home'); return; }
    setJob(j);

    // All available providers for this category, nearest first.
    // Guard (Nov 2026 QA): never auto-assign to a provider record with
    // no login account — that silently assigned every job to a provider
    // who could never open it, so "provider accept nhi kr raha hai".
    // With the seeded demo accounts in place this filter changes nothing
    // for the demo data; it only protects against future ghost records.
    const allAvailable = getProviders({ category: j.category, available: true });
    const provs = allAvailable.filter(p => getUserById(p.userId));
    setAllProvs(provs);
    if (provs.length === 0) {
      // No loginnable provider at all: say so honestly instead of
      // assigning a ghost provider the customer can never reach.
      navigate(`/no-provider?jobId=${jobId}`);
      return;
    }

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
      // Save the match (and its visit OTP) AT ACCEPT TIME, not at
      // advance time. Previously the job was only saved 1.8s later, so
      // the Matching screen itself showed no OTP/call at all, and if
      // the customer left during that window the match was lost and
      // the job stayed pending forever. Now the OTP exists from the
      // moment of acceptance and can be shown right here.
      const saved = saveJob({ ...j, providerId: matched.id, status: 'matched' });
      setJob(saved);
      setAccepted([matched]);
      setPhase('found');

      // In-app toast notification
      toast.success(`${matched.name} accepted your request! They're on their way.`, 5000);

      // Web / system notification (shows on phone lock screen if permission granted)
      const fireSystemNotif = () => {
        new Notification('Provider Accepted! 🔧', {
          body: `${matched.name} (${matched.rating}★) is heading to you.`,
          icon: '/fixmate-icon.png',
        });
      };
      if (Notification.permission === 'granted') {
        fireSystemNotif();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => { if (p === 'granted') fireSystemNotif(); });
      }

      // Advance to assigned screen after showing acceptance for 1.8s.
      // The job is already saved (see above), so this only navigates.
      // Kept in a variable so unmounting cancels the navigation instead
      // of yanking the user away from where they went — and a manual
      // "Continue" button below covers the case where the timer is
      // cancelled, so the customer is never stuck on this screen.
      const advanceTimer = setTimeout(() => {
        navigate(`/provider-assigned/${jobId}`);
      }, 1800);
      // Store on the outer timer's closure via a ref-like holder:
      advanceTimerRef.current = advanceTimer;
    }, 2800);

    return () => {
      clearInterval(notifyInterval);
      clearTimeout(acceptTimer);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [jobId, navigate, toast]);

  if (!job) return null;

  // Map markers: customer pin + all notified providers + accepted (highlighted)
  const customerLat = job.location?.lat || 19.2085;
  const customerLng = job.location?.lng || 72.8735;

  // Route line (straight line, NOT a road route — see MapView note):
  // once a provider accepts, draw provider → customer with a distance
  // label at the midpoint, Rapido/Uber style.
  const acceptedProv = accepted[0] || null;
  const acceptedPhone = acceptedProv ? getProviderPhone(acceptedProv) : null;
  const acceptedTelHref = acceptedPhone ? `tel:${acceptedPhone.replace(/[^+\d]/g, '')}` : null;
  const routeLine = acceptedProv
    ? [[acceptedProv.lat, acceptedProv.lng], [customerLat, customerLng]]
    : null;
  const routeMid = acceptedProv
    ? [(acceptedProv.lat + customerLat) / 2, (acceptedProv.lng + customerLng) / 2]
    : null;

  const markers = [
    { lat: customerLat, lng: customerLng, icon: customerIcon, popup: 'Your location' },
    ...allProvs.slice(0, notified).map(p => ({
      lat: p.lat, lng: p.lng,
      icon: makeProviderIcon(accepted.some(a => a.id === p.id)),
      popup: `<strong>${p.name}</strong><br>${p.rating}★ · ${p.distKm.toFixed(1)} km away`,
    })),
    ...(acceptedProv && routeMid ? [{
      lat: routeMid[0], lng: routeMid[1],
      icon: makeDistanceIcon(`${acceptedProv.distKm.toFixed(1)} km`),
      popup: `<strong>${acceptedProv.name}</strong><br>${acceptedProv.distKm.toFixed(1)} km away (straight-line distance)`,
    }] : []),
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
          polyline={routeLine}
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

        {/* OTP + Call, shown HERE immediately on acceptance — previously
            the customer saw nothing about OTP/call until the advance to
            ProviderAssigned, which is exactly what was reported. */}
        {acceptedProv && (
          <div style={{ marginTop: 12 }}>
            <VisitOtpCard job={job} />
            {acceptedTelHref ? (
              <a className="btn btn-outline" style={{ marginBottom: 10, textDecoration: 'none' }}
                href={acceptedTelHref}>
                <span className="material-symbols-outlined">call</span> Call provider
              </a>
            ) : (
              <button className="btn btn-outline" style={{ marginBottom: 10 }} disabled>
                <span className="material-symbols-outlined">call</span> Provider phone not available
              </button>
            )}
            <button className="btn btn-primary"
              onClick={() => navigate(`/provider-assigned/${jobId}`)}>
              <span className="material-symbols-outlined">arrow_forward</span> Continue
            </button>
          </div>
        )}

        <p className="muted" style={{ textAlign: 'center', marginTop: 12, fontSize: 11 }}>
          🟢 Provider pins appear on the map as they receive your request
        </p>
      </div>
    </div>
  );
}
