import { useState, useEffect } from 'react';
import Spinner from './Spinner';
import MapView, { customerIcon } from './MapView';
import L from 'leaflet';

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchHospitals(lat, lng, radius = 5000) {
  const query = `[out:json];node["amenity"="hospital"](around:${radius},${lat},${lng});out;`;
  const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('Overpass error');
  return (await res.json()).elements || [];
}

const hospitalIcon = L.divIcon({
  className: '',
  html: `<div style="width:26px;height:26px;border-radius:50%;background:#DC2626;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.3);">🏥</div>`,
  iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -15],
});

export default function HospitalLocator({ lat, lng }) {
  const [status, setStatus] = useState('loading');
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    (async () => {
      try {
        let nodes = await fetchHospitals(lat, lng, 5000);
        if (!cancelled && nodes.length === 0) nodes = await fetchHospitals(lat, lng, 10000);
        if (cancelled) return;
        if (nodes.length === 0) { setStatus('empty'); return; }
        const sorted = nodes
          .map(n => ({ id: n.id, name: n.tags?.name || 'Unnamed Hospital', phone: n.tags?.phone || n.tags?.['contact:phone'] || null, lat: n.lat, lng: n.lon, distKm: haversine(lat, lng, n.lat, n.lon) }))
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

  if (status === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: 'var(--gray)', fontSize: 12 }}>
      <Spinner size={16} /><span>Locating nearby hospitals...</span>
    </div>
  );
  if (status === 'error') return <p style={{ fontSize: 12, color: 'var(--gray)', margin: '8px 0' }}>Could not load hospitals — call 112 or 108 directly.</p>;
  if (status === 'empty') return <p style={{ fontSize: 12, color: 'var(--gray)', margin: '8px 0' }}>No hospitals found nearby — call 112 or 108 directly.</p>;

  const markers = [
    { lat, lng, icon: customerIcon, popup: 'Your location' },
    ...hospitals.map(h => ({ lat: h.lat, lng: h.lng, icon: hospitalIcon, popup: `<strong>${h.name}</strong><br>${h.distKm < 1 ? Math.round(h.distKm * 1000) + ' m' : h.distKm.toFixed(1) + ' km'} away` })),
  ];
  const allLats = [lat, ...hospitals.map(h => h.lat)];
  const allLngs = [lng, ...hospitals.map(h => h.lng)];
  const center = [(Math.min(...allLats) + Math.max(...allLats)) / 2, (Math.min(...allLngs) + Math.max(...allLngs)) / 2];

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
        <MapView center={center} zoom={13} height="200px" markers={markers} onReady={map => setTimeout(() => map.invalidateSize(), 100)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hospitals.map(h => (
          <div key={h.id} className="prov-card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>local_hospital</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 12, display: 'block', color: 'var(--text)', lineHeight: 1.3 }}>{h.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--gray)' }}>{h.distKm < 1 ? `${Math.round(h.distKm * 1000)} m away` : `${h.distKm.toFixed(1)} km away`}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {h.phone
                  ? <a href={`tel:${h.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6, background: '#DC2626', color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}><span className="material-symbols-outlined" style={{ fontSize: 13 }}>call</span> Call</a>
                  : <span style={{ fontSize: 10, color: 'var(--gray)', alignSelf: 'center' }}>No number</span>
                }
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--gray)', fontSize: 11, textDecoration: 'none' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>directions</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, color: 'var(--gray)', margin: '8px 0 0', lineHeight: 1.4 }}>Listings from OpenStreetMap. Tap directions to open Google Maps.</p>
    </div>
  );
}
