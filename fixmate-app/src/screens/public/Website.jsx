import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../store';

export default function Website() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  function handleContactSubmit(e) {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.warn('Please fill in all contact fields.');
      return;
    }
    setContactSent(true);
    toast.success('Thank you! Our support team will get back to you within 2 hours.');
  }

  function launchApp() {
    if (user) {
      if (user.role === 'provider') navigate('/provider');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/home');
    } else {
      navigate('/login');
    }
  }

  const navLinks = [
    { id: 'home',         label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'services',     label: 'Services' },
    { id: 'customers',    label: 'For Customers' },
    { id: 'providers',    label: 'For Providers' },
    { id: 'trust',        label: 'Trust & Safety' },
    { id: 'roadside',     label: 'Roadside SOS' },
    { id: 'about',        label: 'About' },
    { id: 'faq',          label: 'FAQ' },
    { id: 'contact',      label: 'Contact' },
  ];

  return (
    <div style={{
      width: '100%', minHeight: '100%', background: '#fff', color: '#1E293B',
      display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* ── Public Website Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border, #E2E8F0)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div 
          onClick={() => setPage('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <img src="/fixmate-logo.png" alt="FixMate" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', gap: 14, alignItems: 'center' }} className="web-desktop-nav">
          {navLinks.map(l => (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: page === l.id ? 700 : 500,
                color: page === l.id ? 'var(--blue, #1A56DB)' : '#64748B',
                borderBottom: page === l.id ? '2px solid var(--blue, #1A56DB)' : '2px solid transparent',
                padding: '6px 2px'
              }}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Action Button & Mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={launchApp}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', fontSize: 13 }}
          >
            <span>{user ? 'Open App' : 'Get Started'}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text)' }}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: '#fff', borderBottom: '2px solid var(--blue)', padding: '12px 20px',
          display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 8px 16px rgba(0,0,0,0.06)'
        }}>
          {navLinks.map(l => (
            <button
              key={l.id}
              onClick={() => { setPage(l.id); setMobileMenuOpen(false); }}
              style={{
                border: 'none', background: 'none', textAlign: 'left', padding: '8px 0',
                fontSize: 14, fontWeight: page === l.id ? 700 : 500,
                color: page === l.id ? 'var(--blue)' : '#475569',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <span>{l.label}</span>
              {page === l.id && <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--blue)' }}>check</span>}
            </button>
          ))}
        </div>
      )}

      {/* ── Page Contents ── */}
      <main style={{ flex: 1, padding: '24px 20px', maxWidth: 860, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* 1. HOME */}
        {page === 'home' && (
          <div>
            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '36px 0 28px' }}>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 99,
                background: '#EFF6FF', color: 'var(--blue, #1A56DB)', fontSize: 12, fontWeight: 700,
                marginBottom: 12
              }}>
                ✨ Hyperlocal Home Repair &amp; Roadside SOS
              </span>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2, color: '#0F172A' }}>
                Upfront Diagnosis. Fixed Visiting Fee.<br />
                <span style={{ color: 'var(--blue, #1A56DB)' }}>Zero Hidden Charges.</span>
              </h1>
              <p style={{ fontSize: 14, color: '#475569', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.6 }}>
                Connect with verified local appliance technicians, plumbers, and emergency roadside mechanics. Real-time GPS dispatch and itemized approval before any repair begins.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button className="btn btn-primary" onClick={launchApp} style={{ padding: '10px 20px', fontSize: 14 }}>
                  Book a Specialist Now
                </button>
                <button className="btn btn-outline" onClick={() => setPage('how-it-works')} style={{ padding: '10px 18px', fontSize: 14 }}>
                  How It Works
                </button>
              </div>
            </div>

            {/* Value Pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, margin: '32px 0' }}>
              {[
                { icon: 'verified', title: '100% Vetted Local Techs', desc: 'Identity, trade license, and police-verified specialists in your 5km radius.' },
                { icon: 'search_check', title: 'Diagnosis-First Pricing', desc: 'Tech inspects and presents an itemized quote. You approve before work starts.' },
                { icon: 'payments', title: 'Guaranteed ₹50 Visiting Fee', desc: 'Standard fixed inspection fee. Decline the quote anytime with no penalties.' },
                { icon: 'car_crash', title: '24/7 Roadside Rescue', desc: 'Dead battery, flat tyre, or fuel emergency on the road dispatched in minutes.' },
              ].map((pill, i) => (
                <div key={i} className="prov-card" style={{ padding: '18px 16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--blue)', marginBottom: 8, display: 'block' }}>
                    {pill.icon}
                  </span>
                  <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>{pill.title}</h4>
                  <p className="muted" style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>{pill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. HOW IT WORKS */}
        {page === 'how-it-works' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>How FixMate Works</h2>
            <p className="muted" style={{ margin: '0 0 24px', fontSize: 14 }}>A transparent 5-step workflow designed to end unfair repair billing.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { step: '01', title: 'Describe Issue & Pick Location', desc: 'Select appliance or vehicle issue, attach a photo, and pinpoint your location on our real Leaflet map.' },
                { step: '02', title: 'Hyperlocal Instant Matching', desc: 'Our engine finds the closest verified specialist within your service radius and gives you an exact GPS ETA.' },
                { step: '03', title: 'On-Premise Physical Diagnosis', desc: 'Specialist inspects the appliance, records photographic evidence of damaged parts, and files their findings.' },
                { step: '04', title: 'Transparent Itemized Quote', desc: 'You see Visiting Fee + Parts + Labour broken down. If a change order arises during work, you approve or decline each revision.' },
                { step: '05', title: 'Digital Payment & Service Record', desc: 'Pay via UPI, Card, Wallet, or Cash. Your invoice, warranty notes, and technician rating remain in your permanent service history.' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 16, padding: '16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 8, background: 'var(--blue)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0
                  }}>
                    {s.step}
                  </div>
                  <div>
                    <strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>{s.title}</strong>
                    <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SERVICES */}
        {page === 'services' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Our Services</h2>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>Specialized repair solutions available on-demand or scheduled.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CATEGORIES.map(c => (
                <div key={c.id} className="prov-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--blue-50)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined">{c.icon}</span>
                    </div>
                    <div>
                      <strong style={{ fontSize: 15 }}>{c.name}</strong>
                      <span className="meta" style={{ display: 'block', fontSize: 12 }}>{c.desc}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {c.items.map((it, idx) => (
                      <span key={idx} style={{ padding: '4px 10px', borderRadius: 6, background: '#F1F5F9', fontSize: 12, color: '#334155' }}>
                        {it.n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. FOR CUSTOMERS */}
        {page === 'customers' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>FixMate for Customers</h2>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>Built to protect homeowners from inflated repair estimates and rogue technicians.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { title: 'The ₹50 Visiting Fee Guarantee', desc: 'No predatory "inspection quotes". You only pay ₹50 if you decide not to proceed with the repair.' },
                { title: 'Itemized Digital Invoices', desc: 'Every replaced capacitor, belt, washer, or litre of fuel is itemized with unit costs.' },
                { title: 'Change-Order Approval (Revision Limit 3)', desc: 'Technicians cannot quietly add charges. Any additional defect discovered requires your explicit mobile approval.' },
                { title: 'Dedicated Dispute Resolution', desc: 'Dissatisfied with repair quality? Report a problem with photos and receive a verified refund from our Trust & Safety ops.' },
              ].map((item, i) => (
                <div key={i} className="prov-card">
                  <strong style={{ fontSize: 15, color: 'var(--blue)', display: 'block', marginBottom: 4 }}>{item.title}</strong>
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FOR PROVIDERS */}
        {page === 'providers' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>FixMate Partner Network</h2>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>Empowering independent technicians with steady bookings, zero commission lock-in, and instant payouts.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { title: 'Custom Service Radius (1–25 km)', desc: 'Never travel 20km for a minor repair. Work only in your familiar neighborhood.' },
                { title: 'Guaranteed Visiting Fee', desc: 'Your time is valuable. Receive your inspection fee even if the customer chooses not to repair.' },
                { title: 'FixMate Verified Badge', desc: 'Upload your Aadhaar/ID and Trade License to gain priority customer trust and higher booking volume.' },
                { title: 'Fair Mediation', desc: 'Disputes are reviewed impartially using before/after diagnosis evidence photos.' },
              ].map((item, i) => (
                <div key={i} className="prov-card">
                  <strong style={{ fontSize: 15, color: 'var(--green, #16A34A)', display: 'block', marginBottom: 4 }}>{item.title}</strong>
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{item.desc}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/signup')} style={{ width: '100%' }}>
              Join as a FixMate Specialist
            </button>
          </div>
        )}

        {/* 6. TRUST & SAFETY */}
        {page === 'trust' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Trust &amp; Safety Standards</h2>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>How we ensure security for both homeowners and service partners.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div className="prov-card">
                <span className="material-symbols-outlined" style={{ color: 'var(--blue)', fontSize: 32, marginBottom: 6 }}>verified_user</span>
                <strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>Multi-Tier Verification</strong>
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>Every specialist passes government ID verification and physical trade background checks.</span>
              </div>
              <div className="prov-card">
                <span className="material-symbols-outlined" style={{ color: 'var(--blue)', fontSize: 32, marginBottom: 6 }}>photo_camera</span>
                <strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>Photographic Evidence</strong>
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>Technicians record photos of worn/damaged components before touching your equipment.</span>
              </div>
              <div className="prov-card">
                <span className="material-symbols-outlined" style={{ color: 'var(--blue)', fontSize: 32, marginBottom: 6 }}>gavel</span>
                <strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>Human Dispute Desk</strong>
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>Disputes are evaluated by our operations desk, not automated chatbots.</span>
              </div>
              <div className="prov-card">
                <span className="material-symbols-outlined" style={{ color: '#DC2626', fontSize: 32, marginBottom: 6 }}>emergency</span>
                <strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>Emergency Boundary</strong>
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>Accidents and bodily injuries are routed to emergency services (112), never repair dispatch.</span>
              </div>
            </div>
          </div>
        )}

        {/* 7. ROADSIDE SOS */}
        {page === 'roadside' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Roadside Breakdown Assistance</h2>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>Stranded on the road? Immediate GPS dispatch for bikes and cars.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { title: 'Battery Jumpstart', desc: 'Portable high-amp starter or on-spot battery testing.' },
                { title: 'Tyre Puncture & Air', desc: 'Mobile puncture vulcanization or spare wheel swap.' },
                { title: 'Emergency Fuel Supply', desc: '3–10L of certified petrol or diesel brought directly to your vehicle.' },
                { title: 'Flatbed Towing', desc: 'Secure winch towing to your preferred mechanic or dealership.' },
              ].map((r, i) => (
                <div key={i} className="prov-card">
                  <strong style={{ fontSize: 14, color: 'var(--blue)', display: 'block', marginBottom: 4 }}>{r.title}</strong>
                  <span style={{ fontSize: 12, color: '#475569' }}>{r.desc}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/emergency')} style={{ width: '100%', background: '#DC2626', borderColor: '#DC2626' }}>
              Launch Roadside Emergency Rescue
            </button>
          </div>
        )}

        {/* 8. ABOUT */}
        {page === 'about' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>About FixMate</h2>
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
              FixMate was created to solve one of the most frustrating urban problems: finding a skilled, honest repair technician without fear of price gouging or phantom repairs.
            </p>
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
              Unlike legacy lead-generation portals that sell customer phone numbers to dozens of unvetted contractors, FixMate operates as an accountable, hyperlocal marketplace. We match you with one dedicated technician nearby, track them live on an open map, and ensure every rupee charged is backed by physical evidence and upfront customer consent.
            </p>
            <div style={{ marginTop: 20, padding: '16px', background: '#EFF6FF', borderRadius: 8 }}>
              <strong style={{ fontSize: 15, color: 'var(--blue)', display: 'block', marginBottom: 4 }}>Our Core Principle</strong>
              <span style={{ fontSize: 13, color: '#1E293B' }}>
                "The customer should know what is broken, why it broke, and what it costs before a screwdriver touches their machine."
              </span>
            </div>
          </div>
        )}

        {/* 9. FAQ */}
        {page === 'faq' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Frequently Asked Questions</h2>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>Everything you need to know about pricing, revisions, and guarantees.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { q: 'What is the visiting fee and when do I pay it?', a: 'The visiting fee is ₹50. It covers the technician’s transit and diagnostic inspection. If you approve the repair, the visiting fee is included in your total. If you decline the repair, you only pay ₹50.' },
                { q: 'Can a provider increase the quote during repair?', a: 'Only if an unexpected hidden defect is discovered. Even then, the provider must file a digital Change Order (max 3 revisions). You have full authority to approve or reject the revision.' },
                { q: 'How does the refund process work?', a: 'If a repair fails or does not resolve the issue, open your Service History, tap "Report a Problem", and submit photos. Our Trust & Safety team reviews the case and issues a full or partial refund.' },
                { q: 'Are all FixMate providers verified?', a: 'Yes. All active providers have submitted government identity and trade documents. Verified badges indicate full background review.' },
              ].map((f, i) => (
                <div key={i} className="prov-card" style={{ padding: '14px 16px' }}>
                  <strong style={{ fontSize: 14, color: '#0F172A', display: 'block', marginBottom: 4 }}>{f.q}</strong>
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{f.a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. CONTACT */}
        {page === 'contact' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Contact Support</h2>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 14 }}>Need help with an ongoing booking or partnership inquiry?</p>

            {contactSent ? (
              <div style={{ padding: '24px', background: 'var(--green-bg, #DCFCE7)', borderRadius: 10, textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--green)' }}>check_circle</span>
                <h3 style={{ margin: '8px 0', fontSize: 18, color: 'var(--green)' }}>Message Received</h3>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  Our customer operations team in Mumbai will reach out to your email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="prov-card" style={{ padding: '18px 20px' }}>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Your Name</label>
                  <input
                    type="text"
                    placeholder="Aditi Sharma"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="aditi@example.com"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Message</label>
                  <textarea
                    placeholder="Describe your inquiry, feedback, or booking issue..."
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    style={{ minHeight: 90 }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Send Message
                </button>
              </form>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <strong style={{ fontSize: 13, display: 'block' }}>Emergency Helpline</strong>
                <span className="meta" style={{ fontSize: 12 }}>1800-FIX-MATE (Toll Free)</span>
              </div>
              <div>
                <strong style={{ fontSize: 13, display: 'block' }}>Headquarters</strong>
                <span className="meta" style={{ fontSize: 12 }}>Andheri West, Mumbai</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer style={{
        marginTop: 'auto', borderTop: '1px solid var(--border)', padding: '20px',
        textAlign: 'center', fontSize: 12, color: '#64748B', background: '#F8FAFC'
      }}>
        <p style={{ margin: '0 0 8px' }}>
          FixMate &copy; 2026. An open, hyperlocal repair &amp; emergency dispatch marketplace.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
          <button onClick={() => setPage('about')} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12 }}>About</button>
          <button onClick={() => setPage('trust')} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12 }}>Trust &amp; Safety</button>
          <button onClick={() => setPage('faq')} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12 }}>FAQ</button>
          <button onClick={() => setPage('contact')} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12 }}>Contact</button>
          <button onClick={launchApp} style={{ border: 'none', background: 'none', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Launch App</button>
        </div>
      </footer>
    </div>
  );
}
