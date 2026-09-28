# FixMate 🔧🚗

**FixMate** is an open, hyperlocal marketplace for on-demand home repair and emergency roadside assistance. Built with React + Vite, Leaflet OpenStreetMap, and diagnosis-first anti-gouging pricing.

![FixMate Logo](FIXMATE%20logo.png)

---

## 🌟 Key Highlights

- **🗺️ Real Leaflet + OSM Map**: Live geolocation, reverse geocoding, and animated technician tracking along route polylines.
- **🔍 Diagnosis-First Pricing**: Technicians perform physical inspection and file itemized quotes before any repair begins.
- **🛡️ Tiered Visiting Fee**: Standardized diagnosis fee (₹50 when repair proceeds; ₹100 if customer declines repair post-diagnosis per Section 5.3).
- **⚠️ Transparent Change Orders**: Revisions during work require customer authorization (max 3 revisions) with clear rejection and reassembly obligations (Section 5.4).
- **🚨 24/7 Roadside Rescue**: Flat tyre, dead battery, tow-to-pump fuel assistance (Section 5.9), and towing with safety boundaries prioritizing emergency responders (112) during accidents.
- **⚖️ Trust & Safety Desk**: Customer dispute desk with 6 issue categories and photo evidence verification.
- **🌐 Responsive Marketing Website**: 10 public pages (Home, How It Works, Services, Customers, Providers, Trust, Roadside, About, FAQ, Contact).
- **📋 Implementation Control Center**: Interactive [checklist.html](checklist.html) tracking 100% completion across all 15 roadmap phases (216/216 tasks).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd fixmate-app
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🔑 Demo Accounts

FixMate includes persistent demo roles with pre-seeded data:

| Role | Email | Password | Purpose |
|---|---|---|---|
| **Customer** | `aditi@demo.com` | `demo` | Request repair, live tracking, quote approval, payment |
| **Provider** | `rakesh@demo.com` | `demo` | Incoming jobs queue, navigation, diagnosis, quote builder |
| **Admin** | `admin@fixmate.com` | `admin` | Provider verification, dispute desk, coverage gaps analysis |

---

## 📱 Tech Stack

- **Frontend**: React 18, React Router v6
- **Styling**: Vanilla CSS custom properties (Blue & White design system, Inter typography, Material Symbols)
- **Maps**: Leaflet 1.9 + OpenStreetMap tiles + Nominatim Reverse Geocoding
- **State & Persistence**: Context API + LocalStorage Data Layer (`store.js`)
- **Build Tool**: Vite 8

---

## 📄 License
MIT License &copy; 2026 FixMate.
