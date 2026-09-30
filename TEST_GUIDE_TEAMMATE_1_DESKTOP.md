# 🖥️ QA Testing Guide — Teammate 1 (Desktop Web Storefront)

Welcome to the **HOPO SHOP INDIA** Quality Assurance testing! As Teammate 1, your mission is to test the full desktop shopping experience, customer account creation, catalog filters, cart calculations, and checkout.

---

## 🔗 Testing URL
👉 **[https://hopo-shop-bcc.vercel.app/](https://hopo-shop-bcc.vercel.app/)**

---

## 📋 Step-by-Step Testing Checklist

### 1. Account Creation & Authentication
- [ ] Open the site on your laptop/desktop browser (Chrome, Edge, Firefox, or Safari).
- [ ] Click the **User / Profile icon** in the top-right header or navigate to [`/login`](https://hopo-shop-bcc.vercel.app/login).
- [ ] Switch to the **"Create Account"** (Sign Up) tab.
- [ ] Enter your Name, Email, Phone number, and Password (min 6 characters) ➡️ Click **Create Account**.
- [ ] **Verification**:
  - Ensure you are automatically logged in with a welcome message.
  - Navigate to **Profile (`/profile`)** and verify your name, email, phone, and **100 VIP Welcome Points** are visible.
  - Add a delivery address in **Addresses** section (Street, City, State, Pincode: `400050` or your actual pincode).

---

### 2. Catalog Browsing, Search & Filtering
- [ ] Go to **Home (`/home`)** and click through the hero collections.
- [ ] Open **Catalog (`/listing`)**.
- [ ] **Test Filters**:
  - Select Category: **Bridal Blouses** or **Lehengas**.
  - Filter by Fabric: **Pure Raw Silk**, **Velvet**, or **Brocade**.
  - Adjust the Price Slider (e.g. ₹5,000 to ₹30,000).
  - Test Sort By: **Price: Low to High**, **Price: High to Low**, and **Popularity**.
- [ ] **Global Search**:
  - Click the search bar in the top navigation header.
  - Type `Peacock`, `Zardozi`, or `Velvet` and verify instant search results.

---

### 3. Product Details & Haute Couture Customization
- [ ] Click on any product (e.g. *Crimson Peacock & Elephant Zardozi Bridal Blouse*).
- [ ] **Test Product Elements**:
  - Image gallery thumbnail switcher.
  - Size Selector (`S`, `M`, `L`, `XL`, `Custom Fit`).
  - Click **"Size Guide"** to inspect measurement chart modal.
  - Review Product Details: Fabric, Neckline, Sleeve, Work Type, Alterations Margin (2-inch).
  - Click the **Heart (Wishlist)** button to save the item.
  - Click **"Add to Shopping Bag"**.

---

### 4. Shopping Bag & Dynamic Coupon Application
- [ ] Click the **Shopping Bag icon** in the top header (`/cart`).
- [ ] **Test Cart Controls**:
  - Increase/decrease quantity.
  - Note price calculation (Subtotal, 5% GST, Shipping).
- [ ] **Apply Coupon**:
  - Enter coupon code **`FESTIVE40`** ➡️ Click **Apply Coupon** (Saves ₹2,400 on orders above ₹4,999).
  - Test other codes: **`HOPO10`** (10% off) or **`BRIDAL20`** (20% off bridal wear).
  - Ensure total price updates correctly with gold badge.
- [ ] Click **"Proceed to Luxury Checkout"**.

---

### 5. Checkout & Order Placement
- [ ] Enter or verify your delivery address.
- [ ] Test **Pincode Delivery Check** (e.g. `400050`, `110001`, `560001`).
- [ ] Check Optional Services:
  - Toggle **"Heirloom Gift Wrapping (+₹199)"**
  - Toggle **"Business GST Invoice"**
- [ ] Select Payment Method: **Cash on Delivery (COD)**.
- [ ] Click **"Place Luxury Order"**.

---

### 6. Order Confirmation & Live Tracking
- [ ] **Confirmation Page**: Note your **Order Number (e.g. `ORD-2026-XXXX`)** and share it with the Admin!
- [ ] Click **"Track Shipment"** to open the live tracking timeline (`/order-tracking/:id`).
- [ ] Navigate to **My Orders (`/orders`)** to ensure your order appears in your account history.

---

## 📝 Feedback & Bug Report Template
Please share any findings in this format:
- **Device / Browser**: (e.g. Windows 11 Chrome / Mac Safari)
- **Action Performed**:
- **Expected Result**:
- **Actual Result / Observation**:
- **Order Number Created**:
