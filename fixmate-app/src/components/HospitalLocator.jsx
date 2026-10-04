import { useState, useEffect } from 'react';
import Spinner from './Spinner';

/** Haversine distance in km */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchHospitals(lat, lng, radius = 5000) {
  const query = `[out:json];node["amenity"="hospital"](around:${radius},${lat},${lng});out;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('Overpass error');
  const data = await res.json();
  return data.elements || [];
}

export default function HospitalLocator({ lat, lng }) {
  const [status, setStatus] = useState('loading');
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;

    (async () => {
      try {
        let nodes = await fetchHospitals(lat, lng, 5000);
        if (!cancelled && nodes.length === 0) {
          nodes = await fetchHospitals(lat, lng, 10000);
        }
        if (cancelled) return;
        if (nodes.length === 0) { setStatus('empty'); return; }

        const sorted = nodes
          .map(n => ({
            id: n.id,
            name: n.tags?.name || 'Unnamed Hospital',
            phone: n.tags?.phone || n.tags?.['contact:phone'] || null,
            lat: n.lat,
            lng: n.lon,
            distKm: haversine(lat, lng, n.lat, n.lon),
          }))
          .sort((a, b) => a.distKm - b.distKm)
          .slice(0, 5);

        setHospitals(sorted);
        setStatus('ok');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [lat, lng]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: 'var(--gray)', fontSize: 12 }}>
        <Spinner size={16} />
        <span>Locating nearby hospitals...</span>
      </div>
    );
  }

  if (status === 'error') {
    return <p style={{ fontSize: 12, color: 'var(--gray)', margin: '8px 0' }}>Couldn't load nearby hospitals — please call 112 or 108 directly.</p>;
  }

  if (status === 'empty') {
    return <p style={{ fontSize: 12, color: 'var(--gray)', margin: '8px 0' }}>No hospitals found nearby — please call 112 or 108 directly.</p>;
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hospitals.map(h => (
          <div key={h.id} className="prov-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>local_hospital</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 12, display: 'block', color: 'var(--text)', lineHeight: 1.3 }}>{h.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--gray)' }}>
                  {h.distKm < 1 ? `${Math.round(h.distKm * 1000)} m away` : `${h.distKm.toFixed(1)} km away`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {h.phone ? (
                  <a href={`tel:${h.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6, background: '#DC2626', color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none' }} title={`Call ${h.phone}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>call</span> Call
                  </a>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--gray)', alignSelf: 'center' }}>No number</span>
                )}
                <a href={`https://www.openstreetmap.org/?mlat=${h.lat}&mlon=${h.lng}&zoom=16`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--gray)', fontSize: 11, textDecoration: 'none' }} title="Open in map">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>map</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, color: 'var(--gray)', margin: '8px 0 0', lineHeight: 1.4 }}>
        Hospital listings are sourced from OpenStreetMap and may not reflect current capacity or emergency department status.
      </p>
    </div>
  );
}
