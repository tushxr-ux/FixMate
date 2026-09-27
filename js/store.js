/* FixMate — Data Store + Persistence Layer
   All data operations go through this module.
   Persists to localStorage. No external backend required for demo.
   ─────────────────────────────────────────────────────────────── */

const Config = {
  appName: 'FixMate',
  version: '1.0.0',
  env: 'development',
  visitingFee: 50,
  maxRevisions: 3,
  defaultRadius: 5,   // km
  storagePfx: 'fm_',  // localStorage namespace
};

const Store = (() => {
  const P = Config.storagePfx;

  /* ── Storage helpers ──────────────────────────────────────── */
  function persist(key, data) {
    try { localStorage.setItem(P + key, JSON.stringify(data)); } catch(e) {}
  }
  function recall(key, fallback) {
    try {
      const raw = localStorage.getItem(P + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  }
  function drop(key) { localStorage.removeItem(P + key); }

  /* ── Seed data ────────────────────────────────────────────── */
  const SEED_USERS = [
    { id:'u1', name:'Aditi Sharma', email:'aditi@demo.com', password:'demo',
      phone:'+91 98765 43210', role:'customer', avatar:'AS', address:'Andheri West, Mumbai' },
    { id:'u2', name:'Rakesh Kumar', email:'rakesh@demo.com', password:'demo',
      phone:'+91 99887 12345', role:'provider', avatar:'RK', address:'Andheri East, Mumbai' },
    { id:'u3', name:'Admin User', email:'admin@fixmate.com', password:'admin',
      phone:'+91 00000 00000', role:'admin', avatar:'AD', address:'FixMate HQ, Mumbai' },
  ];

  const SEED_PROVIDERS = [
    {
      id:'prov1', userId:'u2',
      name:'Rakesh Kumar Electricals', init:'RK',
      specialties:['AC & Fridge repair','General wiring','TV repair'],
      rating:4.7, totalJobs:128, distKm:1.4,
      verified:true, idVerified:true, bizVerified:true, available:true,
      lat:19.1376, lng:72.8289, categories:['electronics'],
      serviceRadius:5, cancellations:2, noShows:0,
    },
    {
      id:'prov2', userId:'p_seed2',
      name:'Suresh Auto Garage', init:'SA',
      specialties:['Roadside & towing','Two-wheeler & car','Battery & tyre'],
      rating:4.5, totalJobs:96, distKm:2.1,
      verified:true, idVerified:true, bizVerified:false, available:true,
      lat:19.1356, lng:72.8305, categories:['mechanic','roadside'],
      serviceRadius:8, cancellations:4, noShows:1,
    },
    {
      id:'prov3', userId:'p_seed3',
      name:'Iqbal Plumbing Works', init:'IP',
      specialties:['Leak & fittings','Blockage clearing'],
      rating:4.8, totalJobs:74, distKm:0.9,
      verified:false, idVerified:true, bizVerified:false, available:true,
      lat:19.1390, lng:72.8275, categories:['plumber'],
      serviceRadius:3, cancellations:0, noShows:0,
    },
    {
      id:'prov4', userId:'p_seed4',
      name:'Meena Appliance Care', init:'MA',
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
      parts:[{name:'Drive belt', cost:200}], labour:200, addOns:[], total:450,
      date:'12 Sep 2026', rating:5,
      diagnosis:'Drive belt was worn out — replaced with OEM part.',
      diagnosisNotes:'Drum not rotating; belt snapped.', evidence:[],
      revisions:[], quoteAccepted:true,
    },
    {
      id:'job2', customerId:'u1', providerId:'prov2',
      category:'mechanic', item:'Bike', issue:'Battery dead',
      status:'completed', visitingFee:50,
      parts:[], labour:200, addOns:[], total:250,
      date:'02 Sep 2026', rating:4,
      diagnosis:'Battery fully discharged — jumpstarted and tested.', diagnosisNotes:'', evidence:[],
      revisions:[], quoteAccepted:true,
    },
    {
      id:'job3', customerId:'u1', providerId:'prov3',
      category:'plumber', item:'Kitchen tap', issue:'Dripping leak',
      status:'completed', visitingFee:50,
      parts:[{name:'Washer', cost:30}], labour:220, addOns:[], total:300,
      date:'27 Aug 2026', rating:5,
      diagnosis:'Worn washer replaced. Tap sealed.', diagnosisNotes:'', evidence:[],
      revisions:[], quoteAccepted:true,
    },
    {
      id:'job4', customerId:'u1', providerId:'prov4',
      category:'electronics', item:'Microwave', issue:'Not heating',
      status:'cancelled_by_customer', visitingFee:100,
      parts:[], labour:0, addOns:[], total:100,
      date:'14 Aug 2026', rating:0,
      diagnosis:'Magnetron replacement quoted — customer declined.',
      diagnosisNotes:'', evidence:[], revisions:[], quoteAccepted:false,
    },
  ];

  /* ── Initialise (seed once) ───────────────────────────────── */
  function init() {
    if (!recall('seeded', false)) {
      persist('users', SEED_USERS);
      persist('providers', SEED_PROVIDERS);
      persist('jobs', SEED_JOBS);
      persist('seeded', true);
    }
  }

  /* ── Auth ─────────────────────────────────────────────────── */
  function login(email, password) {
    const users = recall('users', []);
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );
    if (!user) return null;
    persist('session', { userId: user.id, role: user.role });
    return user;
  }

  function logout() {
    drop('session');
  }

  function currentUser() {
    const session = recall('session', null);
    if (!session) return null;
    return recall('users', []).find(u => u.id === session.userId) || null;
  }

  function signup(data) {
    const users = recall('users', []);
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase()))
      return { error: 'This email is already registered. Please log in.' };

    const initials = (data.name || '?').split(' ')
      .map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const user = {
      id: 'u' + Date.now(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      phone: (data.phone || '').trim(),
      role: data.role || 'customer',
      avatar: initials,
      address: '',
    };
    users.push(user);
    persist('users', users);

    if (user.role === 'provider') {
      const providers = recall('providers', []);
      providers.push({
        id: 'prov' + Date.now(),
        userId: user.id,
        name: (data.businessName || data.name).trim(),
        init: initials,
        specialties: [],
        rating: 0, totalJobs: 0, distKm: 0,
        verified: false, idVerified: false, bizVerified: false, available: false,
        lat: 0, lng: 0,
        categories: [],
        serviceRadius: Config.defaultRadius,
        cancellations: 0, noShows: 0,
      });
      persist('providers', providers);
    }

    persist('session', { userId: user.id, role: user.role });
    return { user };
  }

  function updateUser(updates) {
    const users = recall('users', []);
    const session = recall('session', null);
    if (!session) return;
    const idx = users.findIndex(u => u.id === session.userId);
    if (idx >= 0) { users[idx] = { ...users[idx], ...updates }; persist('users', users); }
  }

  /* ── Jobs ─────────────────────────────────────────────────── */
  function getJobs(filter = {}) {
    let jobs = recall('jobs', []);
    if (filter.customerId) jobs = jobs.filter(j => j.customerId === filter.customerId);
    if (filter.providerId) jobs = jobs.filter(j => j.providerId === filter.providerId);
    if (filter.status)     jobs = jobs.filter(j => j.status === filter.status);
    return jobs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  function getJob(id) {
    return recall('jobs', []).find(j => j.id === id) || null;
  }

  function saveJob(job) {
    const jobs = recall('jobs', []);
    const idx = jobs.findIndex(j => j.id === job.id);
    if (idx >= 0) jobs[idx] = job; else jobs.unshift(job);
    persist('jobs', jobs);
    return job;
  }

  function createJob(data) {
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
      status: 'pending',                   // pending → matched → in_progress → completed
      visitingFee: Config.visitingFee,
      parts: [],
      labour: 0,
      addOns: [],
      total: Config.visitingFee,
      date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
      rating: 0,
      diagnosis: '',
      diagnosisNotes: '',
      evidence: [],
      revisions: [],
      location: data.location || null,
      quoteAccepted: false,
      createdAt: Date.now(),
    };
    return saveJob(job);
  }

  /* ── Providers ────────────────────────────────────────────── */
  function getProviders(filter = {}) {
    let provs = recall('providers', []);
    if (filter.category)
      provs = provs.filter(p => p.categories.includes(filter.category));
    if (filter.available)
      provs = provs.filter(p => p.available);
    return provs.sort((a, b) => a.distKm - b.distKm);
  }

  function getProvider(id) {
    return recall('providers', []).find(p => p.id === id) || null;
  }

  function getProviderByUser(userId) {
    return recall('providers', []).find(p => p.userId === userId) || null;
  }

  function saveProvider(prov) {
    const providers = recall('providers', []);
    const idx = providers.findIndex(p => p.id === prov.id);
    if (idx >= 0) providers[idx] = prov; else providers.push(prov);
    persist('providers', providers);
    return prov;
  }

  /* ── Notifications ────────────────────────────────────────── */
  function getNotifs(userId) {
    return recall('notifs_' + userId, []);
  }
  function addNotif(userId, notif) {
    const ns = recall('notifs_' + userId, []);
    ns.unshift({ id:'n'+Date.now(), read:false, at:Date.now(), ...notif });
    persist('notifs_' + userId, ns);
  }
  function markNotifsRead(userId) {
    const ns = recall('notifs_' + userId, []);
    persist('notifs_' + userId, ns.map(n => ({ ...n, read:true })));
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function calcJobTotal(job) {
    const parts = (job.parts||[]).reduce((s, p) => s + p.cost, 0);
    const addOns = (job.addOns||[]).reduce((s, a) => s + a.cost, 0);
    return (job.visitingFee||0) + parts + (job.labour||0) + addOns;
  }

  function formatCurrency(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  function distLabel(km) {
    return km < 1 ? (km * 1000).toFixed(0) + ' m' : km.toFixed(1) + ' km';
  }

  // Expose public API
  return {
    Config,
    init,
    login, logout, currentUser, signup, updateUser,
    getJobs, getJob, saveJob, createJob,
    getProviders, getProvider, getProviderByUser, saveProvider,
    getNotifs, addNotif, markNotifsRead,
    calcJobTotal, formatCurrency, distLabel,
  };
})();
