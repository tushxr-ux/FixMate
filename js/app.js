/* FixMate — App Logic: Router, UI Utilities, Screen Renderers
   Depends on: store.js (loaded before this file)
   ─────────────────────────────────────────────────────────── */

/* ── App state ────────────────────────────────────────────────── */
const App = {
  currentScreen: null,
  data: {},            // transient per-flow data (category, item, job, provider)
  timers: [],          // cleanup handles

  /* Route → role restriction map.
     null = public (no auth required)
     'customer' | 'provider' | 'admin' | 'any' */
  ROLE_MAP: {
    splash:          null,
    login:           null,
    signup:          null,
    home:            'customer',
    items:           'customer',
    request:         'customer',
    matching:        'customer',
    provider:        'customer',
    tracking:        'customer',
    quote:           'customer',
    complete:        'customer',
    done:            'customer',
    history:         'customer',
    'job-detail':    'customer',
    profile:         'customer',
    'prov-dash':     'provider',
    'prov-job':      'provider',
    'prov-diagnose': 'provider',
    'prov-quote':    'provider',
    'admin-dash':    'admin',
  },
};

/* ── Toast ────────────────────────────────────────────────────── */
function toast(msg, type = '', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = type === 'ok' ? 'check_circle' : type === 'err' ? 'error' : type === 'warn' ? 'warning' : 'info';
  el.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">${icon}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/* ── Loading state for a button ───────────────────────────────── */
function btnLoad(btn, loading) {
  if (!btn) return;
  if (loading) { btn.classList.add('loading'); btn.disabled = true; }
  else          { btn.classList.remove('loading'); btn.disabled = false; }
}

/* ── Render empty state into an element ──────────────────────── */
function renderEmpty(el, { icon = 'inbox', title, body, btnLabel, btnAction } = {}) {
  el.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${body}</p>
      ${btnLabel ? `<button class="btn btn-primary" style="margin-top:8px;" onclick="${btnAction}">${btnLabel}</button>` : ''}
    </div>`;
}

/* ── Skeleton loader ─────────────────────────────────────────── */
function skelCard() {
  return `<div class="histrow" style="margin-bottom:10px;">
    <div class="skeleton skeleton-circle" style="width:40px;height:40px;flex-shrink:0;"></div>
    <div style="flex:1;">
      <div class="skeleton skeleton-line wide" style="margin-bottom:8px;"></div>
      <div class="skeleton skeleton-line sm"></div>
    </div>
  </div>`;
}

/* ── Router ───────────────────────────────────────────────────── */
function go(screenId, data = {}) {
  // Merge transient data
  Object.assign(App.data, data);

  // Clear pending timers from previous screen
  App.timers.forEach(clearInterval);
  App.timers = [];

  // Role check
  const required = App.ROLE_MAP[screenId];
  if (required !== null && required !== undefined) {
    const user = Store.currentUser();
    if (!user) { go('login'); return; }
    if (required !== 'any' && user.role !== required) {
      // Redirect to correct home for this role
      if (user.role === 'provider') { go('prov-dash'); return; }
      if (user.role === 'admin')    { go('admin-dash'); return; }
      go('home'); return;
    }
  }

  // Deactivate all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  const target = document.getElementById(screenId);
  if (!target) { console.error('Screen not found:', screenId); return; }
  target.classList.add('active');
  App.currentScreen = screenId;

  // Update bottom tab state
  document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('sel'));

  // Screen init hooks
  const hooks = {
    home:         renderHome,
    items:        renderItems,
    matching:     runMatching,
    provider:     renderProviderAssigned,
    tracking:     runTracking,
    complete:     renderComplete,
    history:      renderHistory,
    'job-detail': renderJobDetail,
    profile:      renderProfile,
    login:        initLogin,
    signup:       initSignup,
    'prov-dash':  renderProviderDash,
    'prov-job':   renderProviderJob,
    'prov-diagnose': renderProviderDiagnose,
    'prov-quote': renderProviderQuote,
    'admin-dash': renderAdminDash,
  };
  if (hooks[screenId]) hooks[screenId]();
}

/* ── Auth forms ───────────────────────────────────────────────── */
function initLogin() {
  // Prefill if coming from signup
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass  = document.getElementById('loginPass').value;
  const btn   = document.getElementById('loginBtn');
  const err   = document.getElementById('loginErr');

  err.textContent = '';
  if (!email || !pass) { err.textContent = 'Please enter your email and password.'; return; }
  btnLoad(btn, true);

  setTimeout(() => {
    const user = Store.login(email, pass);
    btnLoad(btn, false);
    if (!user) {
      err.textContent = 'Incorrect email or password. Try aditi@demo.com / demo';
      return;
    }
    toast('Welcome back, ' + user.name.split(' ')[0] + '!', 'ok');
    if (user.role === 'provider') { go('prov-dash'); return; }
    if (user.role === 'admin')    { go('admin-dash'); return; }
    go('home');
  }, 600);
}

function handleSignup(e) {
  if (e) e.preventDefault();
  const name  = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass  = document.getElementById('signupPass').value;
  const role  = document.querySelector('.role-card.sel')?.dataset.role || 'customer';
  const btn   = document.getElementById('signupBtn');
  const err   = document.getElementById('signupErr');

  err.textContent = '';
  if (!name)  { err.textContent = 'Please enter your name.'; return; }
  if (!email) { err.textContent = 'Please enter your email.'; return; }
  if (pass.length < 4) { err.textContent = 'Password must be at least 4 characters.'; return; }

  btnLoad(btn, true);
  setTimeout(() => {
    const result = Store.signup({ name, email, password: pass, role });
    btnLoad(btn, false);
    if (result.error) { err.textContent = result.error; return; }
    toast('Account created! Welcome to FixMate.', 'ok');
    if (role === 'provider') { go('prov-dash'); return; }
    if (role === 'admin')    { go('admin-dash'); return; }
    go('home');
  }, 600);
}

function selectRole(el, role) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
}

function doLogout() {
  Store.logout();
  toast('Logged out.', '');
  go('login');
}

function initSignup() {
  // default role selection
  const customerCard = document.querySelector('.role-card[data-role="customer"]');
  if (customerCard) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('sel'));
    customerCard.classList.add('sel');
  }
}

/* ── Customer screens ─────────────────────────────────────────── */
const CATEGORIES = [
  { id:'electronics', name:'Electronics & Appliances', icon:'tv', desc:'TV, AC, Fridge, more',
    items:[{n:'TV',i:'tv'},{n:'AC',i:'ac_unit'},{n:'Fridge',i:'kitchen'},
           {n:'Washing Machine',i:'local_laundry_service'},{n:'Microwave',i:'microwave'},{n:'Wiring',i:'bolt'}] },
  { id:'mechanic', name:'Mechanic', icon:'two_wheeler', desc:'Bike, car, roadside help',
    items:[{n:'Bike issue',i:'two_wheeler'},{n:'Car issue',i:'directions_car'},
           {n:'Tyre puncture',i:'tire_repair'},{n:'Battery',i:'battery_alert'},
           {n:'Towing',i:'local_shipping'},{n:'Other fault',i:'build'}] },
  { id:'plumber', name:'Plumber', icon:'plumbing', desc:'Leaks, blockages, fittings',
    items:[{n:'Leak',i:'water_drop'},{n:'Blockage',i:'plumbing'},
           {n:'Tap fitting',i:'settings'},{n:'Other',i:'build'}] },
  { id:'roadside', name:'Roadside Assistance', icon:'car_crash', desc:'Breakdown, towing, emergency',
    items:[{n:'Battery dead',i:'battery_alert'},{n:'Tyre puncture',i:'tire_repair'},
           {n:'Fuel out',i:'local_gas_station'},{n:'Towing',i:'local_shipping'},
           {n:'Engine fault',i:'build'},{n:'Emergency',i:'emergency'}] },
];

function renderHome() {
  const user = Store.currentUser();
  const greeting = document.getElementById('homeGreeting');
  if (greeting) greeting.textContent = 'Hi ' + (user?.name?.split(' ')[0] || 'there') + ' 👋';

  const grid = document.getElementById('catgrid');
  if (grid) grid.innerHTML = CATEGORIES.map(c => `
    <div class="card" onclick="openCategory('${c.id}')">
      <div class="ic"><span class="material-symbols-outlined">${c.icon}</span></div>
      <h3>${c.name}</h3><p>${c.desc}</p>
    </div>`).join('');

  const recentEl = document.getElementById('recent');
  if (recentEl) {
    const jobs = Store.getJobs({ customerId: user?.id }).slice(0, 2);
    if (!jobs.length) {
      recentEl.innerHTML = `<div class="muted" style="text-align:center;padding:16px 0;">No recent jobs yet.</div>`;
    } else {
      recentEl.innerHTML = jobs.map(j => {
        const prov = Store.getProvider(j.providerId);
        const statusBadge = j.status === 'completed' ? 'badge-success' : 'badge-muted';
        const statusLabel = j.status === 'completed' ? 'Completed' : j.status.replace(/_/g,' ');
        return `
          <div class="histrow" onclick="go('job-detail',{jobId:'${j.id}'})">
            <div class="avatar"><span class="material-symbols-outlined">build</span></div>
            <div class="t"><b>${prov?.name||'Provider'}</b><span>${j.item} · ${j.date}</span></div>
            <span class="badge ${statusBadge}">${statusLabel}</span>
          </div>`;
      }).join('');
    }
  }

  // Tab highlight
  const homeTab = document.getElementById('tabHome');
  if (homeTab) homeTab.classList.add('sel');
}

function openCategory(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  if (!cat) return;
  // Roadside → check for emergency first (Phase 8 will build this out fully)
  App.data.category = cat;
  go('items');
}

function renderItems() {
  const cat = App.data.category;
  if (!cat) { go('home'); return; }
  document.getElementById('itemsTitle').textContent = cat.name;
  document.getElementById('itemgrid').innerHTML = cat.items.map(it => `
    <div class="itemcard" onclick="selectItem('${it.n}')">
      <span class="material-symbols-outlined">${it.i}</span><p>${it.n}</p>
    </div>`).join('');
}

function selectItem(name) {
  App.data.item = name;
  document.getElementById('reqItemName').textContent = name.toLowerCase();
  go('request');
}

function setMode(m) {
  document.getElementById('modeImmediate').classList.toggle('sel', m === 'immediate');
  document.getElementById('modeScheduled').classList.toggle('sel', m === 'scheduled');
  document.getElementById('schedBox').style.display = m === 'scheduled' ? 'block' : 'none';
  App.data.mode = m;
  document.getElementById('modeNote').textContent = m === 'immediate'
    ? 'A ₹50 visiting fee applies once a provider is dispatched. No charge until then.'
    : 'A ₹100 hold is placed on your wallet as a commitment — refunded if provider doesn\'t show. (Illustrative)';
}

function submitRequest() {
  const desc = document.getElementById('reqDesc').value.trim();
  if (!desc) { toast('Please describe the issue.', 'warn'); return; }
  App.data.issue = desc;
  App.data.mode  = App.data.mode || 'immediate';

  // Create the job record
  const job = Store.createJob({
    category: App.data.category?.id,
    item: App.data.item,
    issue: desc,
    mode: App.data.mode,
    scheduledTime: document.getElementById('schedTime')?.value || null,
  });
  App.data.job = job;
  go('matching');
}

function runMatching() {
  const cat  = App.data.category;
  const line = document.getElementById('matchLine');
  if (line) line.textContent = `Looking for nearby ${(cat?.name||'provider').toLowerCase()} specialists...`;

  const t = setTimeout(() => {
    if (document.getElementById('matching').classList.contains('active')) {
      // Pick the best available provider for this category
      const provs = Store.getProviders({ category: cat?.id });
      const prov = provs.find(p => p.available) || provs[0];
      App.data.provider = prov;

      // Update job with provider
      if (App.data.job && prov) {
        const job = Store.getJob(App.data.job.id);
        if (job) { job.providerId = prov.id; job.status = 'matched'; Store.saveJob(job); App.data.job = job; }
      }
      go('provider');
    }
  }, 1800);
  App.timers.push(t);
}

function provCardHTML(p) {
  if (!p) return '<p>No provider found.</p>';
  const dist = Store.distLabel(p.distKm);
  const verified = p.verified ? `<span class="tag verified">✓ FixMate Verified</span>` : '';
  return `
    <div class="provtop">
      <div class="avatar avatar-lg">${p.init}</div>
      <div>
        <h3>${p.name}</h3>
        <span>${p.rating} ★ (${p.totalJobs} jobs) · ${dist} away</span>
      </div>
    </div>
    <div class="tags">
      ${verified}
      ${(p.specialties||[]).map(s => `<span class="tag">${s}</span>`).join('')}
    </div>`;
}

function renderProviderAssigned() {
  const p = App.data.provider;
  document.getElementById('provCardBody').innerHTML = provCardHTML(p);
}

let trackInterval = null;
function runTracking() {
  const p = App.data.provider;
  document.getElementById('trackCardBody').innerHTML = provCardHTML(p);
  const btn = document.getElementById('arriveBtn');
  btn.disabled = true;
  btn.textContent = 'Waiting for provider to arrive...';

  // SVG fake path for Phase 1 — real Leaflet map comes in Phase 2
  const pts = [{x:40,y:40},{x:140,y:90},{x:110,y:200},{x:200,y:240},{x:170,y:255}];
  const marker = document.getElementById('provMarker');
  let eta = 6; document.getElementById('etaVal').textContent = eta;
  let step = 0;

  const t1 = setInterval(() => {
    step++;
    if (step >= pts.length) {
      clearInterval(t1);
      document.getElementById('etaVal').textContent = 0;
      btn.disabled = false;
      btn.textContent = 'Provider has arrived — continue';
      return;
    }
    if (marker) marker.setAttribute('transform', `translate(${pts[step].x},${pts[step].y})`);
  }, 1300);

  const t2 = setInterval(() => {
    if (eta > 0) { eta--; document.getElementById('etaVal').textContent = eta; }
  }, 1300);

  App.timers.push(t1, t2);
}

let quoteState = { accepted: false };
function goToQuote() {
  quoteState.accepted = false;
  // Set quote data from job
  const job = App.data.job || {};
  const visitFee = job.visitingFee || 50;
  document.getElementById('qVisitFee').textContent = '₹' + visitFee;
  document.getElementById('totalAmt').textContent = '₹' + (visitFee + 750);
  document.getElementById('revBanner').classList.remove('show');
  document.getElementById('revLine').style.display = 'none';
  document.getElementById('quoteBtn').textContent = 'Accept & continue repair';
  go('quote');
}

function acceptQuote() {
  if (!quoteState.accepted) {
    quoteState.accepted = true;
    document.getElementById('revBanner').classList.add('show');
    document.getElementById('revLine').style.display = 'flex';
    document.getElementById('totalAmt').textContent = '₹1,100';
    document.getElementById('quoteBtn').textContent = 'Accept revised total & continue';
  } else {
    // Update job in store
    const job = Store.getJob(App.data.job?.id);
    if (job) {
      job.status = 'in_progress';
      job.visitingFee = 50;
      job.parts = [{name:'AC gas top-up', cost:750}];
      job.addOns = [{name:'Capacitor replacement', cost:300}];
      job.labour = 0;
      job.total = Store.calcJobTotal(job);
      job.quoteAccepted = true;
      Store.saveJob(job);
      App.data.job = job;
    }
    go('complete');
  }
}

function rejectQuote() {
  toast('Quote declined. You will only pay the ₹50 visiting fee.', 'warn');
  const job = Store.getJob(App.data.job?.id);
  if (job) { job.status = 'quote_rejected'; Store.saveJob(job); }
  go('done');
}

function renderComplete() {
  renderStars();
}

let chosenRating = 5;
function renderStars() {
  const wrap = document.getElementById('stars');
  if (!wrap) return;
  wrap.innerHTML = [1,2,3,4,5].map(n =>
    `<span class="material-symbols-outlined" data-n="${n}" onclick="setStar(${n})">star</span>`).join('');
  setStar(5);
}
function setStar(n) {
  chosenRating = n;
  document.querySelectorAll('#stars span').forEach(s =>
    s.classList.toggle('on', +s.dataset.n <= n));
}

function doPay() {
  const job = Store.getJob(App.data.job?.id);
  if (job) { job.status = 'completed'; job.rating = chosenRating; Store.saveJob(job); }
  toast('Payment successful! Invoice saved.', 'ok');
  go('done');
}

function renderHistory() {
  const user = Store.currentUser();
  const el   = document.getElementById('historyFull');
  if (!el) return;

  const jobs = Store.getJobs({ customerId: user?.id });
  if (!jobs.length) {
    renderEmpty(el, {
      icon: '🛠️',
      title: 'No service history yet',
      body: 'Book your first repair and it will appear here.',
      btnLabel: 'Book a repair',
      btnAction: "go('home')",
    });
    return;
  }

  el.innerHTML = jobs.map(j => {
    const prov = Store.getProvider(j.providerId);
    const statusBadge = j.status === 'completed' ? 'badge-success' :
                        j.status === 'cancelled_by_customer' ? 'badge-muted' : 'badge-info';
    const statusLabel = j.status === 'completed' ? 'Completed' :
                        j.status === 'cancelled_by_customer' ? 'Visiting fee only' :
                        j.status.replace(/_/g,' ');
    return `
      <div class="histrow" onclick="go('job-detail',{jobId:'${j.id}'})">
        <div class="avatar"><span class="material-symbols-outlined">build</span></div>
        <div class="t">
          <b>${prov?.name || 'Provider'}</b>
          <span>${j.item} · ${j.date} · ${Store.formatCurrency(j.total)}</span>
        </div>
        <span class="badge ${statusBadge}">${statusLabel}</span>
      </div>`;
  }).join('');

  const tabHist = document.getElementById('tabHistory');
  if (tabHist) tabHist.classList.add('sel');
}

function renderJobDetail() {
  const jobId = App.data.jobId;
  const job   = Store.getJob(jobId);
  const el    = document.getElementById('jobDetailBody');
  if (!el) return;
  if (!job) { el.innerHTML = '<p class="muted">Job not found.</p>'; return; }

  const prov = Store.getProvider(job.providerId);
  const parts = (job.parts||[]).map(p =>
    `<div class="lineitem"><div class="l"><b>${p.name}</b><span>Parts</span></div><div class="r">${Store.formatCurrency(p.cost)}</div></div>`).join('');
  const addOns = (job.addOns||[]).map(a =>
    `<div class="lineitem"><div class="l"><b>${a.name}</b><span>Add-on</span></div><div class="r">${Store.formatCurrency(a.cost)}</div></div>`).join('');

  el.innerHTML = `
    <div class="provcard">
      <div class="provtop">
        <div class="avatar">${prov?.init||'?'}</div>
        <div><h3>${prov?.name||'Provider'}</h3><span>${job.date}</span></div>
      </div>
      ${prov?.verified ? '<div class="tags"><span class="tag verified">✓ FixMate Verified</span></div>' : ''}
    </div>

    ${job.diagnosis ? `
    <p class="section-title">Diagnosis</p>
    <div class="banner show">${job.diagnosis}</div>` : ''}

    <p class="section-title">Quote breakdown</p>
    <div class="provcard" style="padding:0;">
      <div style="padding:0 16px;">
        <div class="lineitem"><div class="l"><b>Visiting fee</b><span>Diagnosis on arrival</span></div><div class="r">${Store.formatCurrency(job.visitingFee||50)}</div></div>
        ${parts}
        ${job.labour ? `<div class="lineitem"><div class="l"><b>Labour</b></div><div class="r">${Store.formatCurrency(job.labour)}</div></div>` : ''}
        ${addOns}
      </div>
      <div style="padding:0 16px 16px;"><div class="totalrow"><span>Total ${job.status==='completed'?'paid':'amount'}</span><span>${Store.formatCurrency(job.total)}</span></div></div>
    </div>

    ${job.rating ? `<p class="section-title">Your rating</p>
    <div style="display:flex;gap:4px;margin-bottom:16px;">
      ${[1,2,3,4,5].map(n=>`<span class="material-symbols-outlined ${n<=job.rating?'on':''}" style="color:${n<=job.rating?'#f59e0b':'var(--outline)'};font-size:24px;font-variation-settings:'FILL' ${n<=job.rating?1:0};">star</span>`).join('')}
    </div>` : ''}

    <div class="stack">
      <button class="btn btn-primary" onclick="openCategory('${job.category||'electronics'}')">Book Again</button>
      <button class="btn btn-outline" onclick="toast('Complaint submitted. Our team will review within 24h.','ok')">Report a Problem</button>
    </div>`;
}

function renderProfile() {
  const user = Store.currentUser();
  if (!user) { go('login'); return; }
  const el = document.getElementById('profileBody');
  if (!el) return;

  const jobs = Store.getJobs({ customerId: user.id });
  const completed = jobs.filter(j => j.status === 'completed').length;

  el.innerHTML = `
    <div class="provcard">
      <div class="provtop">
        <div class="avatar avatar-lg">${user.avatar}</div>
        <div><h3>${user.name}</h3><span>${user.phone || 'No phone set'} · ${user.address || 'Address not set'}</span></div>
      </div>
    </div>

    <p class="section-title">Activity</p>
    <div class="stat-row" style="grid-template-columns:1fr 1fr;margin-bottom:20px;">
      <div class="stat-card"><div class="val">${jobs.length}</div><div class="lbl">Total jobs</div></div>
      <div class="stat-card"><div class="val">${completed}</div><div class="lbl">Completed</div></div>
    </div>

    <p class="section-title">Wallet</p>
    <div class="histrow" style="margin-bottom:20px;">
      <div class="avatar"><span class="material-symbols-outlined">account_balance_wallet</span></div>
      <div class="t"><b>Wallet balance</b><span>₹0 held · refundable booking hold shows here (Illustrative)</span></div>
    </div>

    <button class="btn btn-outline" onclick="doLogout()" style="margin-top:8px;">
      <span class="material-symbols-outlined">logout</span> Log out
    </button>`;

  const tabProf = document.getElementById('tabProfile');
  if (tabProf) tabProf.classList.add('sel');
}

/* ── Provider screens ─────────────────────────────────────────── */
function renderProviderDash() {
  const user = Store.currentUser();
  const prov = Store.getProviderByUser(user?.id);
  const el   = document.getElementById('provDashBody');
  if (!el) return;

  const myJobs   = prov ? Store.getJobs({ providerId: prov.id }) : [];
  const active   = myJobs.filter(j => j.status === 'matched' || j.status === 'in_progress');
  const done     = myJobs.filter(j => j.status === 'completed');
  const earnings = done.reduce((s, j) => s + (j.total||0), 0);

  el.innerHTML = `
    <div class="provcard">
      <div class="provtop">
        <div class="avatar avatar-lg">${prov?.init || user?.avatar || '?'}</div>
        <div>
          <h3>${prov?.name || user?.name}</h3>
          <span>${user?.email}</span>
        </div>
      </div>
      <div class="verify-strip">
        <div class="verify-chip ${prov?.idVerified?'yes':'no'}">
          <span class="material-symbols-outlined">${prov?.idVerified?'verified_user':'pending'}</span>
          ${prov?.idVerified?'ID Verified':'ID Pending'}
        </div>
        <div class="verify-chip ${prov?.bizVerified?'yes':'no'}">
          <span class="material-symbols-outlined">${prov?.bizVerified?'business_center':'pending'}</span>
          ${prov?.bizVerified?'Biz Verified':'Biz Pending'}
        </div>
        <div class="verify-chip ${prov?.verified?'yes':'no'}">
          <span class="material-symbols-outlined">${prov?.verified?'verified':'pending'}</span>
          ${prov?.verified?'FixMate Verified':'Verification Pending'}
        </div>
      </div>
    </div>

    <div class="switch-row">
      <div class="info">
        <b>Available for jobs</b>
        <span>${prov?.available ? 'You are visible to customers' : 'You are offline'}</span>
      </div>
      <label class="switch">
        <input type="checkbox" ${prov?.available?'checked':''} onchange="toggleAvailability(this)">
        <span class="slider"></span>
      </label>
    </div>

    <div class="stat-row">
      <div class="stat-card"><div class="val">${active.length}</div><div class="lbl">Active</div></div>
      <div class="stat-card"><div class="val">${done.length}</div><div class="lbl">Done</div></div>
      <div class="stat-card"><div class="val">${Store.formatCurrency(earnings)}</div><div class="lbl">Earned</div></div>
    </div>

    <p class="section-title">Active jobs</p>
    ${active.length === 0
      ? `<div class="empty-state" style="padding:24px;">
          <div class="empty-icon">📋</div>
          <h3>No active jobs</h3>
          <p>When a customer books you, the job will appear here.</p>
        </div>`
      : active.map(j => {
          const cust = Store.recall ? null : null; // will use user id
          return `
          <div class="histrow" onclick="go('prov-job',{jobId:'${j.id}'})">
            <div class="avatar"><span class="material-symbols-outlined">person</span></div>
            <div class="t"><b>${j.item} — ${j.category}</b><span>${j.issue.slice(0,60)}</span></div>
            <span class="badge badge-info">Active</span>
          </div>`;
        }).join('')
    }

    <p class="section-title" style="margin-top:16px;">Completed jobs</p>
    ${done.length === 0
      ? `<p class="muted" style="text-align:center;padding:12px 0;">No completed jobs yet.</p>`
      : done.slice(0,3).map(j => `
          <div class="histrow">
            <div class="avatar"><span class="material-symbols-outlined">check_circle</span></div>
            <div class="t"><b>${j.item}</b><span>${j.date} · ${Store.formatCurrency(j.total)}</span></div>
            <span class="badge badge-success">Done</span>
          </div>`).join('')
    }

    <button class="btn btn-outline" onclick="doLogout()" style="margin-top:16px;">
      <span class="material-symbols-outlined">logout</span> Log out
    </button>`;
}

function toggleAvailability(checkbox) {
  const user = Store.currentUser();
  const prov = Store.getProviderByUser(user?.id);
  if (!prov) return;
  prov.available = checkbox.checked;
  Store.saveProvider(prov);
  toast(prov.available ? 'You are now available for jobs.' : 'You are now offline.', prov.available ? 'ok' : '');
}

function renderProviderJob() {
  const job = Store.getJob(App.data.jobId);
  const el  = document.getElementById('provJobBody');
  if (!el) return;
  if (!job) { el.innerHTML = '<p class="muted">Job not found.</p>'; return; }

  el.innerHTML = `
    <div class="banner show">Customer is waiting for your arrival. Navigate to their location.</div>
    <div class="provcard">
      <p class="section-title">Job details</p>
      <div class="lineitem"><div class="l"><b>Category</b></div><div class="r">${job.category}</div></div>
      <div class="lineitem"><div class="l"><b>Item</b></div><div class="r">${job.item}</div></div>
      <div class="lineitem"><div class="l"><b>Issue</b></div><div class="r" style="max-width:55%;text-align:right;">${job.issue}</div></div>
      <div class="lineitem"><div class="l"><b>Location</b></div><div class="r">${job.location?.address||'Andheri West, Mumbai'}</div></div>
    </div>
    <div class="stack">
      <button class="btn btn-primary" onclick="go('prov-diagnose',{jobId:'${job.id}'})">
        <span class="material-symbols-outlined">medical_information</span> Start diagnosis
      </button>
      <button class="btn btn-outline" onclick="toast('Navigation opened in maps app.','')">
        <span class="material-symbols-outlined">navigation</span> Navigate to customer
      </button>
    </div>`;
}

function renderProviderDiagnose() {
  const job = Store.getJob(App.data.jobId);
  const el  = document.getElementById('provDiagnoseBody');
  if (!el) return;
  if (!job) return;

  el.innerHTML = `
    <div class="provcard">
      <b>${job.item}</b> — <span class="muted">${job.issue}</span>
    </div>
    <label>Diagnosis</label>
    <textarea id="diagText" placeholder="Describe what you found, e.g. AC gas low, filter clogged...">${job.diagnosis||''}</textarea>
    <label>Technical notes (internal)</label>
    <textarea id="diagNotes" placeholder="Internal notes, part numbers, etc.">${job.diagnosisNotes||''}</textarea>
    <button class="btn btn-primary" onclick="saveDiagnosis()">
      <span class="material-symbols-outlined">arrow_forward</span> Proceed to quote
    </button>`;
}

function saveDiagnosis() {
  const job = Store.getJob(App.data.jobId);
  if (!job) return;
  job.diagnosis = document.getElementById('diagText').value;
  job.diagnosisNotes = document.getElementById('diagNotes').value;
  Store.saveJob(job);
  go('prov-quote', { jobId: job.id });
}

function renderProviderQuote() {
  const job = Store.getJob(App.data.jobId);
  const el  = document.getElementById('provQuoteBody');
  if (!el) return;
  if (!job) return;

  const parts = (job.parts||[]);
  el.innerHTML = `
    <div class="provcard">
      <div class="lineitem"><div class="l"><b>Visiting fee</b></div><div class="r">${Store.formatCurrency(job.visitingFee||50)}</div></div>
      ${parts.map((p,i) => `
        <div class="lineitem">
          <div class="l"><b>${p.name}</b><span>Parts</span></div>
          <div class="r">${Store.formatCurrency(p.cost)}</div>
        </div>`).join('')}
      <div class="lineitem">
        <div class="l"><b>Labour</b></div>
        <div class="r"><input type="text" id="labourInput" value="${job.labour||0}" style="width:80px;margin:0;padding:6px 8px;text-align:right;"></div>
      </div>
      <div class="totalrow"><span>Estimated total</span><span id="quoteTotalDisplay">${Store.formatCurrency(Store.calcJobTotal(job))}</span></div>
    </div>

    <label>Add a part</label>
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <input type="text" id="partName" placeholder="Part name" style="flex:1;margin:0;">
      <input type="text" id="partCost" placeholder="₹" style="width:70px;margin:0;">
      <button class="btn btn-outline btn-sm" onclick="addPartLine()">Add</button>
    </div>

    <button class="btn btn-primary" onclick="submitProviderQuote()">
      <span class="material-symbols-outlined">send</span> Submit quote to customer
    </button>`;
}

function addPartLine() {
  const job = Store.getJob(App.data.jobId);
  if (!job) return;
  const name = document.getElementById('partName').value.trim();
  const cost = parseInt(document.getElementById('partCost').value) || 0;
  if (!name) { toast('Enter a part name.', 'warn'); return; }
  job.parts = [...(job.parts||[]), {name, cost}];
  Store.saveJob(job);
  renderProviderQuote();
}

function submitProviderQuote() {
  const job = Store.getJob(App.data.jobId);
  if (!job) return;
  job.labour = parseInt(document.getElementById('labourInput').value) || 0;
  job.total  = Store.calcJobTotal(job);
  job.status = 'quote_sent';
  Store.saveJob(job);
  toast('Quote sent to customer!', 'ok');
  go('prov-dash');
}

/* ── Admin screens ────────────────────────────────────────────── */
function renderAdminDash() {
  const el = document.getElementById('adminDashBody');
  if (!el) return;

  const allJobs  = Store.getJobs();
  const allProvs = Store.getProviders();
  const pending  = allProvs.filter(p => !p.verified).length;
  const active   = allJobs.filter(j => j.status === 'in_progress' || j.status === 'matched').length;
  const disputes = allJobs.filter(j => j.status === 'disputed').length;

  el.innerHTML = `
    <div class="admin-grid">
      <div class="admin-card">
        <div class="val">${allJobs.length}</div>
        <div class="lbl">Total Jobs</div>
      </div>
      <div class="admin-card">
        <div class="val" style="color:var(--warning);">${pending}</div>
        <div class="lbl">Pending Verification</div>
      </div>
      <div class="admin-card">
        <div class="val" style="color:var(--success);">${active}</div>
        <div class="lbl">Active Jobs</div>
      </div>
      <div class="admin-card">
        <div class="val" style="color:var(--error);">${disputes}</div>
        <div class="lbl">Open Disputes</div>
      </div>
    </div>

    <p class="section-title">Provider verification queue</p>
    ${allProvs.filter(p => !p.verified).length === 0
      ? `<p class="muted" style="text-align:center;padding:12px 0;">No pending verifications.</p>`
      : allProvs.filter(p => !p.verified).map(p => `
          <div class="histrow">
            <div class="avatar">${p.init}</div>
            <div class="t">
              <b>${p.name}</b>
              <span>${p.idVerified?'ID ✓':'ID ✗'} · ${p.bizVerified?'Biz ✓':'Biz ✗'} · ${p.totalJobs} jobs</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="verifyProvider('${p.id}')">Verify</button>
          </div>`).join('')
    }

    <p class="section-title" style="margin-top:16px;">Recent jobs</p>
    ${allJobs.slice(0,5).map(j => {
      const prov = Store.getProvider(j.providerId);
      return `
        <div class="histrow">
          <div class="avatar"><span class="material-symbols-outlined">work</span></div>
          <div class="t"><b>${j.item} — ${j.category}</b><span>${j.date} · ${prov?.name||'Unassigned'}</span></div>
          <span class="badge ${j.status==='completed'?'badge-success':'badge-info'}">${j.status.replace(/_/g,' ')}</span>
        </div>`;
    }).join('')}

    <button class="btn btn-outline" onclick="doLogout()" style="margin-top:16px;">
      <span class="material-symbols-outlined">logout</span> Log out
    </button>`;
}

function verifyProvider(provId) {
  const prov = Store.getProvider(provId);
  if (!prov) return;
  prov.verified = true;
  prov.bizVerified = true;
  Store.saveProvider(prov);
  toast(prov.name + ' is now FixMate Verified.', 'ok');
  renderAdminDash();
}

/* ── Splash ───────────────────────────────────────────────────── */
document.getElementById('splash')?.addEventListener('click', () => {
  const user = Store.currentUser();
  if (user) {
    if (user.role === 'provider') { go('prov-dash'); return; }
    if (user.role === 'admin')    { go('admin-dash'); return; }
    go('home');
  } else {
    go('login');
  }
});

/* ── Bootstrap ────────────────────────────────────────────────── */
Store.init();
