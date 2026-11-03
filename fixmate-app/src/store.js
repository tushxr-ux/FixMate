/* FixMate — Data Store + Persistence
   All data ops go through this module.
   Uses localStorage — no backend needed for demo.
   ─────────────────────────────────────────────── */

export const Config = {
  appName:                    'FixMate',
  version:                    '1.1.0',
  env:                        'development',
  visitingFee:                50,  // Standard default shown before decision
  visitingFeeAccept:          50,  // Standard: ₹50 when repair proceeds
  visitingFeeDecline:         100, // Standard: ₹100 if customer declines repair post-diagnosis
  towingVisitingFeeAccept:    99,  // Towing/Roadside: ₹99 when customer accepts service
  towingVisitingFeeDecline:   199, // Towing/Roadside: ₹199 if customer declines after diagnosis
  maxRevisions:               3,   // Section 5.4: capped at 3 revisions
  defaultRadius:              5,   // km
  newProviderRadius:          3,   // Section 6.2: capped visibility radius for new providers
  newProviderJobThreshold:    5,   // Section 6.2: jobs needed to graduate
  newProviderRatingThreshold: 4.0, // Section 6.2: rating needed to graduate
  disputeSuspensionThreshold: 3,   // Section 6.4: pattern threshold before suspension
  defaultCity:                'Mumbai',
  defaultArea:                'Thakur Village, Kandivali East',
  defaultCoordinates:         { lat: 19.2085, lng: 72.8735 },
  NS:                         'fm_',
};

/* ── Visiting Fee Helper (Towing: ₹99 accept / ₹199 decline) ── */
export function getVisitingFees(jobOrCategory) {
  let isTowing = false;
  if (typeof jobOrCategory === 'string') {
    isTowing = ['roadside', 'towing', 'tow'].includes(jobOrCategory.toLowerCase());
  } else if (jobOrCategory && typeof jobOrCategory === 'object') {
    const cat = (jobOrCategory.category || '').toLowerCase();
    const item = (jobOrCategory.item || '').toLowerCase();
    const issue = (jobOrCategory.issue || '').toLowerCase();
    isTowing = cat === 'roadside' || item.includes('tow') || item.includes('puncture') || item.includes('jumpstart') || item.includes('battery') || issue.includes('tow');
  }

  if (isTowing) {
    return {
      accept: Config.towingVisitingFeeAccept,   // ₹99
      decline: Config.towingVisitingFeeDecline, // ₹199
      default: Config.towingVisitingFeeAccept,  // ₹99
    };
  }

  return {
    accept: Config.visitingFeeAccept,   // ₹50
    decline: Config.visitingFeeDecline, // ₹100
    default: Config.visitingFee,        // ₹50
  };
}

/* ── localStorage helpers ─────────────────── */
const persist = (key, data) => {
  try { localStorage.setItem(Config.NS + key, JSON.stringify(data)); } catch {}
};
const recall = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(Config.NS + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
const drop = (key) => localStorage.removeItem(Config.NS + key);

/* ── Seed data (Mumbai, Kandivali & Thakur Village) ── */
const SEED_USERS = [
  {
    id: 'u1',
    name: 'Tushar Sharma',
    email: 'tushar@demo.com',
    password: 'demo',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar: 'TS',
    address: 'Flat 402, Evershine Millennium Paradise, Thakur Village, Kandivali East, Mumbai',
    wallet: { balance: 500, holds: [] },
  },
  {
    id: 'u2',
    name: 'Rakesh Kumar',
    email: 'rakesh@demo.com',
    password: 'demo',
    phone: '+91 99887 12345',
    role: 'provider',
    avatar: 'RK',
    address: 'Shop 12, Thakur Arcade, Opp. D-Mart, Thakur Village, Kandivali East, Mumbai',
    wallet: { balance: 850, holds: [] },
  },
  {
    id: 'u3',
    name: 'Admin User',
    email: 'admin@fixmate.com',
    password: 'admin',
    phone: '+91 00000 00000',
    role: 'admin',
    avatar: 'AD',
    address: 'FixMate Ops Hub, Western Edge II, Borivali-Kandivali WEH, Mumbai',
    wallet: { balance: 5000, holds: [] },
  },
  {
    id: 'u4',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@gmail.com',
    password: 'demo',
    phone: '+91 98201 55432',
    role: 'customer',
    avatar: 'RM',
    address: 'Wing C, Panchsheel Heights, Mahavir Nagar, Kandivali West, Mumbai',
    wallet: { balance: 350, holds: [] },
  },
];

const SEED_PROVIDERS = [
  {
    id: 'prov1',
    userId: 'u2',
    name: 'Rakesh Kumar Electricals & AC Care',
    init: 'RK',
    specialties: ['Inverter Split AC Servicing', 'Double Door Refrigerator Repair', 'Home Wiring & MCB Tripping', 'Smart LED TV Repair'],
    rating: 4.8,
    totalJobs: 215,
    distKm: 0.4,
    verified: true,
    idVerified: true,
    bizVerified: true,
    available: true,
    lat: 19.2094,
    lng: 72.8742,
    area: 'Thakur Village, Kandivali East',
    address: 'Shop 12, Thakur Arcade, Opp. D-Mart, Thakur Village, Kandivali East, Mumbai',
    categories: ['electronics'],
    serviceRadius: 5,
    newProvider: false,
    cancellations: 1,
    noShows: 0,
  },
  {
    id: 'prov2',
    userId: 'p_s2',
    name: 'Kandivali 24/7 Roadside SOS & Towing',
    init: 'KR',
    specialties: ['24/7 Car & Bike Flatbed Towing', 'Highway Battery Jumpstart', 'Tubeless Puncture Patching', 'Tow to Nearest Petrol Pump'],
    rating: 4.9,
    totalJobs: 412,
    distKm: 0.7,
    verified: true,
    idVerified: true,
    bizVerified: true,
    available: true,
    lat: 19.2062,
    lng: 72.8710,
    area: 'Western Express Highway, Kandivali East',
    address: 'Highway Service Bay, Near Thakur Complex Flyover, WEH, Kandivali East, Mumbai',
    categories: ['mechanic', 'roadside'],
    serviceRadius: 10,
    newProvider: false,
    cancellations: 2,
    noShows: 0,
  },
  {
    id: 'prov3',
    userId: 'p_s3',
    name: 'Iqbal Plumbing & Sanitary Works',
    init: 'IP',
    specialties: ['Concealed Pipe Leakage', 'RO & Water Filter Installation', 'Bathroom Drain Jetting', 'Mixer Tap & Flush Tank Overhaul'],
    rating: 4.8,
    totalJobs: 168,
    distKm: 0.6,
    verified: true,
    idVerified: true,
    bizVerified: false,
    available: true,
    lat: 19.2078,
    lng: 72.8722,
    area: 'Thakur Complex, Kandivali East',
    address: 'Shop 4, Gayatri Satsang Bldg, Thakur Complex, Kandivali East, Mumbai',
    categories: ['plumber'],
    serviceRadius: 4,
    newProvider: false,
    cancellations: 0,
    noShows: 0,
  },
  {
    id: 'prov4',
    userId: 'p_s4',
    name: 'Mahavir Nagar Appliance Care Centre',
    init: 'MA',
    specialties: ['Front & Top Load Washing Machine', 'Microwave Magnetron Fix', 'Refrigerator Gas Refill'],
    rating: 4.7,
    totalJobs: 134,
    distKm: 1.8,
    verified: true,
    idVerified: true,
    bizVerified: false,
    available: true,
    lat: 19.2068,
    lng: 72.8365,
    area: 'Mahavir Nagar, Kandivali West',
    address: 'Shop 7, Panchsheel Heights, Mahavir Nagar, Kandivali West, Mumbai',
    categories: ['electronics'],
    serviceRadius: 6,
    newProvider: false,
    cancellations: 1,
    noShows: 0,
  },
  {
    id: 'prov5',
    userId: 'p_s5',
    name: 'Charkop Moto Clinic & Scooter Rescue',
    init: 'CM',
    specialties: ['Scooter & Motorcycle Full Service', 'On-spot Breakdown & Towing', 'Brake Pad & Clutch Cable Replacement'],
    rating: 4.6,
    totalJobs: 92,
    distKm: 2.3,
    verified: true,
    idVerified: true,
    bizVerified: false,
    available: true,
    lat: 19.2165,
    lng: 72.8295,
    area: 'Charkop Sector 8, Kandivali West',
    address: 'Sector 8 Market, Near Charkop Police Station, Kandivali West, Mumbai',
    categories: ['mechanic', 'roadside'],
    serviceRadius: 6,
    newProvider: false,
    cancellations: 2,
    noShows: 0,
  },
  {
    id: 'prov6',
    userId: 'p_s6',
    name: 'Evershine Quick Fix Electricals (New)',
    init: 'EQ',
    specialties: ['Ceiling Fan & Exhaust Fitting', 'Smart Switchboard Wiring', 'LED Strip & Chandelier Installation'],
    rating: 4.4,
    totalJobs: 3,
    distKm: 0.3,
    verified: false,
    idVerified: true,
    bizVerified: false,
    available: true,
    lat: 19.2115,
    lng: 72.8760,
    area: 'Evershine Dream Park, Thakur Village, Kandivali East',
    address: 'Opp. Dream Park Main Gate, Thakur Village, Kandivali East, Mumbai',
    categories: ['electronics'],
    serviceRadius: 3,
    newProvider: true,
    visibilityCap: 3,
    cancellations: 0,
    noShows: 0,
  },
  {
    id: 'prov7',
    userId: 'p_s7',
    name: 'Akurli Fast Towing & Mobile Garage',
    init: 'AF',
    specialties: ['Highway Towing Assistance', 'Monsoon Waterlogged Car Rescue', 'Jumpstart & Alternator Test'],
    rating: 4.8,
    totalJobs: 280,
    distKm: 1.2,
    verified: true,
    idVerified: true,
    bizVerified: true,
    available: true,
    lat: 19.2038,
    lng: 72.8655,
    area: 'Akurli Road, Kandivali East',
    address: 'Near Growel\'s 101 Mall, Akurli Road, Kandivali East, Mumbai',
    categories: ['mechanic', 'roadside'],
    serviceRadius: 8,
    newProvider: false,
    cancellations: 1,
    noShows: 0,
  },
];

const SEED_JOBS = [
  {
    id: 'job1',
    customerId: 'u1',
    providerId: 'prov1',
    category: 'electronics',
    item: 'Inverter Split AC',
    issue: 'Cooling gas leak & filter deep clean',
    status: 'completed',
    visitingFee: 50,
    parts: [{ name: 'Eco-R32 Gas Refill', cost: 350 }, { name: 'Copper Flare Nut', cost: 50 }],
    labour: 250,
    addOns: [],
    total: 700,
    date: '24 Sep 2026',
    rating: 5,
    createdAt: 1757000000000,
    diagnosis: 'Flare nut was loose causing slow refrigerant leakage. Pressurized, tightened, and refilled R32 gas to 125 PSI.',
    diagnosisNotes: 'Indoor cooling coil washed; subcooling reading optimal.',
    evidence: [],
    revisions: [],
    quoteAccepted: true,
    location: { address: 'Flat 402, Evershine Millennium Paradise, Thakur Village, Kandivali East, Mumbai', lat: 19.2085, lng: 72.8735 },
  },
  {
    id: 'job2',
    customerId: 'u1',
    providerId: 'prov2',
    category: 'roadside',
    item: 'Car — Towing to Garage',
    issue: 'ROAD SERVICE: Clutch cable snapped near Thakur Complex Flyover, WEH highway. Flatbed tow required.',
    status: 'completed',
    visitingFee: 99, // Towing accepted: ₹99
    parts: [],
    labour: 700,
    addOns: [],
    total: 799,
    date: '18 Sep 2026',
    rating: 5,
    createdAt: 1756900000000,
    diagnosis: 'Vehicle towed securely via flatbed from Western Express Highway to Kandivali West service station.',
    diagnosisNotes: 'Safely loaded using hydraulic winch and wheel chocks.',
    evidence: [],
    revisions: [],
    quoteAccepted: true,
    location: { address: 'Western Express Highway, Near Thakur Complex, Kandivali East, Mumbai', lat: 19.2062, lng: 72.8710 },
  },
  {
    id: 'job3',
    customerId: 'u1',
    providerId: 'prov3',
    category: 'plumber',
    item: 'Kitchen Mixer Tap',
    issue: 'Severe water leakage beneath sink counter',
    status: 'completed',
    visitingFee: 50,
    parts: [{ name: 'Brass Spindle Washer', cost: 40 }, { name: 'PTFE Teflon Thread Tape', cost: 20 }],
    labour: 240,
    addOns: [],
    total: 350,
    date: '08 Sep 2026',
    rating: 5,
    createdAt: 1756800000000,
    diagnosis: 'Worn out silicone spindle washer replaced. Teflon sealed and pressure tested.',
    diagnosisNotes: 'Cleaned aerator mesh as complimentary goodwill.',
    evidence: [],
    revisions: [],
    quoteAccepted: true,
    location: { address: 'Thakur Village, Kandivali East, Mumbai', lat: 19.2090, lng: 72.8740 },
  },
  {
    id: 'job4',
    customerId: 'u1',
    providerId: 'prov2',
    category: 'roadside',
    item: 'Car — Heavy Towing',
    issue: 'Vehicle breakdown on Akurli Road',
    status: 'cancelled_by_customer',
    visitingFee: 199, // Towing declined: ₹199
    parts: [],
    labour: 0,
    addOns: [],
    total: 199,
    date: '28 Aug 2026',
    rating: 0,
    createdAt: 1756700000000,
    diagnosis: 'Customer decided to have family member assist with spare vehicle. Inspection fee applied per Section 5.3.',
    diagnosisNotes: '',
    evidence: [],
    revisions: [],
    quoteAccepted: false,
    location: { address: 'Akurli Road, Kandivali East, Mumbai', lat: 19.2038, lng: 72.8655 },
  },
];

/* ── Demo login accounts for the seeded providers ────────────
   BUG (found Nov 2026 QA): SEED_PROVIDERS prov2–prov7 were created
   with userIds (p_s2…p_s7) that had NO matching user record, so no one
   could ever log in as them. Matching auto-assigns the nearest
   available provider — prov6 for electronics, prov2 for mechanic /
   roadside, prov3 for plumbing — so every auto-matched job was assigned
   to a provider account that cannot log in, and the only loginnable
   provider (Rakesh, prov1) never saw the job on his Dashboard. That is
   why "provider accept nhi kr raha hai". These demo accounts (password
   'demo', same as the other demo logins) close that gap. Phones are
   left blank on purpose: no invented numbers — the Call button stays
   disabled for these providers until a real number is stored. */
const PROVIDER_DEMO_USERS = [
  { id: 'p_s2', name: 'Kandivali 24/7 Roadside SOS & Towing', email: 'roadside@demo.com',  password: 'demo', phone: '', role: 'provider', avatar: 'KR', address: 'Highway Service Bay, Near Thakur Complex Flyover, WEH, Kandivali East, Mumbai', wallet: { balance: 500, holds: [] } },
  { id: 'p_s3', name: 'Iqbal Plumbing & Sanitary Works',     email: 'plumbing@demo.com',  password: 'demo', phone: '', role: 'provider', avatar: 'IP', address: 'Shop 4, Gayatri Satsang Bldg, Thakur Complex, Kandivali East, Mumbai', wallet: { balance: 500, holds: [] } },
  { id: 'p_s4', name: 'Mahavir Nagar Appliance Care Centre', email: 'appliance@demo.com', password: 'demo', phone: '', role: 'provider', avatar: 'MA', address: 'Shop 7, Panchsheel Heights, Mahavir Nagar, Kandivali West, Mumbai', wallet: { balance: 500, holds: [] } },
  { id: 'p_s5', name: 'Charkop Moto Clinic & Scooter Rescue', email: 'moto@demo.com',      password: 'demo', phone: '', role: 'provider', avatar: 'CM', address: 'Sector 8 Market, Near Charkop Police Station, Kandivali West, Mumbai', wallet: { balance: 500, holds: [] } },
  { id: 'p_s6', name: 'Evershine Quick Fix Electricals (New)', email: 'evershine@demo.com', password: 'demo', phone: '', role: 'provider', avatar: 'EQ', address: 'Opp. Dream Park Main Gate, Thakur Village, Kandivali East, Mumbai', wallet: { balance: 500, holds: [] } },
  { id: 'p_s7', name: 'Akurli Fast Towing & Mobile Garage',   email: 'towing@demo.com',    password: 'demo', phone: '', role: 'provider', avatar: 'AF', address: 'Near Growel\'s 101 Mall, Akurli Road, Kandivali East, Mumbai', wallet: { balance: 500, holds: [] } },
];

/* ── Init (seed once) ─────────────────────── */
export function initStore() {
  if (!recall('seeded_mumbai_kandivali_v3')) {
    persist('users',     SEED_USERS);
    persist('providers', SEED_PROVIDERS);
    persist('jobs',      SEED_JOBS);
    persist('seeded_mumbai_kandivali_v3', true);
  }
  // Non-destructive migration: append the missing provider demo
  // accounts above to already-seeded devices. Never touches jobs,
  // providers, or existing users — only adds accounts that are absent.
  const users = recall('users', []);
  let changed = false;
  for (const pu of PROVIDER_DEMO_USERS) {
    if (!users.find(u => u.id === pu.id)) { users.push(pu); changed = true; }
  }
  if (changed) persist('users', users);
}


/* ── Auth ─────────────────────────────────── */
export function login(email, password) {
  const users = recall('users', []);
  const user = users.find(u =>
    u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!user) return null;
  persist('session', { userId: user.id, role: user.role });
  return user;
}

export function logout() { drop('session'); }

export function currentUser() {
  const s = recall('session');
  if (!s) return null;
  return recall('users', []).find(u => u.id === s.userId) || null;
}

export function signup({ name, email, password, phone = '', role = 'customer', businessName = '', specialties = [], categories = [] }) {
  const users = recall('users', []);
  if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()))
    return { error: 'This email is already registered. Please log in.' };

  const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const user = {
    id: 'u' + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone: phone.trim(),
    role,
    avatar: initials,
    address: '',
    wallet: { balance: 500, holds: [] },
  };
  users.push(user);
  persist('users', users);

  if (role === 'provider') {
    const providers = recall('providers', []);
    // §6.2: new providers get capped radius until 5 jobs & >= 4.0 rating
    providers.push({
      id: 'prov' + Date.now(), userId: user.id,
      name: businessName.trim() || name.trim(), init: initials,
      specialties, rating: 0, totalJobs: 0, distKm: 0,
      verified: false, idVerified: false, bizVerified: false, available: false,
      lat: 0, lng: 0, categories,
      serviceRadius: Config.defaultRadius,
      newProvider: true, visibilityCap: Config.newProviderRadius,
      cancellations: 0, noShows: 0,
    });
    persist('providers', providers);
  }

  persist('session', { userId: user.id, role: user.role });
  return { user };
}

export function updateUser(updates) {
  const s = recall('session');
  if (!s) return;
  const users = recall('users', []);
  const idx = users.findIndex(u => u.id === s.userId);
  if (idx >= 0) { users[idx] = { ...users[idx], ...updates }; persist('users', users); }
}

/* ── Jobs ─────────────────────────────────── */
export function getJobs(filter = {}) {
  let jobs = recall('jobs', []);
  if (filter.customerId) jobs = jobs.filter(j => j.customerId === filter.customerId);
  if (filter.providerId) jobs = jobs.filter(j => j.providerId === filter.providerId);
  if (filter.status)     jobs = jobs.filter(j => j.status === filter.status);
  return jobs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function getJob(id) {
  return recall('jobs', []).find(j => j.id === id) || null;
}

/* ── Visit OTP (in-app verification, NOT SMS) ──────────────── */
// A 4-digit code the customer shares with the provider ONLY on arrival,
// so the provider can prove they are at the right job before starting
// work (Rapido/Uber style). It lives on the job in localStorage only:
// no SMS, no telephony, no server. It is generated ONCE, at the moment
// a provider is assigned (status 'matched' + providerId), and never
// regenerated on re-render or on later saves of the same assignment —
// so ProviderAssigned and Tracking always show the same code. If the
// job is reassigned to a different provider, a fresh code is issued and
// otpVerified resets. If the provider is removed (decline), the code is
// cleared with the assignment.
export function generateVisitOtp() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

// Guarantee a visit OTP for a job that already has a provider but
// somehow has no code (e.g. a job accepted before OTP existed, or a
// save that predates the OTP branch). Idempotent: if the job already
// has a code, it is returned untouched; otherwise exactly one code is
// generated and persisted. Customer screens call this on first view so
// a matched/accepted job NEVER shows the customer an empty OTP area —
// the fallback generates the code rather than showing nothing. The
// code is still an in-app code only, never sent by SMS.
export function ensureVisitOtp(job) {
  if (!job || job.otp || !job.providerId) return job;
  if (!['matched', 'accepted', 'diagnosing', 'quote_sent', 'in_progress'].includes(job.status)) return job;
  return saveJob({ ...job, otp: generateVisitOtp(), otpVerified: false });
}

export function saveJob(job) {
  const jobs = recall('jobs', []);
  const idx = jobs.findIndex(j => j.id === job.id);
  const previous = idx >= 0 ? jobs[idx] : null;
  const next = { ...job };
  if (next.providerId && next.status === 'matched') {
    const reassigned = previous && previous.providerId && previous.providerId !== next.providerId;
    if (!next.otp || reassigned) {
      next.otp = generateVisitOtp();
      next.otpVerified = false;
    } else if (next.otpVerified === undefined) {
      next.otpVerified = previous ? !!previous.otpVerified : false;
    }
  } else if (!next.providerId) {
    delete next.otp;
    delete next.otpVerified;
  }
  if (idx >= 0) jobs[idx] = next; else jobs.unshift(next);
  persist('jobs', jobs);
  return next;
}

export function createJob(data) {
  const user = currentUser();
  if (!user) return null;
  const fees = getVisitingFees({ category: data.category, item: data.item, issue: data.issue });
  const defaultLoc = {
    address: 'Flat 402, Evershine Millennium Paradise, Thakur Village, Kandivali East, Mumbai',
    lat: 19.2085,
    lng: 72.8735,
  };
  const job = {
    id: 'job' + Date.now(),
    customerId: user.id,
    providerId: null,
    category: data.category,
    item: data.item,
    issue: data.issue || '',
    mode: data.mode || 'immediate',
    scheduledTime: data.scheduledTime || null,
    // Customer-attached issue photo: name always; preview data-URL only
    // when the Request screen stored one (<= 1 MB). No server upload.
    photoName: data.photoName || null,
    photo: data.photo || null,
    status: 'pending',
    visitingFee: fees.default,
    parts: [], labour: 0, addOns: [],
    total: fees.default,
    date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
    rating: 0, diagnosis: '', diagnosisNotes: '', evidence: [],
    revisions: [], location: data.location || defaultLoc, quoteAccepted: false,
    createdAt: Date.now(),
  };
  const saved = saveJob(job);
  // Verify the write actually landed. persist() swallows storage-quota
  // errors, so without this check a booking made when localStorage is
  // nearly full (e.g. after several photo bookings) would silently
  // vanish: Matching would then find no job and bounce the customer
  // back to /home — the "screen exits after attaching a photo" bug.
  // If the write failed, retry WITHOUT the photo preview (the filename
  // is kept) so the booking itself is never lost. If even that fails,
  // return null so the Request screen can show an honest error instead
  // of navigating to a Matching screen that will bounce home.
  if (getJob(saved.id)) return saved;
  const stripped = saveJob({ ...saved, photo: null });
  return getJob(stripped.id) ? stripped : null;
}

/* ── Providers ────────────────────────────── */
// Map new category IDs to provider capability tags
const CAT_ALIAS = {
  'tech-gadgets': 'electronics',
  'home-works':   'electronics', // closest match until home-works providers are seeded
  'electrician':  'electronics',
  'carpentry':    'electronics',
};

export function getProviders(filter = {}) {
  let provs = recall('providers', []);
  if (filter.category) {
    const cat = CAT_ALIAS[filter.category] || filter.category;
    provs = provs.filter(p => p.categories.includes(cat));
  }
  if (filter.available !== undefined) provs = provs.filter(p => p.available === filter.available);
  return provs.sort((a, b) => a.distKm - b.distKm);
}

export function getProvider(id) {
  return recall('providers', []).find(p => p.id === id) || null;
}

// Does this provider serve this job category? Uses the same alias map
// as getProviders, so 'home-works' jobs match 'electronics' providers
// and 'tech-gadgets' jobs match 'electronics' providers.
export function providerServesCategory(provider, category) {
  if (!provider || !category) return false;
  const cat = CAT_ALIAS[category] || category;
  return (provider.categories || []).includes(cat);
}

// Provider phone for the Call button: seeded provider records carry no
// phone field themselves — the number lives on their linked user record
// (provider.userId). A provider created via signup may have a phone on
// either record, so check both; return null (not a fake number) when
// neither has one, so callers can disable the button instead of
// dialling a broken link.
export function getProviderPhone(provider) {
  if (!provider) return null;
  if (provider.phone) return provider.phone;
  if (provider.userId) {
    const linked = recall('users', []).find(u => u.id === provider.userId);
    if (linked?.phone) return linked.phone;
  }
  return null;
}

export function getProviderByUser(userId) {
  return recall('providers', []).find(p => p.userId === userId) || null;
}

export function saveProvider(prov) {
  const providers = recall('providers', []);
  const idx = providers.findIndex(p => p.id === prov.id);
  if (idx >= 0) providers[idx] = prov; else providers.push(prov);
  persist('providers', providers);
  return prov;
}

/* ── Users ────────────────────────────────── */
export function getUserById(id) {
  return recall('users', []).find(u => u.id === id) || null;
}

// §6.2: Wallet hold/release for scheduled bookings (no-show protection)
export function createHold(userId, amount, jobId) {
  const users = recall('users', []);
  const idx   = users.findIndex(u => u.id === userId);
  if (idx < 0) return;
  const w = users[idx].wallet || { balance: 500, holds: [] };
  w.holds = (w.holds || []).filter(h => h.jobId !== jobId); // dedupe
  w.holds.push({ jobId, amount, at: Date.now() });
  users[idx].wallet = w;
  persist('users', users);
}

export function releaseHold(userId, jobId, toProviderId = null) {
  const users = recall('users', []);
  const idx   = users.findIndex(u => u.id === userId);
  if (idx < 0) return;
  const w    = users[idx].wallet || { balance: 500, holds: [] };
  const hold = (w.holds || []).find(h => h.jobId === jobId);
  if (hold && toProviderId) w.balance = Math.max(0, (w.balance || 0) - hold.amount);
  w.holds = (w.holds || []).filter(h => h.jobId !== jobId);
  users[idx].wallet = w;
  persist('users', users);
}

// §6.2: Check + auto-graduate new provider when threshold met
export function checkProviderGraduation(provId) {
  const provs = recall('providers', []);
  const idx   = provs.findIndex(p => p.id === provId);
  if (idx < 0) return;
  const p = provs[idx];
  if (p.newProvider && p.totalJobs >= Config.newProviderJobThreshold && p.rating >= Config.newProviderRatingThreshold) {
    provs[idx] = { ...p, newProvider: false, serviceRadius: Config.defaultRadius };
    persist('providers', provs);
  }
}

// §2.2: Persist confirmation call event to job
export function saveConfirmationCall(jobId, confirmedBy = 'provider') {
  const job = getJob(jobId);
  if (!job) return;
  saveJob({ ...job, confirmationCall: { at: Date.now(), confirmedBy } });
}

/* ── Notifications ────────────────────────── */
export function getNotifs(userId) { return recall('notifs_' + userId, []); }
export function addNotif(userId, notif) {
  const ns = recall('notifs_' + userId, []);
  ns.unshift({ id: 'n' + Date.now(), read: false, at: Date.now(), ...notif });
  persist('notifs_' + userId, ns);
}

/* ── Disputes & Complaints ────────────────── */
export function getDisputes(filter = {}) {
  let list = recall('disputes', []);
  if (filter.customerId) list = list.filter(d => d.customerId === filter.customerId);
  if (filter.providerId) list = list.filter(d => d.providerId === filter.providerId);
  if (filter.jobId)      list = list.filter(d => d.jobId === filter.jobId);
  if (filter.status)     list = list.filter(d => d.status === filter.status);
  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function getDispute(id) {
  return recall('disputes', []).find(d => d.id === id) || null;
}

export function saveDispute(dispute) {
  const list = recall('disputes', []);
  const idx = list.findIndex(d => d.id === dispute.id);
  if (idx >= 0) list[idx] = dispute; else list.unshift(dispute);
  persist('disputes', list);
  return dispute;
}

export function createDispute({ jobId, category, description, evidence = [] }) {
  const user = currentUser();
  const job = getJob(jobId);
  // §6.4: count prior disputes against this provider for suspension threshold
  const providerId = job?.providerId || null;
  const priorDisputeCount = providerId
    ? recall('disputes', []).filter(d => d.providerId === providerId && d.status !== 'under_review').length
    : 0;
  const dispute = {
    id: 'disp' + Date.now(),
    jobId,
    customerId: user?.id || job?.customerId,
    customerName: user?.name || 'Customer',
    providerId,
    priorDisputeCount,
    category, // wrong_diagnosis, unexpected_charge, damage, poor_repair, no_show, other
    description,
    evidence,
    status: 'under_review', // under_review | resolved | partial_refund | provider_warning | rejected
    resolution: null,
    createdAt: Date.now(),
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };
  if (job) saveJob({ ...job, status: 'disputed' });
  return saveDispute(dispute);
}

/* ── Helpers ──────────────────────────────── */
export function calcTotal(job) {
  // Number() guards: a string/undefined cost used to poison the whole total
  // into NaN (the quote screens already guard this way; keep it consistent).
  const parts  = (job.parts  || []).reduce((s, p) => s + (Number(p.cost) || 0), 0);
  const addOns = (job.addOns || []).reduce((s, a) => s + (Number(a.cost) || 0), 0);
  return (Number(job.visitingFee) || 0) + parts + (Number(job.labour) || 0) + addOns;
}

export function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function distLabel(km) {
  return km < 1 ? Math.round(km * 1000) + ' m away' : km.toFixed(1) + ' km away';
}

export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics, Appliances & Electrical',
    icon: 'tv',
    desc: 'TV, AC, Fridge, Wiring, Fan & more',
    items: [
      { n: 'TV',                     i: 'tv',                      k: ['television','smart tv','led tv','oled','samsung tv','lg tv','tv screen','display'] },
      { n: 'AC',                     i: 'ac_unit',                 k: ['air conditioner','split ac','window ac','inverter ac','cooling','air conditioning'] },
      { n: 'Fridge',                 i: 'kitchen',                 k: ['refrigerator','double door','single door','freezer','cooling'] },
      { n: 'Washing Machine',        i: 'local_laundry_service',   k: ['washer','dryer','front load','top load','laundry'] },
      { n: 'Microwave',              i: 'microwave',               k: ['oven','microwave oven','convection','baking'] },
      { n: 'Geyser / Water Heater',  i: 'water_heater',            k: ['geyser','water heater','hot water','boiler','instant heater'] },
      { n: 'Water Purifier',         i: 'water_drop',              k: ['ro','ro filter','water filter','ro purifier','kent','aquaguard'] },
      { n: 'Ceiling Fan',            i: 'mode_fan',                k: ['fan','ceiling fan','exhaust fan','table fan','pedestal fan'] },
      { n: 'Air Cooler',             i: 'ac_unit',                 k: ['cooler','desert cooler','room cooler','symphony'] },
      { n: 'Dishwasher',             i: 'countertops',             k: ['dish washer','dish cleaning'] },
      { n: 'CCTV / Security Camera', i: 'videocam',                k: ['cctv','security camera','ip camera','dvr','nvr','surveillance','camera installation'] },
      { n: 'Inverter / UPS',         i: 'battery_charging_full',   k: ['inverter','ups','power backup','battery backup','luminous','microtek'] },
      { n: 'Wiring & Electrical',    i: 'bolt',                    k: ['wiring','short circuit','electrical','rewiring','wire','socket','mcb','fuse','earthing','switchboard'] },
      { n: 'Switch / Socket Repair', i: 'toggle_on',               k: ['switch','socket','plug point','electrical switch','switch board'] },
      { n: 'Fan Installation',       i: 'mode_fan',                k: ['fan install','ceiling fan fitting','fan wiring'] },
      { n: 'Light / LED Fitting',    i: 'lightbulb',               k: ['light','led','bulb','tubelight','batten','downlight','spotlight','strip light','chandelier'] },
      { n: 'MCB / Fuse Box',         i: 'electrical_services',     k: ['mcb','fuse','circuit breaker','db box','distribution box','tripping'] },
      { n: 'AC Installation',        i: 'ac_unit',                 k: ['ac install','split ac installation','window ac fitting'] },
      { n: 'Doorbell / Intercom',    i: 'door_bell',               k: ['doorbell','door bell','video door phone','intercom'] },
      { n: 'Earthing / Safety Check',i: 'shield',                  k: ['earthing','grounding','electrical safety','shock','safety check'] },
    ],
  },
  {
    id: 'tech-gadgets',
    name: 'Tech & Gadgets',
    icon: 'devices',
    desc: 'Mobile, Laptop, PC, Monitor, Printer & more',
    items: [
      { n: 'Mobile Screen Repair',       i: 'smartphone',            k: ['phone screen','mobile display','cracked screen','iphone screen','samsung screen','touchscreen'] },
      { n: 'Mobile Battery Replace',     i: 'battery_saver',         k: ['phone battery','mobile battery','iphone battery','battery drain'] },
      { n: 'Mobile Charging Port',       i: 'cable',                 k: ['charging port','type c','usb port','charging problem','phone not charging'] },
      { n: 'Mobile Camera / Back Cover', i: 'camera_rear',           k: ['phone camera','rear camera','back cover','camera repair'] },
      { n: 'Mobile Speaker / Mic',       i: 'speaker',               k: ['phone speaker','earpiece','microphone','sound not working'] },
      { n: 'Mobile Software / Hang',     i: 'smartphone',            k: ['phone hang','mobile slow','software issue','phone restart','virus','data recovery'] },
      { n: 'Laptop Screen Repair',       i: 'laptop',                k: ['laptop display','broken screen','lcd repair','macbook screen'] },
      { n: 'Laptop Battery Replace',     i: 'battery_charging_full', k: ['laptop battery','battery backup','battery not charging'] },
      { n: 'Laptop Keyboard / Trackpad', i: 'keyboard',              k: ['laptop keyboard','keys not working','trackpad','touchpad'] },
      { n: 'Laptop Overheating',         i: 'thermostat',            k: ['laptop hot','fan noise','thermal paste','laptop fan','cooling issue'] },
      { n: 'Laptop Software / OS',       i: 'terminal',              k: ['windows install','format laptop','os reinstall','slow laptop','virus removal'] },
      { n: 'Laptop Motherboard',         i: 'memory',                k: ['motherboard','liquid damage','dead laptop','not turning on','logic board'] },
      { n: 'Desktop PC / CPU Repair',    i: 'computer',              k: ['cpu','desktop','computer repair','pc not starting','desktop repair','tower pc'] },
      { n: 'PC Assembly / Upgrade',      i: 'memory',                k: ['pc build','ram upgrade','ssd upgrade','gpu install','computer assembly','processor'] },
      { n: 'Monitor Repair',             i: 'monitor',               k: ['monitor screen','display not working','flickering screen','hdmi','vga','curved monitor'] },
      { n: 'Router / WiFi Issue',        i: 'wifi',                  k: ['wifi','router','internet not working','wifi setup','broadband','jio fiber','airtel fiber','slow internet'] },
      { n: 'Tablet Repair',              i: 'tablet',                k: ['ipad','android tablet','tab screen','tablet battery'] },
      { n: 'Printer Repair',             i: 'print',                 k: ['printer','printer not printing','ink','toner','cartridge','hp printer','epson','canon'] },
      { n: 'Smart Watch / Earbuds',      i: 'watch',                 k: ['smartwatch','earbuds','airpods','earphones','headphones','wearable'] },
      { n: 'Gaming Console / Setup',     i: 'sports_esports',        k: ['ps5','ps4','xbox','playstation','gaming pc','game console','controller'] },
      { n: 'Pendrive / Hard Disk',       i: 'usb',                   k: ['pendrive','hard disk','hdd','ssd','data recovery','external drive','hard drive'] },
      { n: 'DSLR / Camera Repair',       i: 'camera',                k: ['camera','dslr','mirrorless','lens','gopro','canon camera','nikon'] },
    ],
  },
  {
    id: 'mechanic',
    name: 'Mechanic',
    icon: 'two_wheeler',
    desc: 'Bike, car, tyre, battery & roadside',
    items: [
      { n: 'Bike Service',           i: 'two_wheeler',           k: ['bike','motorcycle','scooter','activa','two wheeler','bike repair'] },
      { n: 'Car Service',            i: 'directions_car',        k: ['car','four wheeler','auto','car repair','car maintenance'] },
      { n: 'Tyre Puncture',          i: 'tire_repair',           k: ['puncture','flat tyre','tyre','tire','stepney'] },
      { n: 'Tyre Replacement',       i: 'tire_repair',           k: ['new tyre','tyre change','tire replacement'] },
      { n: 'Battery Jumpstart',      i: 'battery_alert',         k: ['car battery','jumpstart','car not starting','dead battery'] },
      { n: 'Battery Replacement',    i: 'battery_charging_full', k: ['new battery','replace battery','car battery dead'] },
      { n: 'Oil Change',             i: 'oil_barrel',            k: ['engine oil','oil service','oil change','lubricant'] },
      { n: 'Brake Service',          i: 'emergency_brake',       k: ['brake','brake pad','brake fluid','disc brake','brake repair'] },
      { n: 'Towing',                 i: 'local_shipping',        k: ['tow','car towing','breakdown','flatbed'] },
      { n: 'AC Repair (Car)',         i: 'ac_unit',               k: ['car ac','auto ac','car cooling','car air conditioner'] },
      { n: 'Car Denting & Painting', i: 'format_paint',          k: ['denting','painting','scratch repair','body work','car paint'] },
      { n: 'Other Fault',            i: 'build',                 k: ['engine','clutch','gear','suspension'] },
    ],
  },
  {
    id: 'plumber',
    name: 'Plumber',
    icon: 'plumbing',
    desc: 'Leaks, blockages, fittings, tanks',
    items: [
      { n: 'Pipe Leak',              i: 'water_drop',            k: ['leak','water leak','pipe burst','seepage','dripping'] },
      { n: 'Drain Blockage',         i: 'plumbing',              k: ['drain','clog','blockage','blocked drain','drainage','choked'] },
      { n: 'Tap / Faucet Fitting',   i: 'settings',              k: ['tap','faucet','mixer','leaking tap','bathroom tap'] },
      { n: 'Toilet Repair',          i: 'wc',                    k: ['toilet','flush','commode','wc','toilet seat','cistern'] },
      { n: 'Geyser Installation',    i: 'water_heater',          k: ['geyser install','water heater fitting','instant geyser'] },
      { n: 'Water Purifier Install', i: 'water_drop',            k: ['ro install','water filter install','purifier fitting'] },
      { n: 'Tank Cleaning',          i: 'water',                 k: ['water tank','overhead tank','tank cleaning','tank wash'] },
      { n: 'Bathroom Fittings',      i: 'shower',                k: ['shower','bathroom','bathtub','basin','washbasin','toilet fitting'] },
      { n: 'Water Motor / Pump',     i: 'electrical_services',   k: ['motor','water pump','submersible pump','booster pump'] },
      { n: 'Other',                  i: 'build',                 k: ['plumbing','plumber'] },
    ],
  },
  {
    id: 'home-works',
    name: 'Home Works',
    icon: 'construction',
    desc: 'Carpenter, Painter, Tiles, Pest Control & more',
    items: [
      { n: 'Wall Painting',              i: 'format_paint',      k: ['paint','painting','wall paint','room painting','interior paint','exterior paint','colour','color','whitewash','distemper','emulsion','asian paints','berger'] },
      { n: 'Waterproofing',              i: 'water',             k: ['waterproof','seepage','damp wall','terrace waterproofing','leakage wall','moisture'] },
      { n: 'Door Repair / Hinge',        i: 'door_front',        k: ['door','hinge','door not closing','door lock','door frame','door fitting'] },
      { n: 'Furniture Assembly',         i: 'chair',             k: ['furniture','ikea assembly','wardrobe assembly','bed assembly','sofa','table assembly'] },
      { n: 'Furniture Repair',           i: 'handyman',          k: ['furniture repair','chair repair','sofa repair','polish','rexine'] },
      { n: 'Window Repair / Grills',     i: 'window',            k: ['window','glass','sliding window','grill','grills','window frame','window pane'] },
      { n: 'Lock & Key / Locksmith',     i: 'lock',              k: ['lock','key','locksmith','duplicate key','lock broken','door lock repair'] },
      { n: 'Wardrobe / Cupboard',        i: 'dresser',           k: ['wardrobe','cupboard','almirah','sliding wardrobe','storage','cabinet'] },
      { n: 'Wall Shelves / TV Unit',     i: 'shelves',           k: ['shelf','shelves','wall mount','tv mount','tv unit','tv stand','wall bracket'] },
      { n: 'False Ceiling',              i: 'roofing',           k: ['false ceiling','pop ceiling','gypsum ceiling','pop design','pvc ceiling'] },
      { n: 'Tiles / Flooring',           i: 'grid_on',           k: ['tiles','flooring','tile laying','floor tiles','bathroom tiles','vitrified','tile crack','marble','granite'] },
      { n: 'Wallpaper / Wall Design',    i: 'wallpaper',         k: ['wallpaper','wall sticker','texture paint','3d wall','wall design'] },
      { n: 'Pest Control',               i: 'bug_report',        k: ['pest','cockroach','termite','ants','rats','rodents','bed bugs','mosquito','pest control'] },
      { n: 'Home Cleaning / Sanitization',i: 'cleaning_services',k: ['cleaning','deep clean','sofa clean','carpet clean','bathroom clean','kitchen clean','sanitize','housekeeping'] },
      { n: 'Curtain / Blinds Fitting',   i: 'curtains',          k: ['curtain','blinds','roman blinds','curtain rod','curtain hanging','window blinds'] },
      { n: 'AC Installation (Home)',      i: 'ac_unit',           k: ['ac install','split ac fitting','ac stand','ac pipe'] },
      { n: 'TV / Projector Mounting',    i: 'tv',                k: ['tv wall mount','tv bracket','projector install','home theatre setup'] },
    ],
  },
  {
    id: 'roadside',
    name: 'Roadside Assistance',
    icon: 'car_crash',
    desc: 'Breakdown, towing, emergency SOS',
    items: [
      { n: 'Battery Dead / Jumpstart', i: 'battery_alert',       k: ['car battery','jumpstart','dead battery','car not starting'] },
      { n: 'Tyre Puncture',            i: 'tire_repair',         k: ['puncture','flat tyre','tire','stepney'] },
      { n: 'Fuel Out (Tow Only)',       i: 'local_gas_station',   k: ['fuel','petrol','diesel','empty tank','out of fuel','petrol pump'] },
      { n: 'Towing',                   i: 'local_shipping',      k: ['tow','breakdown','flatbed tow','car towing'] },
      { n: 'Engine Fault',             i: 'build',               k: ['engine','clutch','overheating','car breakdown'] },
      { n: 'EMERGENCY',                i: 'emergency',           k: ['sos','accident','emergency','collision','crash'] },
    ],
  },
];