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

/* ── Init (seed once) ─────────────────────── */
export function initStore() {
  if (!recall('seeded_mumbai_kandivali_v3')) {
    persist('users',     SEED_USERS);
    persist('providers', SEED_PROVIDERS);
    persist('jobs',      SEED_JOBS);
    persist('seeded_mumbai_kandivali_v3', true);
  }
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

export function saveJob(job) {
  const jobs = recall('jobs', []);
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx >= 0) jobs[idx] = job; else jobs.unshift(job);
  persist('jobs', jobs);
  return job;
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
    status: 'pending',
    visitingFee: fees.default,
    parts: [], labour: 0, addOns: [],
    total: fees.default,
    date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
    rating: 0, diagnosis: '', diagnosisNotes: '', evidence: [],
    revisions: [], location: data.location || defaultLoc, quoteAccepted: false,
    createdAt: Date.now(),
  };
  return saveJob(job);
}

/* ── Providers ────────────────────────────── */
export function getProviders(filter = {}) {
  let provs = recall('providers', []);
  if (filter.category) provs = provs.filter(p => p.categories.includes(filter.category));
  if (filter.available !== undefined) provs = provs.filter(p => p.available === filter.available);
  return provs.sort((a, b) => a.distKm - b.distKm);
}

export function getProvider(id) {
  return recall('providers', []).find(p => p.id === id) || null;
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
  const parts  = (job.parts  || []).reduce((s, p) => s + p.cost, 0);
  const addOns = (job.addOns || []).reduce((s, a) => s + a.cost, 0);
  return (job.visitingFee || 0) + parts + (job.labour || 0) + addOns;
}

export function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function distLabel(km) {
  return km < 1 ? Math.round(km * 1000) + ' m away' : km.toFixed(1) + ' km away';
}

export const CATEGORIES = [
  {
    id: 'electronics', name: 'Electronics & Appliances', icon: 'tv', desc: 'TV, AC, Fridge, more',
    items: [
      { n: 'TV', i: 'tv' }, { n: 'AC', i: 'ac_unit' }, { n: 'Fridge', i: 'kitchen' },
      { n: 'Washing Machine', i: 'local_laundry_service' }, { n: 'Microwave', i: 'microwave' }, { n: 'Wiring', i: 'bolt' },
    ],
  },
  {
    id: 'mechanic', name: 'Mechanic', icon: 'two_wheeler', desc: 'Bike, car, roadside help',
    items: [
      { n: 'Bike issue', i: 'two_wheeler' }, { n: 'Car issue', i: 'directions_car' },
      { n: 'Tyre puncture', i: 'tire_repair' }, { n: 'Battery', i: 'battery_alert' },
      { n: 'Towing', i: 'local_shipping' }, { n: 'Other fault', i: 'build' },
    ],
  },
  {
    id: 'plumber', name: 'Plumber', icon: 'plumbing', desc: 'Leaks, blockages, fittings',
    items: [
      { n: 'Leak', i: 'water_drop' }, { n: 'Blockage', i: 'plumbing' },
      { n: 'Tap fitting', i: 'settings' }, { n: 'Other', i: 'build' },
    ],
  },
  {
    id: 'roadside', name: 'Roadside Assistance', icon: 'car_crash', desc: 'Breakdown, towing, emergency',
    items: [
      { n: 'Battery dead', i: 'battery_alert' }, { n: 'Tyre puncture', i: 'tire_repair' },
      { n: 'Fuel out', i: 'local_gas_station' }, { n: 'Towing', i: 'local_shipping' },
      { n: 'Engine fault', i: 'build' }, { n: 'EMERGENCY', i: 'emergency' },
    ],
  },
];
