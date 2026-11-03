// Visit OTP card (customer side) — shown on ProviderAssigned and Tracking.
// The code is generated once when the provider is assigned and stored on
// the job (see store.js saveJob); this component never generates or
// regenerates it, so both screens always show the same code. It is an
// in-app verification code only — it is NOT sent by SMS.
export default function VisitOtpCard({ job }) {
  if (!job?.otp) return null;
  const verified = !!job.otpVerified;

  return (
    <div className="prov-card" style={{
      marginBottom: 16,
      borderColor: verified ? 'var(--green-border)' : 'var(--border)',
      background: verified ? 'var(--green-bg)' : 'var(--surface)',
    }}>
      <p className="section-title" style={{ margin: '0 0 8px' }}>Your visit OTP</p>
      {verified ? (
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-text)' }}>
          ✓ OTP verified by the provider — work can start.
        </div>
      ) : (
        <>
          <div style={{
            fontSize: 32, fontWeight: 800, letterSpacing: 6,
            color: 'var(--text)', textAlign: 'center', margin: '4px 0 8px',
          }}>
            {job.otp}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, textAlign: 'center' }}>
            Share this OTP with the provider <strong>ONLY when they arrive</strong> to
            start the work — do not share it before arrival.
          </p>
        </>
      )}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'center' }}>
        In-app verification code — not sent by SMS.
      </p>
    </div>
  );
}
