/* FixMate — Data Store + Persistence
   All data ops go through this module.
   Uses localStorage — no backend needed for demo.
   ─────────────────────────────────────────────── */

export const Config = {
  appName:        'FixMate',
  version:        '1.0.0',
  env:            'development',
  visitingFee:    50,
  maxRevisions:   3,
  defaultRadius:  5,   // km
  NS:             'fm_',
};

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

/* ── Seed data ────────────────────────────── */
const SEED_USERS = [
  { id:'u1', name:'Aditi Sharma',  email:'aditi@demo.com',      password:'demo',
    phone:'+91 98765 43210', role:'customer', avatar:'AS', address:'Andheri West, Mumbai' },
  { id:'u2', name:'Rakesh Kumar',  email:'rakesh@demo.com',      password:'demo',
    phone:'+91 99887 12345', role:'provider', avatar:'RK', address:'Andheri East, Mumbai' },
  { id:'u3', name:'Admin User',    email:'admin@fixmate.com',    password:'admin',
    phone:'+91 00000 00000', role:'admin',    avatar:'AD', address:'FixMate HQ, Mumbai' },
];

const SEED_PROVIDERS = [
  {
    id:'prov1', userId:'u2', name:'Rakesh Kumar Electricals', init:'RK',
    specialties:['AC & Fridge repair','General wiring','TV repair'],
    rating:4.7, totalJobs:128, distKm:1.4,
    verified:true, idVerified:true, bizVerified:true, available:true,
    lat:19.1376, lng:72.8289, categories:['electronics'],
    serviceRadius:5, cancellations:2, noShows:0,
  },
  {
    id:'prov2', userId:'p_s2', name:'Suresh Auto Garage', init:'SA',
    specialties:['Roadside & towing','Two-wheeler & car','Battery & tyre'],
    rating:4.5, totalJobs:96, distKm:2.1,
    verified:true, idVerified:true, bizVerified:false, available:true,
    lat:19.1356, lng:72.8305, categories:['mechanic','roadside'],
    serviceRadius:8, cancellations:4, noShows:1,
  },
  {
    id:'prov3', userId:'p_s3', name:'Iqbal Plumbing Works', init:'IP',
    specialties:['Leak & fittings','Blockage clearing'],
    rating:4.8, totalJobs:74, distKm:0.9,
    verified:false, idVerified:true, bizVerified:false, available:true,
    lat:19.1390, lng:72.8275, categories:['plumber'],
    serviceRadius:3, cancellations:0, noShows:0,
  },
  {
    id:'prov4', userId:'p_s4', name:'Meena Appliance Care', init:'MA',
    specialties:['Washing machine','Microwave','Fridge repair'],
    rating:4.3, totalJobs:45, distKm:3.2,
    verified:false, idVerified:false, bizVerified:false, available:false,
    lat:19.1345, lng:72.8320, categories:['electronics'],
    serviceRadius:4, cancellations:1, noShows:0,
  },
];

const SEED_JOBS = [
  {
    id:'job1', customerId:'u1', providerId:'prov1',
    category:'electronics', item:'Washing Machine', issue:'Not spinning',
    status:'completed', visitingFee:50,
    parts:[{name:'Drive belt',cost:200}], labour:200, addOns:[], total:450,
    date:'12 Sep 2026', rating:5, createdAt:1757000000000,
    diagnosis:'Drive belt was worn out — replaced with OEM part.',
    diagnosisNotes:'Drum not rotating; belt snapped.', evidence:[], revisions:[], quoteAccepted:true,
  },
  {
    id:'job2', customerId:'u1', providerId:'prov2',
    category:'mechanic', item:'Bike', issue:'Battery dead',
    status:'completed', visitingFee:50,
    parts:[], labour:200, addOns:[], total:250,
    date:'02 Sep 2026', rating:4, createdAt:1756900000000,
    diagnosis:'Battery fully discharged — jumpstarted and tested.',
    diagnosisNotes:'', evidence:[], revisions:[], quoteAccepted:true,
  },
  {
    id:'job3', customerId:'u1', providerId:'prov3',
    category:'plumber', item:'Kitchen tap', issue:'Dripping leak',
    status:'completed', visitingFee:50,
    parts:[{name:'Washer',cost:30}], labour:220, addOns:[], total:300,
    date:'27 Aug 2026', rating:5, createdAt:1756800000000,
    diagnosis:'Worn washer replaced. Tap sealed.',
    diagnosisNotes:'', evidence:[], revisions:[], quoteAccepted:true,
  },
  {
    id:'job4', customerId:'u1', providerId:'prov4',
    category:'electronics', item:'Microwave', issue:'Not heating',
    status:'cancelled_by_customer', visitingFee:100,
    parts:[], labour:0, addOns:[], total:100,
    date:'14 Aug 2026', rating:0, createdAt:1756700000000,
    diagnosis:'Magnetron replacement quoted — customer declined.',
    diagnosisNotes:'', evidence:[], revisions:[], quoteAccepted:false,
  },
];

/* ── Init (seed once) ─────────────────────── */
export function initStore() {
  if (!recall('seeded')) {
    persist('users',     SEED_USERS);
    persist('providers', SEED_PROVIDERS);
    persist('jobs',      SEED_JOBS);
    persist('seeded',    true);
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

export function signup({ name, email, password, phone = '', role = 'customer', businessName = '' }) {
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
  };
  users.push(user);
  persist('users', users);

  if (role === 'provider') {
    const providers = recall('providers', []);
    providers.push({
      id: 'prov' + Date.now(), userId: user.id,
      name: businessName.trim() || name.trim(), init: initials,
      specialties: [], rating: 0, totalJobs: 0, distKm: 0,
      verified: false, idVerified: false, bizVerified: false, available: false,
      lat: 0, lng: 0, categories: [],
      serviceRadius: Config.defaultRadius, cancellations: 0, noShows: 0,
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
    visitingFee: Config.visitingFee,
    parts: [], labour: 0, addOns: [],
    total: Config.visitingFee,
    date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
    rating: 0, diagnosis: '', diagnosisNotes: '', evidence: [],
    revisions: [], location: data.location || null, quoteAccepted: false,
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
  const dispute = {
    id: 'disp' + Date.now(),
    jobId,
    customerId: user?.id || job?.customerId,
    customerName: user?.name || 'Customer',
    providerId: job?.providerId || null,
    category, // wrong_diagnosis, unexpected_charge, damage, poor_repair, no_show, other
    description,
    evidence,
    status: 'under_review', // under_review, resolved, rejected
    resolution: null,
    createdAt: Date.now(),
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };
  if (job) {
    saveJob({ ...job, status: 'disputed' });
  }
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
