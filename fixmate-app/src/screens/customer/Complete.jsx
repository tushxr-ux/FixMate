import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, saveJob, fmt } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';
import LineItems from '../../components/LineItems';
import Stars from '../../components/Stars';

export default function Complete() {
  const { jobId }   = useParams();
  const navigate    = useNavigate();
  const toast       = useToast();
  const job         = getJob(jobId);

  const [rating,   setRating]  = useState(0);
  const [comment,  setComment] = useState('');
  const [paying,   setPaying]  = useState(false);
  const [paid,     setPaid]    = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [method,   setMethod]  = useState('upi');

  if (!job) { navigate('/home'); return null; }

  async function handlePay() {
    setPaying(true);
    await new Promise(r => setTimeout(r, 900));
    const txnId = 'TXN' + Date.now().toString(36).toUpperCase();
    const updated = { ...job, status: 'completed', paymentMethod: method, txnId, paidAt: Date.now() };
    saveJob(updated);
    setPaying(false);
    setPaid(true);
    toast.success('Payment successful! Please rate your experience.');
    setShowRate(true); // auto-prompt rating modal
  }

  function submitRating() {
    if (rating > 0) {
      const updated = getJob(jobId);
      if (updated) saveJob({ ...updated, rating, reviewComment: comment.trim() });
      toast.success('Thank you for your review!');
    }
    setShowRate(false);
  }

  const METHODS = [
    { id:'upi',    label:'UPI',           icon:'account_balance' },
    { id:'card',   label:'Card',          icon:'credit_card' },
    { id:'wallet', label:'Wallet',        icon:'account_balance_wallet' },
    { id:'cash',   label:'Cash on Spot',  icon:'payments' },
  ];

  if (paid && !showRate) {
    return (
      <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
        <TopBar title="Payment successful" back={false} />
        <div className="body body-center screen-enter">
          <div className="big-icon">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <h2 style={{ margin:'0 0 6px' }}>Payment confirmed!</h2>
          <p className="muted">Transaction ID: <strong>{job.txnId || ('TXN' + jobId.slice(-8).toUpperCase())}</strong></p>
          <p className="muted" style={{ marginTop:4 }}>Amount: <strong>{fmt(job.total)}</strong> · Method: <span style={{ textTransform:'uppercase' }}>{job.paymentMethod || 'UPI'}</span></p>
          <button className="btn btn-primary" style={{ marginTop:24, maxWidth:280 }}
            onClick={() => navigate(`/job/${jobId}`)}>
            <span className="material-symbols-outlined">receipt_long</span> View Official Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <TopBar title="Job complete — pay" back={false} />

      <div className="body screen-enter">
        <div className="banner ok" style={{ display:'block', marginBottom:16 }}>
          ✅ Repair completed. Please review and pay.
        </div>

        <p className="section-title">Final bill</p>
        <LineItems
          visitingFee={job.visitingFee}
          parts={job.parts || []}
          labour={job.labour || 0}
          addOns={job.addOns || []}
          total={job.total}
        />

        <p className="section-title" style={{ marginTop: 16 }}>Payment Method</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
          {METHODS.map(m => (
            <div key={m.id}
              className="item-card"
              style={{
                border: method === m.id ? '2px solid var(--blue)' : '1.5px solid var(--border)',
                background: method === m.id ? 'var(--blue-light)' : 'var(--surface)',
                padding: '12px 8px'
              }}
              onClick={() => setMethod(m.id)}>
              <span className="material-symbols-outlined" style={{ color: 'var(--blue)' }}>{m.icon}</span>
              <span className="label" style={{ fontWeight: method === m.id ? 700 : 500 }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Rating modal — slides up automatically after payment */}
        {showRate && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: '#fff', borderRadius: '20px 20px 0 0',
              padding: '28px 24px 40px', width: '100%', maxWidth: 480,
              boxShadow: '0 -8px 32px rgba(0,0,0,.18)',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#EFF6FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 30, color: 'var(--blue)' }}>star</span>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>How was your experience?</h3>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>Your rating helps us keep quality high</p>
              </div>

              <Stars initial={0} onChange={setRating} />

              <textarea
                placeholder="Leave a comment (optional) — e.g. very professional, arrived on time"
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{
                  width: '100%', marginTop: 16, padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--border)', fontSize: 13, resize: 'none', minHeight: 72,
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={submitRating}>
                  Skip
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={submitRating}
                  disabled={rating === 0}
                >
                  <span className="material-symbols-outlined">star</span>
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          className={`btn btn-primary${paying?' loading':''}`}
          onClick={handlePay}
          disabled={paying}
          style={{ fontSize:16 }}
        >
          {!paying && <><span className="material-symbols-outlined">payments</span> Pay {fmt(job.total)}</>}
        </button>
      </div>
    </div>
  );
}
