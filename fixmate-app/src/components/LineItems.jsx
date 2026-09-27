import { fmt } from '../store';

export default function LineItems({ visitingFee, parts = [], labour = 0, addOns = [], total }) {
  const computedTotal = total ?? (visitingFee + parts.reduce((s, p) => s + p.cost, 0) + labour + addOns.reduce((s, a) => s + a.cost, 0));

  return (
    <div className="prov-card" style={{ padding: 0 }}>
      <div style={{ padding: '0 16px' }}>
        <div className="line-item">
          <div className="li-label">
            <strong>Visiting fee</strong>
            <span>Diagnosis on arrival</span>
          </div>
          <div className="li-value">{fmt(visitingFee)}</div>
        </div>

        {parts.map((p, i) => (
          <div className="line-item" key={i}>
            <div className="li-label"><strong>{p.name}</strong><span>Parts</span></div>
            <div className="li-value">{fmt(p.cost)}</div>
          </div>
        ))}

        {labour > 0 && (
          <div className="line-item">
            <div className="li-label"><strong>Labour</strong></div>
            <div className="li-value">{fmt(labour)}</div>
          </div>
        )}

        {addOns.map((a, i) => (
          <div className="line-item" key={i}>
            <div className="li-label">
              <strong>{a.name}</strong>
              <span>Add-on{a.note ? ` · ${a.note}` : ''}</span>
            </div>
            <div className="li-value">+{fmt(a.cost)}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <div className="total-row">
          <span>Total</span>
          <span>{fmt(computedTotal)}</span>
        </div>
      </div>
    </div>
  );
}
