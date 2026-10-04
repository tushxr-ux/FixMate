import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MapView, { customerIcon, makeProviderIcon, reverseGeocode } from '../../components/MapView';
import { getProviders } from '../../store';
import TopBar from '../../components/TopBar';
import Spinner from '../../components/Spinner';

// Mumbai (Thakur Village & Kandivali default)
const MUMBAI = { lat: 19.2085, lng: 72.8735 };

const POPULAR_KANDIVALI_AREAS = [
  { name: 'Thakur Village', desc: 'Evershine / D-Mart', lat: 19.2085, lng: 72.8735 },
  { name: 'Thakur Complex', desc: 'Near Highway', lat: 19.2055, lng: 72.8710 },
  { name: 'Mahavir Nagar', desc: 'Kandivali West', lat: 19.2065, lng: 72.8354 },
  { name: 'Akurli Road', desc: 'Growel\'s 101', lat: 19.2038, lng: 72.8655 },
  { name: 'Charkop Sector 8', desc: 'Kandivali West', lat: 19.2165, lng: 72.8295 },
];

export default function LocationPicker() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // nextRoute + forward state come from the caller (Request screen)
  const { nextRoute, forwardState = {} } = location.state || {};

  const [pin,      setPin]      = useState(MUMBAI);
  const [address,  setAddress]  = useState('Detecting your location…');
  const [geoState, setGeoState] = useState('detecting'); // detecting | granted | denied | done
  const [loading,  setLoading]  = useState(true);
  const mapRef = useRef(null);

  // Provider markers from store (for awareness)
  const providers = getProviders({ available: true }).filter(p => p.lat && p.lng);

  /* ── Geolocation on mount ──────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoState('denied');
      setAddress('Thakur Village, Kandivali East, Mumbai');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPin(latlng);
        setGeoState('granted');
        mapRef.current?.flyTo([latlng.lat, latlng.lng], 16);
        doReverseGeocode(latlng.lat, latlng.lng);
      },
      _err => {
        setGeoState('denied');
        setAddress('Thakur Village, Kandivali East, Mumbai');
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  async function doReverseGeocode(lat, lng) {
    setLoading(true);
    const result = await reverseGeocode(lat, lng);
    setAddress(result.address);
    setLoading(false);
  }

  /* ── Map tap handler ───────────────────────────────────── */
  const handleMapClick = useCallback(latlng => {
    setPin({ lat: latlng.lat, lng: latlng.lng });
    doReverseGeocode(latlng.lat, latlng.lng);
  }, []);

  /* ── Confirm ───────────────────────────────────────────── */
  function confirmLocation() {
    const loc = { lat: pin.lat, lng: pin.lng, address };
    if (nextRoute) {
      navigate(nextRoute, { state: { ...forwardState, location: loc } });
    } else {
      navigate(-1);
    }
  }

  /* ── Markers ───────────────────────────────────────────── */
  const markers = [
    // Customer pin (draggable)
    {
      lat: pin.lat, lng: pin.lng,
      icon: customerIcon,
      popup: 'Your location',
      draggable: true,
      onDragEnd: latlng => {
        setPin({ lat: latlng.lat, lng: latlng.lng });
        doReverseGeocode(latlng.lat, latlng.lng);
      },
    },
    // Available providers
    ...providers.map(p => ({
      lat: p.lat, lng: p.lng,
      icon: makeProviderIcon(false),
      popup: `<strong>${p.name}</strong><br>${p.rating}★ · ${p.totalJobs} jobs`,
    })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Set your location" back />

      {/* Permission denied banner */}
      {geoState === 'denied' && (
        <div className="banner warn" style={{ display: 'block', margin: '12px 16px 0', borderRadius: 'var(--r)' }}>
          📍 Location access denied. Tap the map or drag the pin to set your location manually.
        </div>
      )}

      {/* Quick Kandivali Neighborhoods */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px 2px', WebkitOverflowScrolling: 'touch' }}>
        {POPULAR_KANDIVALI_AREAS.map((a, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const latlng = { lat: a.lat, lng: a.lng };
              setPin(latlng);
              mapRef.current?.flyTo([a.lat, a.lng], 16);
              setAddress(`${a.name}, Kandivali, Mumbai`);
            }}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              borderRadius: 9999,
              border: pin.lat === a.lat ? '1.5px solid var(--blue)' : '1px solid var(--border)',
              background: pin.lat === a.lat ? 'var(--blue-light)' : 'var(--surface)',
              color: pin.lat === a.lat ? 'var(--blue)' : 'var(--text-body)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--blue)' }}>location_on</span>
            <span>{a.name}</span>
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="map-area" style={{ margin: '10px 16px 0', flex: 1, minHeight: 340, position: 'relative' }}>
        <MapView
          ref={mapRef}
          center={[pin.lat, pin.lng]}
          zoom={15}
          height="320px"
          style={{ borderRadius: 'var(--r-lg)' }}
          markers={markers}
          onClick={handleMapClick}
          onReady={map => setTimeout(() => map.invalidateSize(), 100)}
        />

        {/* "Tap to place pin" hint */}
        {geoState !== 'denied' && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, fontWeight: 600,
            padding: '5px 12px', borderRadius: 20, zIndex: 400, whiteSpace: 'nowrap',
          }}>
            Tap map or drag pin to adjust
          </div>
        )}

        {/* My location button */}
        <button
          className="my-location-btn"
          onClick={() => {
            navigator.geolocation?.getCurrentPosition(pos => {
              const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setPin(latlng);
              mapRef.current?.flyTo([latlng.lat, latlng.lng], 17);
              doReverseGeocode(latlng.lat, latlng.lng);
            });
          }}
          title="Use my location"
          style={{ zIndex: 400 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>my_location</span>
        </button>
      </div>

      {/* Address strip + confirm */}
      <div style={{ padding: '16px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--blue)', marginTop: 1 }}>location_on</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>
              Selected location
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading
                ? <Spinner size={16} />
                : <span style={{ fontSize: 14, fontWeight: 600 }}>{address}</span>
              }
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={confirmLocation} disabled={loading}>
          <span className="material-symbols-outlined">check_circle</span>
          Confirm this location
        </button>
      </div>
    </div>
  );
}
