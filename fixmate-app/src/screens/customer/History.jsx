import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobs, getProvider } from '../../store';
import TopBar from '../../components/TopBar';
import BottomTabs from '../../components/BottomTabs';
import EmptyState from '../../components/EmptyState';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const jobs     = user ? getJobs({ customerId: user.id }) : [];

  const statusConfig = {
    completed:           { badge: 'badge-success', label: 'Completed' },
    quote_rejected:      { badge: 'badge-muted',   label: 'Visiting fee only' },
    cancelled_by_customer:{ badge: 'badge-muted',  label: 'Cancelled' },
    in_progress:         { badge: 'badge-info',    label: 'In progress' },
    matched:             { badge: 'badge-info',    label: 'Provider assigned' },
    pending:             { badge: 'badge-warning', label: 'Pending' },
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <TopBar title="Service history" back={false} />

      <div className="body screen-enter">
        {jobs.length === 0 ? (
          <EmptyState
            icon="🛠️"
            title="No service history yet"
            body="Book your first repair and it will appear here."
            action={{ label: 'Book a repair', onClick: () => navigate('/home') }}
          />
        ) : (
          jobs.map(j => {
            const prov = getProvider(j.providerId);
            const cfg  = statusConfig[j.status] || { badge:'badge-muted', label:j.status };
            return (
              <div key={j.id} className="hist-row" onClick={() => navigate(`/job/${j.id}`)}>
                <div className="avatar">
                  <span className="material-symbols-outlined">build</span>
                </div>
                <div className="info">
                  <strong>{prov?.name || 'Provider'}</strong>
                  <span>{j.item} · {j.date} · ₹{j.total.toLocaleString('en-IN')}</span>
                </div>
                <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
              </div>
            );
          })
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
