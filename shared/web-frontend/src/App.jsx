import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import React, { useEffect, Suspense, lazy } from "react";
import { PwaInstallPrompt } from "./components/app/PwaInstallPrompt";
import { LuxuryPageLoader } from "./components/app/LuxuryPageLoader";

// Lazy-loaded Storefront Routes
const Home = lazy(() => import("./routes/m.home"));
const Listing = lazy(() => import("./routes/m.listing"));
const ProductPage = lazy(() => import("./routes/m.product.$id"));
const Cart = lazy(() => import("./routes/m.cart"));
const Checkout = lazy(() => import("./routes/m.checkout"));
const Login = lazy(() => import("./routes/m.login"));
const Profile = lazy(() => import("./routes/m.profile"));
const OrdersPage = lazy(() => import("./routes/m.orders"));
const OrderDetailsPage = lazy(() => import("./routes/m.order.$id"));
const OrderTracking = lazy(() => import("./routes/m.order-tracking"));
const Wishlist = lazy(() => import("./routes/m.wishlist"));
const Categories = lazy(() => import("./routes/m.categories"));
const Offers = lazy(() => import("./routes/m.offers"));
const CouponsPage = lazy(() => import("./routes/m.coupons"));
const SizeGuidePage = lazy(() => import("./routes/m.size-guide"));
const DeliveryCheckPage = lazy(() => import("./routes/m.delivery-check"));
const Assistant = lazy(() => import("./routes/m.style-assistant"));
const SupportPage = lazy(() => import("./routes/m.support"));
const SupportChatPage = lazy(() => import("./routes/m.support-chat"));
const FAQPage = lazy(() => import("./routes/m.faq"));
const SearchPage = lazy(() => import("./routes/m.search"));
const RefundTrackingPage = lazy(() => import("./routes/m.refund-tracking"));
const ReturnsPage = lazy(() => import("./routes/m.returns"));
const Reviews = lazy(() => import("./routes/m.reviews"));
const RewardsPage = lazy(() => import("./routes/m.rewards"));
const PaymentMethodsPage = lazy(() => import("./routes/m.payment-methods"));
const Notifications = lazy(() => import("./routes/m.notifications"));
const NotifPrefsPage = lazy(() => import("./routes/m.notification-preferences"));
const GSTInvoicePage = lazy(() => import("./routes/m.gst-invoice"));
const GiftWrapPage = lazy(() => import("./routes/m.gift-wrap"));
const FBTPage = lazy(() => import("./routes/m.frequently-bought"));
const RecentlyViewedPage = lazy(() => import("./routes/m.recently-viewed"));
const AboutBrand = lazy(() => import("./routes/m.about-brand"));
const Splash = lazy(() => import("./routes/m.splash"));
const Onboarding = lazy(() => import("./routes/m.onboarding"));

// Lazy-loaded Admin Console
const AdminOverview = lazy(() => import("./routes/admin.index"));
const ProductsAdmin = lazy(() => import("./routes/admin.products"));
const CategoriesAdmin = lazy(() => import("./routes/admin.categories"));
const InventoryAdmin = lazy(() => import("./routes/admin.inventory"));
const OrdersAdmin = lazy(() => import("./routes/admin.orders"));
const CustomersAdmin = lazy(() => import("./routes/admin.customers"));
const CouponsAdmin = lazy(() => import("./routes/admin.coupons"));
const BannersAdmin = lazy(() => import("./routes/admin.banners"));
const AnalyticsAdmin = lazy(() => import("./routes/admin.analytics"));
const ReportsAdmin = lazy(() => import("./routes/admin.reports"));
const AdminOffers = lazy(() => import("./routes/admin.offers"));
const AdminPricing = lazy(() => import("./routes/admin.pricing"));

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
      <Suspense fallback={<LuxuryPageLoader />}>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Storefront Routes */}
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

          {/* Admin Operations Console */}
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

          {/* Backward Compatibility Redirects */}
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

          {/* Fallback 404 Route */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
