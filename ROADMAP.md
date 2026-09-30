# HOPO SHOP INDIA — Project Roadmap & Implementation Milestones

This document tracks all project priorities, architectural decisions, and pending tasks across the frontend (React 19 PWA on Vercel) and backend (PHP 8.2+ PDO REST API on MilesWeb).

---

## 🏗️ Architecture Overview

```
Frontend (Vercel)                    Backend (MilesWeb cPanel / Apache)
┌─────────────────────────┐          ┌───────────────────────────────────┐
│ React 19 + Vite 7 (PWA) │ ───────> │ PHP 8.2+ REST API                 │
│ Responsive Web & App    │   CORS   │ PDO MySQL Engine                  │
│ Deployed on Vercel      │   JSON   │ FastCGI / Apache (.htaccess)      │
└─────────────────────────┘          └─────────────────┬─────────────────┘
                                                       │
                                                       ▼
                                            ┌─────────────────────┐
                                            │ MySQL 8.0+ Database │
                                            │ (schema_production) │
                                            └─────────────────────┘
```

---

## 📌 Prioritized Implementation Phases

### ✅ Phase 1: Workspace Setup & Git Synchronization [COMPLETED]
- [x] Project architecture analysis and monorepo flattening.
- [x] Dependencies installed and build verification (`npm run build` passing).
- [x] Git repository connected to GitHub: `https://github.com/abid2457/Hopo_shop_bcc.git`
- [x] Initial commit pushed to `main`.

### ✅ Phase 2: Progressive Web App (PWA) Setup [COMPLETED]
- [x] W3C Web App Manifest (`manifest.json`) with app shortcuts, luxury theme `#3D0D1B`, and background `#FAF6EE`.
- [x] High-resolution icon set in `public/icons/` (72x72 through 512x512, maskable, and Apple Touch Icons).
- [x] Service Worker (`sw.js`) with shell pre-caching, stale-while-revalidate for static bundles, cache-first for images, and offline SPA routing.
- [x] Service worker registration lifecycle (`pwa-register.js`).
- [x] Luxury floating Install Banner (`PwaInstallPrompt.jsx`) + drawer menu trigger.

---

### 🚀 Phase 3: MilesWeb PHP Backend & MySQL Connection [IN PROGRESS — PRIORITY 1]
- [ ] **Database Setup**:
  - [ ] Create MySQL Database & User in MilesWeb cPanel (prefix: `velloreh1_*`).
  - [ ] Import `backend/database/schema_production.sql` via phpMyAdmin.
  - [ ] Import initial sample products & categories from `backend/database/seed.sql`.
- [ ] **Backend Deployment on MilesWeb**:
  - [ ] Configure `backend/.env` with MilesWeb DB credentials (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`).
  - [ ] Set `FRONTEND_URL` to Vercel deployment domain for CORS.
  - [ ] Upload `backend/` files to MilesWeb domain folder (e.g. `api.yourdomain.com` or `yourdomain.com/api`).
- [ ] **Frontend Environment Configuration**:
  - [ ] Add `VITE_API_BASE_URL=https://api.yourdomain.com` to Vercel environment variables.
  - [ ] Verify live API handshake from Vercel to MilesWeb.

---

### ⚡ Phase 4: Performance & Code Splitting (High Priority for Web/Mobile)
- [ ] **Dynamic Lazy-Loading for Routes**:
  - Replace static imports in `App.jsx` with `React.lazy()` and `<Suspense>` fallback loaders to drop initial JS bundle from ~877 kB to **<80 kB**.
- [ ] **Image Optimization**:
  - Progressive blur-up placeholders and responsive image sizing for luxury haute couture media.

---

### 💳 Phase 5: Checkout, Payment Gateway & Order Lifecycle
- [ ] **Razorpay Payment Gateway**:
  - Configure Razorpay Checkout SDK for live/test payments in `m.checkout.jsx`.
  - Add signature verification endpoint in `OrderController.php`.
- [ ] **End-to-End Order Creation**:
  - Validate address selection, delivery pincode calculation, dynamic coupon discounts, and GST invoice generation.
- [ ] **Order Tracking & Return Management**:
  - Live shipment milestone timeline (`/order-tracking/:id`) and return/refund processing (`/returns`).

---

### 💎 Phase 6: Storefront UX & Admin Console Polish
- [ ] **Enhanced Search & Autocomplete**:
  - Debounced real-time catalog search and category quick filters in `GlobalSearch.jsx`.
- [ ] **AI Bridal Style Assistant**:
  - Fine-tune outfit matching algorithms in `m.style-assistant.jsx`.
- [ ] **Admin Operations Console**:
  - Verify admin access, inventory management, product CRUD, dynamic coupon creation, and sales reports.
- [ ] **SEO & Social Cards**:
  - Add JSON-LD schema (Product & Organization) and OpenGraph meta tags for WhatsApp/Instagram sharing.

---

## 🛠️ Environment Configuration Reference

### Backend `.env` (MilesWeb)
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://your-app.vercel.app

DB_HOST=localhost
DB_PORT=3306
DB_NAME=velloreh1_hoposhop
DB_USER=velloreh1_hopo_user
DB_PASSWORD=YourSecurePassword
DB_CHARSET=utf8mb4

JWT_SECRET=your_64_character_random_hex_key
JWT_TTL=86400
```

### Frontend `.env` (Vercel)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```
