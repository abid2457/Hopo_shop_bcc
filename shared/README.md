# HOPO SHOP INDIA ? Luxury Ethnic & Designer Fashion Marketplace

HOPO SHOP is a premier luxury Indian fashion e-commerce marketplace specializing in Sarees, Bridal Blouses, Wedding Blouses, Lehengas, Festive Wear, and Fine Jewellery.

---

## ?? Architecture Overview

```
Hopo-Shop/
├── shared/
│   ├── web-frontend/       # Pure React.js (React 19, Vite, React Router 7, Tailwind CSS, JavaScript/JSX)
│   ├── mobile-frontend/    # Flutter Mobile App (Android + iOS)
│   ├── shared/             # Shared Assets, Models, and OpenAPI Specifications
│   └── deployment/         # Production deployment configurations
├── backend/                # High-Performance REST API Backend (PHP 8.2+ / PDO MySQL)
└── README.md               # Master Repository Documentation
```

---

## 🎨 Frontend Architecture (`shared/web-frontend/`)
- **Tech Stack**: React 19, Vite, React Router v7, Tailwind CSS v4, Lucide Icons, Pure JavaScript (ESM + JSX).
- **Design System**: Indian Haute Couture with Warm Ivory, Deep Navy, Royal Maroon, Antique Gold, and Playfair Display / Poppins typography.
- **State Management**: Reactive custom stores + LocalStorage persistence.
- **API Integration**: Centralized HTTP client in `src/services/api.js`.

### Development Commands
```bash
# Start frontend dev server
npm --prefix shared/web-frontend run dev

# Production build
npm --prefix shared/web-frontend run build

# Preview build
npm --prefix shared/web-frontend run preview
```

---

## ⚙️ Backend Architecture (`backend/`)
- **Tech Stack**: PHP 8.2+, PDO MySQL, RESTful API Architecture.
- **Features**: Customer Auth, Admin CRUD, Order Management, Product Catalog, Inventory, Role-based Authorization, Dynamic Notifications.

### Development Commands
```bash
# Start backend dev server
php -S 127.0.0.1:8000 -t backend/public
```
