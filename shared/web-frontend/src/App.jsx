import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import Home from "./routes/m.home";
import Listing from "./routes/m.listing";
import ProductPage from "./routes/m.product.$id";
import Cart from "./routes/m.cart";
import Checkout from "./routes/m.checkout";
import Login from "./routes/m.login";
import Profile from "./routes/m.profile";
import OrdersPage from "./routes/m.orders";
import OrderDetailsPage from "./routes/m.order.$id";
import OrderTracking from "./routes/m.order-tracking";
import Wishlist from "./routes/m.wishlist";
import Categories from "./routes/m.categories";
import Offers from "./routes/m.offers";
import CouponsPage from "./routes/m.coupons";
import SizeGuidePage from "./routes/m.size-guide";
import DeliveryCheckPage from "./routes/m.delivery-check";
import Assistant from "./routes/m.style-assistant";
import SupportPage from "./routes/m.support";
import SupportChatPage from "./routes/m.support-chat";
import FAQPage from "./routes/m.faq";
import SearchPage from "./routes/m.search";
import RefundTrackingPage from "./routes/m.refund-tracking";
import ReturnsPage from "./routes/m.returns";
import Reviews from "./routes/m.reviews";
import RewardsPage from "./routes/m.rewards";
import PaymentMethodsPage from "./routes/m.payment-methods";
import Notifications from "./routes/m.notifications";
import NotifPrefsPage from "./routes/m.notification-preferences";
import GSTInvoicePage from "./routes/m.gst-invoice";
import GiftWrapPage from "./routes/m.gift-wrap";
import FBTPage from "./routes/m.frequently-bought";
import RecentlyViewedPage from "./routes/m.recently-viewed";
import AboutBrand from "./routes/m.about-brand";
import Splash from "./routes/m.splash";
import Onboarding from "./routes/m.onboarding";
// Admin Operations Console
import AdminOverview from "./routes/admin.index";
import ProductsAdmin from "./routes/admin.products";
import CategoriesAdmin from "./routes/admin.categories";
import InventoryAdmin from "./routes/admin.inventory";
import OrdersAdmin from "./routes/admin.orders";
import CustomersAdmin from "./routes/admin.customers";
import CouponsAdmin from "./routes/admin.coupons";
import BannersAdmin from "./routes/admin.banners";
import AnalyticsAdmin from "./routes/admin.analytics";
import ReportsAdmin from "./routes/admin.reports";
import AdminOffers from "./routes/admin.offers";
import AdminPricing from "./routes/admin.pricing";
import { PwaInstallPrompt } from "./components/app/PwaInstallPrompt";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

// Dynamic Legacy /m/product/:id Redirect Helper
function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/product/${id}` : "/listing"} replace />;
}

// Dynamic Legacy /m/order/:id Redirect Helper
function LegacyOrderRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/order/${id}` : "/orders"} replace />;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <PwaInstallPrompt />
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* ??? 1. Primary Clean Storefront Routes (No /m prefix) ??????????????? */}
        <Route path="/home" element={<Home />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/products" element={<Listing />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/order-tracking/:id" element={<OrderTracking />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<Listing />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/size-guide" element={<SizeGuidePage />} />
        <Route path="/delivery-check" element={<DeliveryCheckPage />} />
        <Route path="/style-assistant" element={<Assistant />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/support-chat" element={<SupportChatPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/refund-tracking" element={<RefundTrackingPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/addresses" element={<Navigate to="/profile" replace />} />
        <Route path="/address-edit" element={<Navigate to="/profile" replace />} />
        <Route path="/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notification-preferences" element={<NotifPrefsPage />} />
        <Route path="/gst-invoice" element={<GSTInvoicePage />} />
        <Route path="/gift-wrap" element={<GiftWrapPage />} />
        <Route path="/frequently-bought" element={<FBTPage />} />
        <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
        <Route path="/about-brand" element={<AboutBrand />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/discover" element={<Navigate to="/listing" replace />} />
        <Route path="/lookbook" element={<Navigate to="/listing" replace />} />

        {/* ??? 2. Admin Operations Console ???????????????????????????????????? */}
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/products" element={<ProductsAdmin />} />
        <Route path="/admin/categories" element={<CategoriesAdmin />} />
        <Route path="/admin/inventory" element={<InventoryAdmin />} />
        <Route path="/admin/orders" element={<OrdersAdmin />} />
        <Route path="/admin/customers" element={<CustomersAdmin />} />
        <Route path="/admin/coupons" element={<CouponsAdmin />} />
        <Route path="/admin/offers" element={<AdminOffers />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />
        <Route path="/admin/banners" element={<BannersAdmin />} />
        <Route path="/admin/analytics" element={<AnalyticsAdmin />} />
        <Route path="/admin/reports" element={<ReportsAdmin />} />

        {/* ??? 3. Backward Compatibility Redirects (Seamless /m/* to /*) ????? */}
        <Route path="/m/home" element={<Navigate to="/home" replace />} />
        <Route path="/m/listing" element={<Navigate to="/listing" replace />} />
        <Route path="/m/product/:id" element={<LegacyProductRedirect />} />
        <Route path="/m/cart" element={<Navigate to="/cart" replace />} />
        <Route path="/m/checkout" element={<Navigate to="/checkout" replace />} />
        <Route path="/m/login" element={<Navigate to="/login" replace />} />
        <Route path="/m/profile" element={<Navigate to="/profile" replace />} />
        <Route path="/m/orders" element={<Navigate to="/orders" replace />} />
        <Route path="/m/order/:id" element={<LegacyOrderRedirect />} />
        <Route path="/m/order-tracking" element={<Navigate to="/order-tracking" replace />} />
        <Route path="/m/wishlist" element={<Navigate to="/wishlist" replace />} />
        <Route path="/m/categories" element={<Navigate to="/categories" replace />} />
        <Route path="/m/offers" element={<Navigate to="/offers" replace />} />
        <Route path="/m/discover" element={<Navigate to="/listing" replace />} />
        <Route path="/m/lookbook" element={<Navigate to="/listing" replace />} />
        <Route path="/m/size-guide" element={<Navigate to="/size-guide" replace />} />
        <Route path="/m/delivery-check" element={<Navigate to="/delivery-check" replace />} />
        <Route path="/m/style-assistant" element={<Navigate to="/style-assistant" replace />} />
        <Route path="/m/support" element={<Navigate to="/support" replace />} />
        <Route path="/m/*" element={<Navigate to="/home" replace />} />

        {/* ??? 4. Fallback 404 Route ?????????????????????????????????????????? */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}
export default App;
