import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createJob, createHold, currentUser } from '../../store';
import TopBar from '../../components/TopBar';

// ── Request-draft contract ─────────────────────────────────────
// The draft is the single source of truth for an in-progress request.
// It lives in sessionStorage (keyed per category/item) so it survives:
//  (a) Confirm-location return, (b) TopBar back-button return from
//      LocationPicker (which remounts this screen with no router state),
//  (c) a page refresh. It is cleared ONLY on successful submit.
// Router state is still honoured as a second source, in both shapes:
//  the current contract { forwardState, location } AND the old spread
//  shape { desc, mode, schedAt, photo, location } from LocationPicker.
// A photo data-URL is stored only for files <= 1 MB (base64 inflates
// size ~33%, and sessionStorage is typically ~5 MB); larger photos keep
// their filename only, so the draft can never blow up storage.
const MAX_PHOTO_DATA_URL_BYTES = 1024 * 1024;

function draftKey(categoryId, itemName) {
  return `fixmate:request-draft:${categoryId || ''}:${itemName || ''}`;
}

function readDraft(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Request() {
  const { categoryId, itemName } = useParams();
  const navigate     = useNavigate();
  const routerLoc   = useLocation();
  const fileRef      = useRef();

  const key = draftKey(categoryId, itemName);
  // Merge, weakest first: stored draft, then router state (freshest wins).
  // Router state may carry forwardState (current contract) or the fields
  // spread at top level (old LocationPicker shape) — accept both.
  const routerState = routerLoc.state || {};
  const forwarded = routerState.forwardState || routerState;
  const stored = readDraft(key) || {};
  const initial = {
    desc: forwarded.desc ?? stored.desc ?? '',
    mode: forwarded.mode ?? stored.mode ?? 'immediate',
    schedAt: forwarded.schedAt ?? stored.schedAt ?? '',
    photo: forwarded.photo ?? stored.photo ?? null,
    photoDataUrl: forwarded.photoDataUrl ?? stored.photoDataUrl ?? null,
    location: routerState.location ?? stored.location ?? null,
  };

  const [desc,    setDesc]    = useState(initial.desc);
  const [mode,    setMode]    = useState(initial.mode);
  const [schedAt, setSchedAt] = useState(initial.schedAt);
  const [photo,   setPhoto]   = useState(initial.photo);
  const [photoDataUrl, setPhotoDataUrl] = useState(initial.photoDataUrl);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Location comes back from LocationPicker via router state, or from
  // the stored draft (covers back-button return and refresh).
  const pickedLocation = routerState.location || stored.location || null;

  // Persist the draft on every change. This is what makes the
  // back-button return work: LocationPicker's TopBar back does
  // navigate(-1) with no state, remounting this screen, which then
  // restores from here instead of from router state.
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify({
        desc, mode, schedAt, photo, photoDataUrl, location: pickedLocation,
      }));
    } catch {
      // Storage full (e.g. a huge photo slipped through): keep the
      // text fields and drop the data-URL rather than losing the draft.
      try {
        sessionStorage.setItem(key, JSON.stringify({
          desc, mode, schedAt, photo, photoDataUrl: null, location: pickedLocation,
        }));
      } catch { /* draft persistence is best-effort */ }
    }
  }, [key, desc, mode, schedAt, photo, photoDataUrl, pickedLocation]);

  const decodedItem = decodeURIComponent(itemName || '');

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file.name);
    if (file.size <= MAX_PHOTO_DATA_URL_BYTES) {
      const reader = new FileReader();
      reader.onload = () => setPhotoDataUrl(reader.result);
      reader.onerror = () => setPhotoDataUrl(null);
      reader.readAsDataURL(file);
    } else {
      // Large photo: keep the name only, so the draft stays small.
      setPhotoDataUrl(null);
    }
  }

  function openLocationPicker() {
    navigate('/location-picker', {
      state: {
        nextRoute: `/request/${categoryId}/${itemName}`,
        // Current contract: draft fields nested under forwardState.
        forwardState: { desc, mode, schedAt, photo, photoDataUrl },
      },
    });
  }

  async function handleSubmit() {
    if (!desc.trim()) { setError('Please describe the issue.'); return; }
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 400));
    const job = createJob({
      category: categoryId,
      item: decodedItem,
      issue: desc.trim(),
      mode,
      scheduledTime: mode === 'scheduled' ? schedAt : null,
      location: pickedLocation,
      // Photo is stored on the job record (name always, preview only if
      // small enough). It is never uploaded to a server — this app has
      // no backend; the preview lives in localStorage with the job.
      photoName: photo,
      photo: photoDataUrl,
    });

    // §2.1: place ₹100 hold on wallet for scheduled bookings (no-show protection)
    if (job && mode === 'scheduled') {
      const user = currentUser();
      if (user) createHold(user.id, 100, job.id);
    }

    setLoading(false);
    if (!job) { setError('Please log in to book a job.'); return; }
    // Draft is cleared ONLY here, on successful submit.
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
    navigate(`/matching/${job.id}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Describe the issue" back backTo={`/items/${categoryId}`} />

      <div className="body screen-enter">
        {/* Issue description */}
        <div className="field">
          <label htmlFor="issueDesc">What&apos;s wrong with your {decodedItem.toLowerCase()}?</label>
          <textarea
            id="issueDesc"
            placeholder={`e.g. ${decodedItem} is running but not working properly`}
            value={desc}
            onChange={e => { setDesc(e.target.value); setError(''); }}
            className={error ? 'err' : ''}
          />
          {error && <p className="field-err">{error}</p>}
        </div>

        {/* Photo upload */}
        <div className="field">
          <label>Photo of the issue (optional)</label>
          <div className="search-bar" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
            <span className="material-symbols-outlined">photo_camera</span>
            <span>{photo ? `✓ ${photo}` : 'Attach a photo'}</span>
          </div>
          {photoDataUrl && (
            <img src={photoDataUrl} alt="Attached issue preview" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid var(--border)' }} />
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        {/* Location — tap to open real map */}
        <div className="field">
          <label>Your location</label>
          <div
            className="search-bar"
            onClick={openLocationPicker}
            style={{ cursor: 'pointer', borderColor: pickedLocation ? 'var(--green)' : 'var(--border)' }}
          >
            <span className="material-symbols-outlined"
              style={{ color: pickedLocation ? 'var(--green)' : 'var(--text-muted)' }}>
              location_on
            </span>
            <span style={{ color: pickedLocation ? 'var(--text)' : 'var(--text-muted)', flex: 1 }}>
              {pickedLocation ? pickedLocation.address : 'Set your location on map'}
            </span>
            {pickedLocation && (
              <span className="material-symbols-outlined" style={{ color: 'var(--green)', fontSize: 18 }}>check_circle</span>
            )}
          </div>
        </div>

        {/* When */}
        <div className="field">
          <label>When do you need help?</label>
          <div className="mode-toggle">
            <button className={mode === 'immediate' ? 'active' : ''} onClick={() => setMode('immediate')}>
              Right now
            </button>
            <button className={mode === 'scheduled' ? 'active' : ''} onClick={() => setMode('scheduled')}>
              Schedule
            </button>
          </div>
        </div>

        {mode === 'scheduled' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Select Appointment Date
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['Today', 'Tomorrow', 'Day After'].map(d => {
                const isSelected = schedAt.startsWith(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const currentSlot = schedAt.includes('·') ? schedAt.split('·')[1].trim() : '10:00 AM - 12:00 PM';
                      setSchedAt(`${d} · ${currentSlot}`);
                    }}
                    className={isSelected ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                    style={{ flex: 1 }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Select Time Slot
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[
                '09:00 AM - 11:00 AM',
                '11:00 AM - 01:00 PM',
                '02:00 PM - 04:00 PM',
                '04:00 PM - 06:00 PM',
                '06:00 PM - 08:00 PM',
              ].map(slot => {
                const isSlotSelected = schedAt.includes(slot);
                return (
                  <div
                    key={slot}
                    onClick={() => {
                      const currentDate = schedAt.includes('·') ? schedAt.split('·')[0].trim() : 'Tomorrow';
                      setSchedAt(`${currentDate} · ${slot}`);
                    }}
                    style={{
                      padding: '8px 10px', borderRadius: 6, fontSize: 12, textAlign: 'center', cursor: 'pointer',
                      border: isSlotSelected ? '2px solid var(--blue)' : '1px solid var(--border)',
                      background: isSlotSelected ? '#EFF6FF' : '#fff',
                      fontWeight: isSlotSelected ? 700 : 500,
                      color: isSlotSelected ? 'var(--blue)' : 'var(--text)'
                    }}
                  >
                    {slot}
                  </div>
                );
              })}
            </div>
            {schedAt && (
              <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginTop: 4 }}>
                ✓ Selected Slot: {schedAt}
              </div>
            )}
          </div>
        )}

        <div className="banner" style={{ display: 'block', marginBottom: 16 }}>
          {mode === 'immediate'
            ? 'A ₹50 visiting fee applies once a provider is dispatched. No charge until then.'
            : 'A ₹100 commitment hold is placed on your wallet (illustrative). Automatically released if technician cancels or fails to arrive.'}
        </div>

        <button
          className={`btn btn-primary${loading ? ' loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {!loading && <><span className="material-symbols-outlined">search</span> Find a provider</>}
        </button>
      </div>
    </div>
  );
}
