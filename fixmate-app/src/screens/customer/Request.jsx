import { useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createJob } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';

export default function Request() {
  const { categoryId, itemName } = useParams();
  const navigate     = useNavigate();
  const routerLoc   = useLocation();
  const toast        = useToast();
  const fileRef      = useRef();

  const [desc,    setDesc]    = useState('');
  const [mode,    setMode]    = useState('immediate');
  const [schedAt, setSchedAt] = useState('');
  const [photo,   setPhoto]   = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Location comes back from LocationPicker via router state
  const pickedLocation = routerLoc.state?.location || null;

  const decodedItem = decodeURIComponent(itemName || '');

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (file) setPhoto(file.name);
  }

  function openLocationPicker() {
    navigate('/location-picker', {
      state: {
        nextRoute: `/request/${categoryId}/${itemName}`,
        forwardState: { desc, mode, schedAt, photo },
      },
    });
  }

  // Restore state forwarded back from LocationPicker
  const forwarded = routerLoc.state?.forwardState;
  useState(() => {
    if (forwarded?.desc)   setDesc(forwarded.desc);
    if (forwarded?.mode)   setMode(forwarded.mode);
    if (forwarded?.schedAt)setSchedAt(forwarded.schedAt);
    if (forwarded?.photo)  setPhoto(forwarded.photo);
  });

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
    });

    setLoading(false);
    if (!job) { setError('Please log in to book a job.'); return; }
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
              {['Today', 'Tomorrow', 'Day After'].map((d, idx) => {
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
