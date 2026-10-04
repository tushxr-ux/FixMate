import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../store';
import LazySection from '../../components/LazySection';

export default function Website() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');

  function launchApp(targetPath) {
    if (targetPath) {
      navigate(targetPath);
      return;
    }
    if (user) {
      if (user.role === 'provider') navigate('/provider');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/home');
    } else {
      navigate('/login');
    }
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.warn('Please fill in your name, email, and message.');
      return;
    }
    toast.success('Thank you! Our support desk has received your ticket and will respond within 30 minutes.');
    setContactForm({ name: '', email: '', phone: '', message: '' });
  }

  const faqs = [
    {
      q: 'How does the visiting fee work?',
      a: 'FixMate charges a standardized ₹50 inspection fee when you approve the repair quote (or ₹99 for emergency roadside towing). If you choose to decline after on-site physical diagnosis, a visiting fee of ₹100 applies for standard home repairs, or ₹199 for towing/roadside dispatch to cover heavy recovery travel.'
    },
    {
      q: 'What happens if I decline the quote after diagnosis?',
      a: 'You are completely free to decline! If you choose not to proceed after receiving the physical diagnosis, a ₹100 visiting fee applies for standard home services (or ₹199 for vehicle towing assistance). No hidden surprise charges.'
    },
    {
      q: 'Are all FixMate technicians background verified?',
      a: 'Yes, 100%. Every service provider in our hyperlocal network undergoes government ID verification, criminal background/police checks, and trade skill certifications before they are dispatched.'
    },
    {
      q: 'How fast is the 24/7 Roadside Assistance response?',
      a: 'Our emergency dispatch algorithm locates the nearest mobile mechanic within a 3-5 km radius in Mumbai. On average, roadside mechanics arrive in 12 to 18 minutes for flat tyres, battery jumpstarts, and flatbed towing.'
    },
    {
      q: 'Is there a warranty on repairs and replacement parts?',
      a: 'Every completed job through FixMate is protected by our 30-Day Escrow Service Warranty. If the same issue recurs within 30 days, we send a technician back for a free re-inspection.'
    },
  ];

  const filteredCategories = CATEGORIES.filter(cat => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.desc.toLowerCase().includes(q) ||
      cat.items.some(it => it.n.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#FFFFFF',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── Sticky Blur Navbar ─────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        transition: 'all 0.2s ease'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <img
              src="/fixmate-logo.webp"
              alt="FixMate Logo"
              style={{ height: 38, width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Desktop Navigation */}
          <nav style={{ display: 'none', alignItems: 'center', gap: 28 }} className="web-desktop-nav">
            <a href="#services" style={{ color: '#475569', fontSize: 14, fontWeight: 600, transition: 'color 0.15s' }}>Services</a>
            <a href="#how-it-works" style={{ color: '#475569', fontSize: 14, fontWeight: 600, transition: 'color 0.15s' }}>How It Works</a>
            <a href="#guarantee" style={{ color: '#475569', fontSize: 14, fontWeight: 600, transition: 'color 0.15s' }}>FixMate Escrow</a>
            <a href="#roadside" style={{ color: '#DC2626', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>car_crash</span>
              Roadside SOS
            </a>
            <a href="#providers" style={{ color: '#475569', fontSize: 14, fontWeight: 600, transition: 'color 0.15s' }}>For Pros</a>
            <a href="#faq" style={{ color: '#475569', fontSize: 14, fontWeight: 600, transition: 'color 0.15s' }}>FAQ</a>
            <a href="#contact" style={{ color: '#475569', fontSize: 14, fontWeight: 600, transition: 'color 0.15s' }}>Contact</a>
          </nav>

          {/* CTA & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => launchApp()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 10,
                background: 'var(--blue, #1A56DB)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(26, 86, 219, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{user ? 'Open Dashboard' : 'Launch FixMate App'}</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="web-mobile-toggle"
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                color: '#0F172A'
              }}
              aria-label="Toggle Navigation"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            padding: '16px 8px 12px',
            borderTop: '1px solid #E2E8F0',
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: '#FFFFFF'
          }}>
            {[
              { href: '#services', label: 'Services' },
              { href: '#how-it-works', label: 'How It Works' },
              { href: '#guarantee', label: 'FixMate Escrow Guarantee' },
              { href: '#roadside', label: '🚨 24/7 Roadside SOS' },
              { href: '#providers', label: 'For Service Providers' },
              { href: '#faq', label: 'Frequently Asked Questions' },
              { href: '#contact', label: 'Support & Contact' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '8px 12px',
                  color: '#334155',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 6
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        padding: '64px 20px 72px',
        background: 'linear-gradient(180deg, #F0F6FF 0%, #FFFFFF 100%)',
        borderBottom: '1px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 380,
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Tagline Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 9999,
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 20
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#1A56DB' }}>verified_user</span>
            India&apos;s Hyperlocal On-Demand Home Repair &amp; Roadside Network
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(32px, 5.5vw, 56px)',
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            margin: '0 0 20px'
          }}>
            Fair Diagnosis. Fixed ₹50 Visit Fee.<br />
            <span style={{
              background: 'linear-gradient(135deg, #1A56DB 0%, #0284C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Zero Overcharging. Guaranteed.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: '#475569',
            maxWidth: 680,
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Connect instantly with licensed local technicians in under 15 minutes. See live GPS arrival, approve itemized quotes before any work begins, and pay securely via escrow.
          </p>

          {/* Instant Search Bar */}
          <div style={{
            maxWidth: 580,
            margin: '0 auto 28px',
            background: '#FFFFFF',
            border: '2px solid #3B82F6',
            borderRadius: 16,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 12px 30px rgba(26, 86, 219, 0.12)'
          }}>
            <span className="material-symbols-outlined" style={{ color: '#1A56DB', fontSize: 24, marginLeft: 4 }}>search</span>
            <input
              type="text"
              placeholder="Search AC repair, plumber, puncture, washing machine..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 15,
                color: '#0F172A',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={() => launchApp('/items/electronics')}
              style={{
                background: 'var(--blue, #1A56DB)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Find Pro
            </button>
          </div>

          {/* Quick Pill Suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
            <span style={{ fontSize: 13, color: '#64748B', alignSelf: 'center', marginRight: 4 }}>Popular:</span>
            {['AC Service', 'Plumber', 'Electrician', 'Roadside Tow', 'Bike Breakdown', 'Washing Machine'].map((tag, i) => (
              <span
                key={i}
                onClick={() => { setSearchQuery(tag); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 9999,
                  background: '#F1F5F9',
                  color: '#334155',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <button
              onClick={() => launchApp()}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: 'var(--blue, #1A56DB)',
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 6px 20px rgba(26, 86, 219, 0.3)'
              }}
            >
              <span>Book a Specialist</span>
              <span className="material-symbols-outlined">bolt</span>
            </button>

            <a
              href="#roadside"
              style={{
                padding: '14px 24px',
                borderRadius: 12,
                background: '#FEF2F2',
                border: '1.5px solid #FECACA',
                color: '#DC2626',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>car_crash</span>
              <span>24/7 Roadside SOS</span>
            </a>
          </div>

          {/* Live Trust Metrics Ticker */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 16,
            marginTop: 54,
            padding: '20px 24px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 18,
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
          }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1A56DB' }}>18,500+</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginTop: 2 }}>Repairs Completed</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#059669' }}>14 mins</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginTop: 2 }}>Average Tech ETA</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#D97706' }}>₹50 Flat</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginTop: 2 }}>Fixed Doorstep Inspection</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1A56DB' }}>4.9 / 5.0</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginTop: 2 }}>Verified Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Section ───────────────────────────────────── */}
      <section id="services" style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            color: '#1A56DB',
            fontSize: 13,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            Full-Spectrum Services
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#0F172A', margin: '8px 0 12px' }}>
            What Can We Fix For You Today?
          </h2>
          <p style={{ color: '#64748B', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
            Certified technicians equipped with genuine replacement parts and calibrated diagnostic tools.
          </p>

          {/* Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 18px',
                borderRadius: 9999,
                border: 'none',
                background: activeTab === 'all' ? '#1A56DB' : '#F1F5F9',
                color: activeTab === 'all' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              All Categories
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 9999,
                  border: 'none',
                  background: activeTab === c.id ? '#1A56DB' : '#F1F5F9',
                  color: activeTab === c.id ? '#FFFFFF' : '#475569',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24
        }}>
          {filteredCategories
            .filter(c => activeTab === 'all' || c.id === activeTab)
            .map(c => (
              <div
                key={c.id}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 18,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: '#EFF6FF',
                    color: '#1A56DB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>{c.icon}</span>
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>{c.name}</h3>
                  <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>{c.desc}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {c.items.map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          color: '#334155',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        {item.n}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Doorstep Visit</span>
                    <strong style={{ fontSize: 16, color: '#1A56DB' }}>₹50 Flat</strong>
                  </div>
                  <button
                    onClick={() => launchApp(`/items/${c.id}`)}
                    style={{
                      background: '#1A56DB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Book Now</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ── Comparison Table: FixMate vs Legacy ─────────────────── */}
      <section style={{
        padding: '72px 20px',
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: '#1A56DB', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              The FixMate Advantage
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, margin: '8px 0 12px' }}>
              Why Homeowners Switch to FixMate
            </h2>
            <p style={{ color: '#64748B', fontSize: 15, maxWidth: 540, margin: '0 auto' }}>
              Traditional repair services thrive on diagnostic ambiguity and surprise bills. Here is how FixMate rewrites the rulebook.
            </p>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1.5px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr',
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '16px 20px',
              fontWeight: 700,
              fontSize: 14
            }}>
              <div>Standard Feature</div>
              <div style={{ color: '#60A5FA' }}>FixMate Network</div>
              <div style={{ color: '#94A3B8' }}>Traditional Contractors</div>
            </div>

            {[
              { f: 'Doorstep Inspection Fee', fix: 'Fixed ₹50 Transparent', trad: '₹250 - ₹500 Arbitrary' },
              { f: 'Physical Photo Diagnosis', fix: 'Mandatory on-app evidence', trad: 'Verbal claim only' },
              { f: 'Quote Approval Workflow', fix: 'Itemized digital approval', trad: 'Surprise final bill' },
              { f: 'Unforeseen Change Orders', fix: 'Requires 1-tap customer approval', trad: 'Added without consent' },
              { f: 'Dispatched Technician', fix: '100% Police & Trade Verified', trad: 'Unverified subcontractors' },
              { f: 'Arrival Tracking', fix: 'Real-time GPS with exact ETA', trad: '"I will be there in 1 hour"' },
              { f: 'Warranty Guarantee', fix: '30-Day Escrow Protection', trad: 'Zero after-service recourse' },
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr',
                  padding: '14px 20px',
                  borderBottom: idx < 6 ? '1px solid #F1F5F9' : 'none',
                  fontSize: 13,
                  alignItems: 'center',
                  background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                }}
              >
                <div style={{ fontWeight: 600, color: '#0F172A' }}>{row.f}</div>
                <div style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#059669' }}>check_circle</span>
                  {row.fix}
                </div>
                <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#DC2626' }}>cancel</span>
                  {row.trad}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ───────────────────────────────── */}
      <LazySection>
        <section id="how-it-works" style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ color: '#1A56DB', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Transparent 4-Step Process
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, margin: '8px 0 12px' }}>
              How FixMate Works
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
              From distress to resolved in under an hour with complete itemized clarity.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20
          }}>
            {[
              {
                step: '01',
                title: 'Request & Match',
                desc: 'Select your damaged item or breakdown issue. Our hyperlocal engine matches the closest verified technician in 60 seconds.',
                icon: 'search'
              },
              {
                step: '02',
                title: 'Live GPS Arrival',
                desc: 'Track your technician on our interactive map with real-time ETA updates. No guessing when they will arrive.',
                icon: 'location_on'
              },
              {
                step: '03',
                title: 'Photo Diagnosis',
                desc: 'The technician arrives, inspects the problem, uploads proof photos, and prepares a digital breakdown of parts & labor.',
                icon: 'camera_alt'
              },
              {
                step: '04',
                title: 'Escrow Payment',
                desc: 'Review and approve the quote on your phone. Funds are held safely in escrow and only disbursed when you are satisfied.',
                icon: 'verified'
              },
            ].map((s, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 18,
                  padding: 24,
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: '#EFF6FF',
                    color: '#1A56DB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 26 }}>{s.icon}</span>
                  </div>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#E2E8F0' }}>{s.step}</span>
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#0F172A' }}>{s.title}</h4>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </LazySection>

      {/* ── 24/7 Roadside SOS Section ──────────────────────────── */}
      <LazySection>
        <section id="roadside" style={{
          padding: '72px 20px',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
          color: '#FFFFFF'
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 9999,
                background: 'rgba(220, 38, 38, 0.2)',
                border: '1px solid #DC2626',
                color: '#FCA5A5',
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 16
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#EF4444' }}>emergency</span>
                24/7 RAPID DISPATCH SQUAD
              </div>

              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px' }}>
                Stranded on the Road?<br />
                <span style={{ color: '#F87171' }}>Help Arrives in 15 Minutes.</span>
              </h2>

              <p style={{ fontSize: 16, color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 28px' }}>
                Flat tire, dead battery, overheating engine, or empty fuel tank? Our mobile road mechanics carry high-output jumper cables, tyre patchers, and tow-to-pump rescue assistance.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
                {[
                  { title: 'Battery Jumpstart', time: '12 min ETA', price: 'from ₹349' },
                  { title: 'Puncture & Flat Tire', time: '14 min ETA', price: 'from ₹199' },
                  { title: 'Tow to Nearest Pump', time: '18 min ETA', price: 'from ₹299' },
                  { title: 'Flatbed Towing Truck', time: '25 min ETA', price: 'from ₹899' },
                ].map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <strong style={{ fontSize: 14, display: 'block', color: '#FFFFFF' }}>{item.title}</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                      <span>{item.time}</span>
                      <span style={{ color: '#34D399', fontWeight: 600 }}>{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => launchApp('/emergency')}
                style={{
                  padding: '16px 32px',
                  borderRadius: 12,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.45)'
                }}
              >
                <span className="material-symbols-outlined">car_crash</span>
                <span>Trigger Roadside Emergency SOS</span>
              </button>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 20,
              padding: 30,
              backdropFilter: 'blur(8px)'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#FFFFFF' }}>
                Why Drivers Rely on FixMate Roadside
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { title: 'Instant Live GPS Tracking', desc: 'Watch your mechanic navigate towards your exact highway kilometer stone.' },
                  { title: 'No Toll/Surge Ambiguity', desc: 'Clear distance-based quote shown in the app before dispatch confirms.' },
                  { title: 'Night-Shift Certified Mechanics', desc: 'On patrol 24 hours a day, 7 days a week, including monsoon emergencies.' },
                  { title: 'Emergency Contact Alert', desc: 'Optionally ping your emergency contact with live tracking coordinates.' },
                ].map((pt, i) => (
                  <li key={i} style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                    </div>
                    <div>
                      <strong style={{ fontSize: 15, color: '#FFFFFF', display: 'block' }}>{pt.title}</strong>
                      <span style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{pt.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ── FixMate Escrow Guarantee ───────────────────────────── */}
      <LazySection>
        <section id="guarantee" style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#059669', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Consumer Protection
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, margin: '8px 0 12px' }}>
              The FixMate Escrow Shield
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 580, margin: '0 auto' }}>
              Your money stays in our secure digital escrow vault until you test your repaired device and sign off.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {[
              {
                icon: 'lock',
                title: 'Digital Escrow Vault',
                desc: 'Payment is pre-authorized but never released to the technician until you mark the job as verified.'
              },
              {
                icon: 'security',
                title: '30-Day Service Warranty',
                desc: 'If any repaired component fails within 30 calendar days, we dispatch a senior inspector free of charge.'
              },
              {
                icon: 'support_agent',
                title: 'Rapid Dispute Mediation',
                desc: 'Disagree on a diagnostic charge? FixMate admins review uploaded photo evidence and resolve within 2 hours.'
              },
              {
                icon: 'verified_user',
                title: 'Damage Insurance',
                desc: 'Up to ₹10,000 accidental property damage coverage during every on-premise technician service call.'
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #A7F3D0',
                  borderRadius: 18,
                  padding: 24,
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.06)'
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 26 }}>{item.icon}</span>
                </div>
                <h4 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#0F172A' }}>{item.title}</h4>
                <p style={{ fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </LazySection>

      {/* ── Partner / For Providers Section ────────────────────── */}
      <section id="providers" style={{
        padding: '72px 20px',
        background: '#EFF6FF',
        borderTop: '1px solid #DBEAFE',
        borderBottom: '1px solid #DBEAFE'
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>
          <div>
            <span style={{ color: '#1A56DB', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Partner With FixMate
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 38px)', fontWeight: 800, margin: '8px 0 16px', color: '#0F172A' }}>
              Grow Your Independent Repair Career
            </h2>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
              Are you an electrician, plumber, AC specialist, or roadside mechanic? Join 2,400+ trusted partners earning more with zero bidding credits and instant daily settlements.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {[
                'Keep 100% of your labor rates — no cutthroat commissions',
                'Instant daily UPI payouts directly to your bank account',
                'Zero lead bidding fees: jobs are matched automatically by GPS proximity',
                'Free digital diagnosis and quotation tool on your smartphone'
              ].map((pt, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1E293B', marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: '#1A56DB', fontSize: 20 }}>check_circle</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => launchApp('/signup')}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: '#1A56DB',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(26, 86, 219, 0.3)'
              }}
            >
              <span>Apply as Service Partner</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>handshake</span>
            </button>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #BFDBFE',
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 8px 24px rgba(26, 86, 219, 0.08)'
          }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>
              Partner Earnings Spotlight
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'Rakesh Sharma', trade: 'AC & Appliance Tech', jobs: '248 jobs completed', avg: '₹48,500/mo' },
                { name: 'Manoj Kumar', trade: 'Emergency Roadside Mechanic', jobs: '194 rescues', avg: '₹54,000/mo' },
                { name: 'Sunil Varma', trade: 'Licensed Electrician', jobs: '312 jobs completed', avg: '₹42,000/mo' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {p.name[0]}
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, color: '#0F172A', display: 'block' }}>{p.name}</strong>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{p.trade} · {p.jobs}</span>
                    </div>
                  </div>
                  <strong style={{ color: '#059669', fontSize: 14 }}>{p.avg}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Verified Customer Testimonials ────────────────────── */}
      <section style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ color: '#1A56DB', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Real Experiences
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, margin: '8px 0 12px' }}>
            Loved by Thousands of Homeowners
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {[
            {
              quote: 'My washing machine broke down on a Sunday morning. The FixMate technician arrived in 18 minutes at Thakur Village, showed me the exact broken belt, and charged only ₹50 inspection + ₹380 for the genuine belt.',
              name: 'Tushar Deshmukh',
              location: 'Thakur Village, Kandivali East, Mumbai',
              service: 'Washing Machine Repair',
              rating: 5
            },
            {
              quote: 'Got a clutch failure on the highway near Thakur Complex at 11 PM. Clicked Roadside SOS and a flatbed towing truck arrived in 14 minutes. Absolutely life saving app in Mumbai!',
              name: 'Vikram Mehta',
              location: 'Western Express Highway, Kandivali, Mumbai',
              service: 'Roadside Towing SOS',
              rating: 5
            },
            {
              quote: 'No arbitrary price bidding like other platforms. The technician created an itemized quote on his phone for my AC in Mahavir Nagar, and I only approved when I was convinced. Total peace of mind.',
              name: 'Pooja Iyer',
              location: 'Mahavir Nagar, Kandivali West, Mumbai',
              service: 'Inverter & Electrical Fix',
              rating: 5
            },
          ].map((t, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 18,
                padding: 24,
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: 4, color: '#F59E0B', marginBottom: 14 }}>
                  {[...Array(t.rating)].map((_, idx) => (
                    <span key={idx} className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 18px' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                  {t.name[0]}
                </div>
                <div>
                  <strong style={{ fontSize: 14, color: '#0F172A', display: 'block' }}>{t.name}</strong>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{t.location} · {t.service}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ────────────────────────────────────────── */}
      <LazySection>
        <section id="faq" style={{ padding: '72px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span style={{ color: '#1A56DB', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Got Questions?
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 36px)', fontWeight: 800, margin: '8px 0 12px' }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined" style={{
                      color: '#1A56DB',
                      transform: openFaq === i ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}>
                      expand_more
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 20px 20px', color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      {/* ── Contact Section ────────────────────────────────────── */}
      <LazySection>
        <section id="contact" style={{ padding: '80px 20px', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ color: '#1A56DB', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Support &amp; Desk
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, margin: '8px 0 12px' }}>
              We Are Always Here to Help
            </h2>
            <p style={{ color: '#64748B', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
              Have a question about a recent job, warranty claim, or enterprise service? Send us a message.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 20,
            padding: '36px 30px',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)'
          }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>Get in Touch</h3>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, margin: '0 0 24px' }}>
                Our customer care center is active 24/7 for emergency roadside inquiries and active service disputes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 14, display: 'block' }}>Emergency Helpline</strong>
                    <span style={{ fontSize: 13, color: '#64748B' }}>1800-FIX-MATE (Toll Free)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 14, display: 'block' }}>Email Support</strong>
                    <span style={{ fontSize: 13, color: '#64748B' }}>support@fixmate.app</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: 14, display: 'block' }}>Response Time SLA</strong>
                    <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>Under 30 Minutes</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={contactForm.email}
                  onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Message</label>
                <textarea
                  placeholder="How can we assist you?"
                  rows={3}
                  value={contactForm.message}
                  onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '13px 20px',
                  borderRadius: 10,
                  background: '#1A56DB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6
                }}
              >
                <span>Submit Message</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
              </button>
            </form>
          </div>
        </section>
      </LazySection>

      {/* ── Modern Corporate Footer ────────────────────────────── */}
      <footer style={{
        background: '#0B1528',
        color: '#FFFFFF',
        padding: '64px 20px 32px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40,
          marginBottom: 48
        }}>
          <div>
            <img
              src="/fixmate-logo.webp"
              alt="FixMate"
              style={{ height: 38, width: 'auto', objectFit: 'contain', marginBottom: 16 }}
            />
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, maxWidth: 280, margin: '0 0 16px' }}>
              India&apos;s open, hyperlocal marketplace for home repairs and 24/7 roadside assistance. Fair diagnosis, fixed ₹50 visit fee, and escrow security.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 12, color: '#60A5FA', fontWeight: 600 }}>Verified ISO 9001:2015</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Services</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94A3B8' }}>
              <span onClick={() => launchApp('/items/electronics')} style={{ cursor: 'pointer' }}>AC Service &amp; Repair</span>
              <span onClick={() => launchApp('/items/plumbing')} style={{ cursor: 'pointer' }}>Plumbing Solutions</span>
              <span onClick={() => launchApp('/items/electrical')} style={{ cursor: 'pointer' }}>Electrician on Demand</span>
              <span onClick={() => launchApp('/emergency')} style={{ cursor: 'pointer', color: '#F87171' }}>24/7 Roadside SOS</span>
              <span onClick={() => launchApp('/items/appliances')} style={{ cursor: 'pointer' }}>Washing Machine &amp; Fridge</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94A3B8' }}>
              <a href="#how-it-works" style={{ color: 'inherit' }}>How It Works</a>
              <a href="#guarantee" style={{ color: 'inherit' }}>Escrow Guarantee</a>
              <a href="#providers" style={{ color: 'inherit' }}>Join as Partner</a>
              <a href="#faq" style={{ color: 'inherit' }}>FAQ</a>
              <a href="#contact" style={{ color: 'inherit' }}>Contact Helpdesk</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Launch App</h4>
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, margin: '0 0 14px' }}>
              Experience the mobile web app with instant booking &amp; live GPS tracking.
            </p>
            <button
              onClick={() => launchApp()}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: 10,
                background: '#1A56DB',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <span>Open FixMate App</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>smartphone</span>
            </button>
          </div>
        </div>

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          paddingTop: 24,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#64748B',
          gap: 12
        }}>
          <div>&copy; {new Date().getFullYear()} FixMate Technologies Inc. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Escrow Guidelines</span>
            <span>Trust &amp; Safety</span>
          </div>
        </div>
      </footer>

      {/* Media query styling for header responsive navbar */}
      <style>{`
        @media (min-width: 860px) {
          .web-desktop-nav {
            display: flex !important;
          }
          .web-mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
