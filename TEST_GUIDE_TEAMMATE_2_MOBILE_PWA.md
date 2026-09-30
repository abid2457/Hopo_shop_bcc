# 📱 QA Testing Guide — Teammate 2 (Mobile App & PWA Shopper)

Welcome to the **HOPO SHOP INDIA** Quality Assurance testing! As Teammate 2, your mission is to test the **Mobile App (PWA)** experience on a smartphone, verify home-screen installation, mobile navigation, AI Style Assistant, and mobile checkout.

---

## 🔗 Testing URL (Open on Mobile Phone)
👉 **[https://hopo-shop-bcc.vercel.app/](https://hopo-shop-bcc.vercel.app/)**

---

## 📋 Step-by-Step Testing Checklist

### 1. Progressive Web App (PWA) Installation
- [ ] Open **[https://hopo-shop-bcc.vercel.app/](https://hopo-shop-bcc.vercel.app/)** on your phone (Android Chrome or iOS Safari).
- [ ] **Test App Installation**:
  - *On Android Chrome*: Look for the gold **"Install HOPO SHOP App"** banner at the bottom OR open the hamburger menu ➡️ Tap **"Install Hopo App"**.
  - *On iOS Safari*: Tap the **Share icon** at the bottom ➡️ Tap **"Add to Home Screen"**.
- [ ] Close your browser and launch the **HOPO SHOP** icon from your phone's home screen.
- [ ] **Verification**: Ensure the app launches in **standalone mode** (full-screen without browser URL bars), with the luxury dark burgundy theme and status bar.

---

### 2. Mobile Account Creation & Profile
- [ ] Tap the **Profile icon** on the bottom navigation bar or open the side drawer.
- [ ] Tap **Sign Up / Create Account**.
- [ ] Enter your Name, Mobile Number, Email, and Password ➡️ Tap **Register**.
- [ ] Verify you receive 100 VIP Welcome Points and Silver Tier badge.
- [ ] Tap **Manage Addresses** and save a mobile shipping address.

---

### 3. Mobile Navigation & Bottom Bar
- [ ] Test the 5 bottom navigation tabs:
  1. **Home 🏠**: Smooth scroll, announcement ticker marquee, category circles, curated bridal drops.
  2. **Categories 🗂️**: Visual photo categories with live product count badges.
  3. **Wishlist ❤️**: Heart icons and saved luxury pieces.
  4. **Bag 🛍️**: Dynamic badge count matching added items.
  5. **Profile 👤**: Customer orders, tier status, address book, VIP rewards.

---

### 4. AI Bridal Style Assistant
- [ ] Tap the **"AI Style Assistant"** banner on Home or go to [`/style-assistant`](https://hopo-shop-bcc.vercel.app/style-assistant).
- [ ] Select your event type: **Bridal**, **Sangeet**, **Reception**, or **Festive**.
- [ ] Choose your color palette (e.g. Crimson Red, Royal Navy, or Emerald Green).
- [ ] Observe curated outfit combinations (matching blouse, lehenga, and jewellery suggestions).
- [ ] Tap **"Add Ensemble to Bag"**.

---

### 5. Mobile Shopping Bag & Coupon Application
- [ ] Go to your **Shopping Bag 🛍️** (`/cart`).
- [ ] Test coupon code: **`HOPO10`** (10% off) or **`BRIDAL20`** (20% off bridal wear).
- [ ] Check price summary breakdown (Subtotal, Discount, 5% GST, Shipping).
- [ ] Tap **"Proceed to Luxury Checkout"** on the sticky bottom action bar.

---

### 6. Mobile Checkout & Order Placement
- [ ] Select your saved delivery address.
- [ ] Test pincode estimator (e.g. `560001`, `600001`, `110001`, `400050`).
- [ ] Select **Cash on Delivery (COD)**.
- [ ] Tap **"Place Order"**.
- [ ] **Verification**:
  - Note your **Order Number (e.g. `ORD-2026-XXXX`)** and send it to your Admin!
  - Tap **"Track Order"** and inspect the step-by-step shipment timeline (`/order-tracking/:id`).

---

## 📝 Feedback & Bug Report Template
Please share any findings in this format:
- **Phone Model & OS**: (e.g. iPhone 15 iOS 18 / Samsung Galaxy S24 Android 14)
- **Was PWA installed successfully to home screen?**: (Yes / No)
- **Any lag or layout overflow on small screens?**:
- **Order Number Created**:
- **General UX Impression**:
