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
| **Admin** | `admin@fixmate.com` | `admin` | Verification, disputes, coverage analysis |

> Use the 1-click demo login on the login screen — no typing needed.

---

## 📱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6 |
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
├── vercel.json           # Deploys fixmate-app/dist from repo root
└── README.md
```

---

## 📄 License
MIT © 2026 Tushar — FixMate
