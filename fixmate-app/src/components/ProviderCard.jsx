import { useNavigate } from 'react-router-dom';
import { distLabel } from '../store';

export default function ProviderCard({ provider: p, compact = false }) {
  const navigate = useNavigate();
  if (!p) return null;
  const dist = p.distKm ? distLabel(p.distKm) : null;

  return (
    <div className="prov-card">
      <div className="prov-top">
        <div className="avatar avatar-lg" style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/provider-profile/${p.id}`)}>
          {p.init}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ cursor: 'pointer' }} onClick={() => navigate(`/provider-profile/${p.id}`)}>
            {p.name}
          </h3>
          <span className="meta">
            {p.rating > 0 && <>{p.rating} ★ ({p.totalJobs} jobs){dist ? ` · ${dist}` : ''}</>}
          </span>
        </div>
        <button className="icon-btn" onClick={() => navigate(`/provider-profile/${p.id}`)}
          aria-label="View provider profile" title="View profile">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
        </button>
      </div>

      {!compact && (
        <>
          <div className="verify-strip">
            <div className={`verify-chip ${p.verified ? 'yes' : 'no'}`}>
              <span className="material-symbols-outlined">{p.verified ? 'verified' : 'pending'}</span>
              {p.verified ? 'FixMate Verified' : 'Verification Pending'}
            </div>
            {p.idVerified && (
              <div className="verify-chip yes">
                <span className="material-symbols-outlined">verified_user</span>ID Verified
              </div>
            )}
            {p.bizVerified && (
              <div className="verify-chip yes">
                <span className="material-symbols-outlined">business_center</span>Biz Verified
              </div>
            )}
          </div>
          <div className="tags" style={{ marginTop: 10 }}>
            {(p.specialties || []).map(s => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
