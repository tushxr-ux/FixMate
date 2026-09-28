/* FixMate — Leaflet Map Component
   Reusable map for both LocationPicker and Tracking screens.
   Uses DivIcon for all markers (no asset path issues with Vite).
   Reverse geocoding via free Nominatim API (no key required).
   ─────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths (broken in Vite by default)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── Custom DivIcons ─────────────────────────────────────── */
export const customerIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:var(--blue,#1A56DB);
    border:3px solid #fff;
    box-shadow:0 0 0 3px var(--blue,#1A56DB)44,0 2px 8px rgba(26,86,219,.4);
  "></div>`,
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
  popupAnchor:[0, -12],
});

export function makeProviderIcon(isHighlighted = false) {
  const bg = isHighlighted ? '#d97706' : '#0f7a3d';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${bg};
      border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,.25);
      font-size:17px;line-height:1;
    ">🔧</div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
    popupAnchor:[0, -20],
  });
}

export function makeEtaIcon(etaMin) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#fff;border:1.5px solid var(--blue,#1A56DB);border-radius:20px;
      padding:4px 10px;font-size:12px;font-weight:700;color:var(--blue,#1A56DB);
      white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.15);
    ">${etaMin} min</div>`,
    iconSize:   [70, 28],
    iconAnchor: [35, 36],
  });
}

/* ── Reverse geocoding via Nominatim ─────────────────────── */
export async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const d = await r.json();
    const a = d.address || {};
    const parts = [
      a.road || a.neighbourhood || a.suburb,
      a.suburb || a.city_district,
      a.city || a.town,
    ].filter(Boolean);
    return { address: parts.join(', ') || d.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng };
  } catch {
    return { address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng };
  }
}

/* ── MapView component ───────────────────────────────────── */
/*
  Props:
    center        [lat, lng]
    zoom          number
    height        string (CSS)
    style         object
    markers       [{ lat, lng, icon?, popup?, draggable?, onDragEnd? }]
    onClick       (latlng) => void  — fired on map click
    onReady       (map) => void     — gives parent direct map access
    circles       [{ lat, lng, radius, color? }]
    polyline      [[lat,lng], ...]
    providerTrack true = animate first provider marker along polyline
*/
const MapView = forwardRef(function MapView(
  { center = [19.137, 72.829], zoom = 15, height = '260px', style = {},
    markers = [], onClick, onReady, circles = [], polyline, className = '' },
  ref
) {
  const divRef = useRef(null);
  const mapRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    setView: (latlng, z) => mapRef.current?.setView(latlng, z),
    flyTo:   (latlng, z) => mapRef.current?.flyTo(latlng, z ?? zoom),
  }));

  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!divRef.current) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { rootMargin: '120px' });
    observer.observe(divRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !divRef.current || mapRef.current) return;

    const map = L.map(divRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    onReady?.(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [inView]);

  // Sync markers
  const markerRefs = useRef({});
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old
    Object.values(markerRefs.current).forEach(m => m.remove());
    markerRefs.current = {};

    markers.forEach((m, i) => {
      const key = `m${i}`;
      const lm = L.marker([m.lat, m.lng], {
        icon:      m.icon || new L.Icon.Default(),
        draggable: m.draggable || false,
      }).addTo(map);

      if (m.popup) lm.bindPopup(m.popup);
      if (m.draggable && m.onDragEnd) {
        lm.on('dragend', e => m.onDragEnd(e.target.getLatLng()));
      }
      markerRefs.current[key] = lm;
    });
  }, [markers]);

  // Circles
  const circleRefs = useRef([]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    circleRefs.current.forEach(c => c.remove());
    circleRefs.current = circles.map(c =>
      L.circle([c.lat, c.lng], {
        radius: c.radius,
        color:  c.color || 'var(--blue,#1A56DB)',
        fill:   true,
        fillOpacity: 0.06,
        weight: 1.5,
      }).addTo(map)
    );
  }, [circles]);

  // Polyline
  const polyRef = useRef(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    polyRef.current?.remove();
    if (polyline?.length > 1) {
      polyRef.current = L.polyline(polyline, {
        color: 'var(--blue,#1A56DB)',
        weight: 3,
        dashArray: '6 6',
        opacity: 0.7,
      }).addTo(map);
    }
  }, [polyline]);

  // Click handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onClick) return;
    const handler = e => onClick(e.latlng);
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [onClick]);

  return (
    <div
      ref={divRef}
      className={className}
      style={{ height, width: '100%', borderRadius: 'var(--r-lg,16px)', overflow: 'hidden', ...style }}
    />
  );
});

export default MapView;
