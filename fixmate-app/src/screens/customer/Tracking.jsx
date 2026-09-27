import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { getJob, getProvider } from '../../store';
import { customerIcon, makeProviderIcon, makeEtaIcon } from '../../components/MapView';
import TopBar from '../../components/TopBar';
import ProviderCard from '../../components/ProviderCard';

// Mumbai customer location (replaced by real GPS in Phase 3 location flow)
const CUSTOMER_LATLNG = [19.1376, 72.8289];

// Interpolate between two [lat,lng] points by fraction t ∈ [0,1]
function lerp([lat1, lng1], [lat2, lng2], t) {
  return [lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t];
}

export default function Tracking() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const job       = getJob(jobId);
  const provider  = job ? getProvider(job.providerId) : null;

  const mapDivRef    = useRef(null);
  const mapRef       = useRef(null);
  const provMarker   = useRef(null);
  const etaMarker    = useRef(null);
  const polylineRef  = useRef(null);
  const intervalRef  = useRef(null);

  const [eta,     setEta]     = useState(6);
  const [arrived, setArrived] = useState(false);

  // Provider start position — use seed coords if available, else offset from customer
  const provStart = provider?.lat
    ? [provider.lat, provider.lng]
    : [19.148, 72.840];

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: CUSTOMER_LATLNG,
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Customer marker
    L.marker(CUSTOMER_LATLNG, { icon: customerIcon })
      .addTo(map)
      .bindPopup('<strong>Your location</strong>');

    // Dashed route line
    const poly = L.polyline([provStart, CUSTOMER_LATLNG], {
      color: '#1A56DB', weight: 3, dashArray: '8 8', opacity: 0.65,
    }).addTo(map);
    polylineRef.current = poly;

    // Fit map to show both endpoints
    map.fitBounds(poly.getBounds(), { padding: [40, 40] });

    // Provider marker (starts at provider coords)
    const pMarker = L.marker(provStart, { icon: makeProviderIcon(true) })
      .addTo(map)
      .bindPopup(`<strong>${provider?.name || 'Provider'}</strong><br>On the way`);
    provMarker.current = pMarker;

    // ETA floating label above provider
    const eMarker = L.marker(provStart, { icon: makeEtaIcon(6), zIndexOffset: 1000 }).addTo(map);
    etaMarker.current = eMarker;

    mapRef.current = map;

    // ── Animate provider toward customer ─────────────────
    const STEPS = 60;        // total animation steps
    let step = 0;

    intervalRef.current = setInterval(() => {
      step++;
      const t = Math.min(step / STEPS, 1);
      const pos = lerp(provStart, CUSTOMER_LATLNG, t);

      pMarker.setLatLng(pos);
      eMarker.setLatLng(pos);

      const remainingEta = Math.max(0, Math.round(6 * (1 - t)));
      setEta(remainingEta);
      eMarker.setIcon(makeEtaIcon(remainingEta));

      if (t >= 1) {
        clearInterval(intervalRef.current);
        setArrived(true);
        eMarker.remove(); // hide ETA label on arrival
        pMarker.bindPopup(`<strong>${provider?.name || 'Provider'}</strong><br>✅ Arrived!`).openPopup();
      }
    }, 100); // fast for demo — 100ms * 60 steps = 6 seconds

    return () => {
      clearInterval(intervalRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  if (!job) { navigate('/home'); return null; }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Provider on the way" back={false} />

      <div className="body screen-enter" style={{ padding: 0 }}>
        {/* Map */}
        <div
          ref={mapDivRef}
          style={{ height: 300, width: '100%', position: 'relative' }}
        />

        <div style={{ padding: '16px' }}>
          <ProviderCard provider={provider} compact />

          {/* Status banner */}
          {arrived ? (
            <div className="banner ok" style={{ display: 'block', marginBottom: 16 }}>
              ✅ <strong>{provider?.name?.split(' ')[0] || 'Provider'} has arrived!</strong> Check the diagnosis &amp; quote below.
            </div>
          ) : (
            <div className="banner" style={{ display: 'block', marginBottom: 16 }}>
              🔧 <strong>{provider?.name?.split(' ')[0] || 'Provider'}</strong> is on the way —
              <span style={{ color: 'var(--blue)', fontWeight: 700 }}> ETA {eta} min</span>
            </div>
          )}

          {/* Job steps */}
          <div className="job-steps" style={{ marginBottom: 16 }}>
            {[
              { label: 'Booked',   done: true  },
              { label: 'Matched',  done: true  },
              { label: 'En route', done: arrived, active: !arrived },
              { label: 'Arrived',  done: arrived },
              { label: 'Diagnose', done: false  },
            ].map((s, i) => (
              <div key={i} className={`job-step${s.done ? ' done' : s.active ? ' active' : ''}`}>
                <div className="step-dot">{s.done ? '✓' : i + 1}</div>
                <p>{s.label}</p>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            disabled={!arrived}
            onClick={() => navigate(`/quote/${jobId}`)}
          >
            {arrived
              ? <><span className="material-symbols-outlined">receipt_long</span> View diagnosis &amp; quote</>
              : `Waiting for provider… (ETA ${eta} min)`
            }
          </button>

          {!arrived && (
            <button className="btn btn-ghost" style={{ marginTop: 10 }}
              onClick={() => alert('Call feature coming in Phase 5')}>
              <span className="material-symbols-outlined">call</span> Call provider
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
