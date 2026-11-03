# FixMate 🔧🚗

**FixMate** is an open, hyperlocal marketplace for on-demand home repair and emergency roadside assistance — installable as a PWA on Android & iOS. Built with React + Vite, Leaflet OpenStreetMap, and diagnosis-first anti-gouging pricing.

---

## 🌐 Live Demo

**[https://fix-mate-fixmate-app.vercel.app](https://fix-mate-fixmate-app.vercel.app)**

> Open on **mobile** → install banner + app view directly.
> Open on **desktop** → full marketing website.

---

## 🌟 Key Features

- **🗺️ Real Leaflet + OSM Maps** — Live geolocation, draggable pin location picker, animated technician tracking, nearby hospital map on SOS screen
- **🔍 Diagnosis-First Pricing** — Itemized quotes before any repair begins (₹50 visiting fee)
- **🛡️ Tiered Visiting Fee** — ₹50 accepted · ₹100 declined · ₹99/₹199 towing (§5.3)
- **⚠️ Transparent Change Orders** — Max 3 revisions, customer auth required (§5.4)
- **🚨 24/7 Roadside Rescue** — Battery, tyre, fuel tow-to-pump (§5.9), collision SOS
- **🏥 Nearby Hospitals on Map** — Real pins from OpenStreetMap Overpass API on SOS screen
- **⚖️ Dispute Desk** — 6 issue categories with photo evidence verification (§6.4)
- **📱 PWA Installable** — Home screen icon, native splash, install prompt banner
- **🔑 Visit OTP + Call on Accept** — When a provider is assigned, the customer gets a 4-digit visit OTP (shown on Provider Assigned, Tracking and Job Detail) to share with the provider **only on arrival**; the provider must enter it before starting work. A Call button dials the provider's stored number (disabled when no number is stored)
- **📥 Open Requests Near You** — A provider who declines a job frees it; any available provider in that category can then pick it up from their Dashboard instead of it being orphaned
- **👤 Customer Profile: Details + Service History** — Profile shows the customer's details and their full service history (what work was done, by which provider, date, status, total)
- **💾 Request Draft Saved** — Description, photo, schedule and location survive choosing a location, going back, and refreshing; the draft clears only on successful submit

---

## 🚀 Getting Started

```bash
npm install     # from repo root (workspace)
npm run dev     # starts dev server at http://localhost:5173
npm run build   # production build
```

---

## 🔑 Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer** | `tushar@demo.com` | `demo` | Repair booking, tracking, quotes, wallet |
| **Provider** | `rakesh@demo.com` | `demo` | Job queue, GPS nav, diagnosis, quote builder |
| **Provider (Electronics)** | `evershine@demo.com` | `demo` | Jobs matched to Evershine Quick Fix Electricals |
| **Provider (Mechanic / Roadside)** | `roadside@demo.com` | `demo` | Jobs matched to Kandivali Roadside SOS |
| **Provider (Plumbing)** | `plumbing@demo.com` | `demo` | Jobs matched to Iqbal Plumbing |
| **Provider (Appliance / Moto / Towing)** | `appliance@demo.com`, `moto@demo.com`, `towing@demo.com` | `demo` | Jobs matched to those providers |
| **Admin** | `admin@fixmate.com` | `admin` | Verification, disputes, coverage analysis |

> The 1-click demo login on the login screen covers `tushar@demo.com` and `rakesh@demo.com` only — the other provider accounts above are typed in manually.
>
> **Important:** a booking is assigned to one specific provider (the nearest available one for that category). To accept it, log in as **that** provider — e.g. an Electronics booking goes to `evershine@demo.com`, not to Rakesh. A declined job appears under "Open Requests Near You" for any available provider in that category.

---

## 📱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router v7 |
| Styling | Vanilla CSS, Inter font, Material Symbols Outlined |
| Maps | Leaflet 1.9 + OpenStreetMap + Nominatim reverse geocoding |
| Hospital data | OpenStreetMap Overpass API (real-time, no key needed) |
| State | Context API + localStorage (`store.js`) |
| Build & Deploy | Vite + Vercel |
| PWA | `manifest.json` + `beforeinstallprompt` install banner |

---

## 📁 Structure

```
FIXMATE/
├── fixmate-app/          # React/Vite app
│   ├── src/
│   │   ├── screens/      # customer/, provider/, admin/, auth/, public/
│   │   ├── components/   # MapView, HospitalLocator, AppHeader, TopBar...
│   │   ├── context/      # AuthContext, ToastContext
│   │   └── store.js      # localStorage data layer + Mumbai seed data
│   └── public/           # fixmate-logo.webp, fixmate-icon.png, manifest.json
├── legacy/               # Original prototype files, moved (not deleted) — see legacy/README.md
├── vercel.json           # Deploys fixmate-app/dist from repo root
└── README.md
```

> **Prototype note:** this is a working prototype, not a production backend. Data lives in `localStorage` (demo logins, simulated payments), the visit OTP is an in-app code (not sent by SMS), and Call uses a plain phone link. Production auth, payments, and provider verification are still to be added.

---

## 📄 License
MIT © 2026 Tushar — FixMate
