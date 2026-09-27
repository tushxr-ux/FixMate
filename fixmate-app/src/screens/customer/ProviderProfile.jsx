import { useParams, useNavigate } from 'react-router-dom';
import { getProvider, getJobs, fmt, distLabel } from '../../store';
import TopBar from '../../components/TopBar';
import Stars from '../../components/Stars';

export default function ProviderProfile() {
  const { providerId } = useParams();
  const navigate       = useNavigate();
  const prov = getProvider(providerId);

  if (!prov) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <TopBar title="Provider" back />
        <div className="body"><p className="muted">Provider not found.</p></div>
      </div>
    );
  }

  const completedJobs = getJobs({ providerId: prov.id }).filter(j => j.status === 'completed');
  const avgRating     = completedJobs.length
    ? (completedJobs.reduce((s, j) => s + (j.rating || 0), 0) / completedJobs.length).toFixed(1)
    : prov.rating;

  const reviews = completedJobs.filter(j => j.rating > 0).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TopBar title="Provider profile" back />

      <div className="body screen-enter">
        {/* Hero */}
        <div className="prov-card">
          <div className="prov-top">
            <div className="avatar avatar-xl" style={{ fontSize: 28 }}>{prov.init}</div>
            <div>
              <h3 style={{ fontSize: 18 }}>{prov.name}</h3>
              <p className="meta">{distLabel(prov.distKm)}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{avgRating}</span>
                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="muted" style={{ fontSize: 12 }}>({prov.totalJobs} jobs)</span>
              </div>
            </div>
          </div>

          {/* Verification badges */}
          <div className="tags" style={{ marginTop: 10 }}>
            {prov.verified    && <span className="tag verified">✓ FixMate Verified</span>}
            {prov.idVerified  && <span className="tag">✓ ID Verified</span>}
            {prov.bizVerified && <span className="tag">✓ Business Verified</span>}
            {!prov.verified   && <span className="tag" style={{ color: 'var(--amber)', borderColor: 'var(--amber)' }}>Verification pending</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="stat-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 16 }}>
          <div className="stat-card"><div className="val">{prov.totalJobs}</div><div className="lbl">Jobs done</div></div>
          <div className="stat-card"><div className="val">{prov.rating}</div><div className="lbl">Avg rating</div></div>
          <div className="stat-card"><div className="val">{prov.serviceRadius}km</div><div className="lbl">Radius</div></div>
        </div>

        {/* Specialties */}
        {prov.specialties?.length > 0 && (
          <>
            <p className="section-title">Specialties</p>
            <div className="tags" style={{ marginBottom: 16 }}>
              {prov.specialties.map(s => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          </>
        )}

        {/* Reliability */}
        <p className="section-title">Reliability</p>
        <div className="prov-card" style={{ marginBottom: 16 }}>
          {[
            { label: 'Cancellations', value: prov.cancellations, warn: prov.cancellations > 3 },
            { label: 'No-shows',      value: prov.noShows,       warn: prov.noShows > 1 },
          ].map(({ label, value, warn }) => (
            <div key={label} className="line-item">
              <div className="li-label"><strong>{label}</strong></div>
              <div className="li-value" style={{ color: warn ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent reviews */}
        {reviews.length > 0 && (
          <>
            <p className="section-title">Recent reviews</p>
            {reviews.map(j => (
              <div key={j.id} className="hist-row" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className="material-symbols-outlined"
                      style={{ color: n <= j.rating ? '#f59e0b' : 'var(--border)', fontSize: 14,
                               fontVariationSettings: n <= j.rating ? "'FILL' 1" : "'FILL' 0" }}>
                      star
                    </span>
                  ))}
                </div>
                <div className="info">
                  <span>{j.item} · {j.date}</span>
                </div>
              </div>
            ))}
          </>
        )}

        <button className="btn btn-primary" style={{ marginTop: 8 }}
          onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span> Back
        </button>
      </div>
    </div>
  );
}
