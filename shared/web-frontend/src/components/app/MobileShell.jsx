import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  Bell,
  Heart,
  ShoppingBag,
  Home,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Truck,
  ChevronDown,
  Instagram,
  Mail,
  CheckCircle2,
  Award,
  RotateCcw,
  UserCheck,
  ArrowRight,
  CreditCard,
  LayoutGrid,
} from "lucide-react";
import { useState, useEffect } from "react";
import { GlobalSearch } from "./GlobalSearch";
import { Logo, HopoLogo } from "./Logo";
import { NavbarLeftOrnament, NavbarRightOrnament } from "./NavbarOrnaments";
import { PRODUCTS } from "@/lib/hopo-data";
import { categoryToSlug, useDynamicCategories } from "@/lib/catalog-service";
import { getCategoryFallback } from "@/lib/image-resolver";
import {
  useStoreSync,
  getCartCalculations,
  getWishlist,
  getUnreadNotificationCount,
  syncUnreadCountFromApi,
  getAuthUser,
} from "@/lib/store";
import { BUSINESS_CONFIG, formatINR } from "@/lib/business-config";
export { Logo, HopoLogo };
/** Symmetrical Luxury Indian Floral / Jali Emblem */
export function HopoEmblem({ className = "h-7 w-7 text-gold shrink-0" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M24 4L28.5 15.5L40 20L28.5 24.5L24 36L19.5 24.5L8 20L19.5 15.5L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="24"
        cy="20"
        r="4"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 12L15 15M36 12L33 15M12 28L15 25M36 28L33 25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="24" cy="6" r="1.5" fill="currentColor" />
      <circle cx="24" cy="34" r="1.5" fill="currentColor" />
      <circle cx="10" cy="20" r="1.5" fill="currentColor" />
      <circle cx="38" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}
/** Optional Mobile Status Bar */
export function StatusBar({ light = false }) {
  return (
    <div
      className={`w-full py-1.5 px-4 flex items-center justify-between text-[11px] font-semibold ${light ? "text-white/80" : "text-[#0D1B2A]/80"}`}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px]">5G</span>
        <span>100%</span>
      </div>
    </div>
  );
}
/** Full responsive luxury shell container */
export function MobileFrame({ children, bg = "bg-background" }) {
  return (
    <div
      className={`min-h-screen w-full ${bg} flex flex-col justify-between selection:bg-gold/30 selection:text-foreground overflow-x-hidden`}
    >
      <AnnouncementBar />
      <div className="flex-1 w-full max-w-[1480px] mx-auto px-2.5 sm:px-4 lg:px-5 xl:px-6 pt-1 sm:pt-2 pb-8 sm:pb-12 space-y-3 sm:space-y-4">
        {children}
      </div>
      <WebFooter />
    </div>
  );
}
/** Traditional Festive Bells Icon - Premium gold line-style Indian festive bells */
function TraditionalBellsIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Top Ribbon Hanger & Bow */}
      <path d="M12 1.5v3.2" strokeWidth="1.6" />
      <path
        d="M12 5.2c-1.8-2.2-4.8-1.8-4.5.8.3 2 3 1.2 4.5-.3z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path
        d="M12 5.2c1.8-2.2 4.8-1.8 4.5.8-.3 2-3 1.2-4.5-.3z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <circle cx="12" cy="5.4" r="1.1" fill="currentColor" />

      {/* Left Bell (Angled Left) */}
      <path
        d="M10.2 7.8c-1.4 1.8-3.8 4.5-4.8 8-.3 1.2.5 1.8 1.8 1.8 2 0 4.2-.8 5-2 .7-2 1.1-5.2 1.2-7.8"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path d="M5.4 16.5c1.4.9 3.5 1 5.2-.2" strokeWidth="1.6" />
      <circle cx="8" cy="18.2" r="1" fill="currentColor" />

      {/* Right Bell (Angled Right) */}
      <path
        d="M13.8 7.8c1.4 1.8 3.8 4.5 4.8 8 .3 1.2-.5 1.8-1.8 1.8-2 0-4.2-.8-5-2-.7-2-1.1-5.2-1.2-7.8"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path d="M18.6 16.5c-1.4.9-3.5 1-5.2-.2" strokeWidth="1.6" />
      <circle cx="16" cy="18.2" r="1" fill="currentColor" />

      {/* Decorative Sparkles */}
      <path d="M2.5 8v3.5M0.8 9.8h3.4" strokeWidth="1.3" />
      <path d="M21.5 8v3.5M19.8 9.8h3.4" strokeWidth="1.3" />
    </svg>
  );
}
/** Single Announcement Cycle - Exactly matching required messages and order */
function AnnouncementCycle() {
  return (
    <div className="flex items-center shrink-0">
      {/* 1. Express Shipping */}
      <Link
        to="/delivery-check"
        className="inline-flex items-center gap-2 sm:gap-2.5 whitespace-nowrap text-[#F7F2E9] hover:text-[#C8A96E] transition cursor-pointer"
      >
        <Truck className="h-3.5 w-3.5 text-[#C8A96E] shrink-0 inline-block" />
        <span className="font-medium tracking-wide">Express Shipping on all orders</span>
      </Link>

      {/* Divider */}
      <span className="mx-6 sm:mx-8 text-white/30 font-light select-none inline-flex items-center justify-center">
        |
      </span>

      {/* 2. Festive Sale */}
      <Link
        to="/offers"
        className="inline-flex items-center gap-2 sm:gap-2.5 whitespace-nowrap text-[#F7F2E9] hover:text-[#C8A96E] transition cursor-pointer"
      >
        <TraditionalBellsIcon className="h-3.5 w-3.5 text-[#C8A96E] shrink-0 inline-block" />
        <span className="font-bold text-[#C8A96E] tracking-wide">Festive Sale Live</span>
      </Link>

      {/* Divider */}
      <span className="mx-6 sm:mx-8 text-white/30 font-light select-none inline-flex items-center justify-center">
        |
      </span>

      {/* 3. 7-Day Easy Returns */}
      <Link
        to="/returns"
        className="inline-flex items-center gap-2 sm:gap-2.5 whitespace-nowrap text-[#F7F2E9] hover:text-[#C8A96E] transition cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5 text-[#C8A96E] shrink-0 inline-block" />
        <span className="tracking-wide">7-Day Easy Returns</span>
      </Link>

      {/* Separator • */}
      <span className="mx-6 sm:mx-8 text-[#C8A96E] text-[10px] select-none inline-flex items-center justify-center">
        •
      </span>

      {/* 4. 100% Authentic Fashion */}
      <Link
        to="/about-brand"
        className="inline-flex items-center gap-2 sm:gap-2.5 whitespace-nowrap text-[#F7F2E9] hover:text-[#C8A96E] transition cursor-pointer"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-[#C8A96E] shrink-0 inline-block" />
        <span className="tracking-wide">100% Authentic Fashion</span>
      </Link>

      {/* Cycle Separator */}
      <span className="mx-6 sm:mx-8 text-white/30 font-light select-none inline-flex items-center justify-center">
        |
      </span>
    </div>
  );
}
/** Announcement Sequence (3 cycles per sequence to ensure full-width coverage on all monitors) */
function AnnouncementSequence({ ariaHidden }) {
  return (
    <div className="flex items-center shrink-0" aria-hidden={ariaHidden ? "true" : undefined}>
      <AnnouncementCycle />
      <AnnouncementCycle />
      <AnnouncementCycle />
    </div>
  );
}
/** Top Announcement Bar - Continuous GPU-Accelerated Marquee Ticker */
export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Announcements"
      className="w-full bg-[#350815] text-[#F7F2E9] border-b border-[#C8A96E]/20 text-[11px] sm:text-xs overflow-hidden select-none relative z-50 h-8 sm:h-9 flex items-center"
    >
      <div className="animate-marquee-smooth flex items-center shrink-0">
        <AnnouncementSequence />
        <AnnouncementSequence ariaHidden />
      </div>
    </div>
  );
}
/** Luxury Desktop & Mobile Header */
export function AppHeader({ title, back, showSearch = true, showBell = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const { categories: dynamicCategories, totalCategories } = useDynamicCategories();
  useStoreSync();
  const cartCalc = getCartCalculations();
  const wishlist = getWishlist();
  const unreadCount = getUnreadNotificationCount();
  const user = getAuthUser();
  const userId = user?.id;
  useEffect(() => {
    if (userId) {
      syncUnreadCountFromApi();
    }
  }, [userId]);
  const navLinks = [
    { label: "New In", to: "/listing?sort=newest" },
    { label: "Categories", to: "/categories", hasDropdown: true },
  ];
  return (
    <header className="sticky top-0 z-40 w-full py-1 sm:py-1.5 transition-all">
      {/* Floating Luxury Curved Pill Capsule - Fluid, Compact & Zero-Overflow at 100% Zoom */}
      <div className="relative w-full rounded-[24px] sm:rounded-[28px] xl:rounded-full bg-[#FAF6F0] border border-[#E5DCCD] shadow-[0_4px_20px_rgba(45,24,32,0.05)] min-h-[58px] sm:min-h-[64px] xl:min-h-[72px] 2xl:min-h-[74px] flex items-center transition-all px-2.5 sm:px-3.5 xl:px-4 2xl:px-5">
        {/* Left Botanical SVG Ornament (desktop wide screens 1536px+ only, non-blocking) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 2xl:w-16 pointer-events-none z-0 overflow-hidden rounded-l-full hidden 2xl:block opacity-60">
          <NavbarLeftOrnament className="h-full w-auto object-left-top" />
        </div>

        {/* Right Botanical SVG Ornament (desktop wide screens 1536px+ only, non-blocking) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 2xl:w-16 pointer-events-none z-0 overflow-hidden rounded-r-full hidden 2xl:block opacity-60">
          <NavbarRightOrnament className="h-full w-auto object-right-top ml-auto" />
        </div>

        {/* Interior Navigation Content Container: 3-Zone Architecture */}
        <div className="relative z-10 w-full flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between gap-1.5 lg:gap-2 xl:gap-2 2xl:gap-3 min-w-0">
          {/* Section 1: Logo & Mobile Menu Toggle (Left Zone) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 lg:justify-self-start">
            {back ? (
              <button
                onClick={() => navigate(-1)}
                aria-label="Back"
                className="rounded-full p-1.5 sm:p-2 hover:bg-[#EFE7D8] transition text-[#1E293B]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-[#EFE7D8] text-[#1E293B] transition"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}

            <div className="shrink-0 flex items-center">
              <Logo
                className="w-[88px] sm:w-[100px] md:w-[108px] lg:w-[114px] xl:w-[122px] 2xl:w-[132px] max-w-[134px] h-auto"
                to="/home"
              />
            </div>
          </div>

          {/* Section 2: Desktop Navigation Links (Center Zone: True Mathematical Center) */}
          <nav className="hidden lg:flex items-center justify-center gap-1 lg:gap-1.5 xl:gap-2 2xl:gap-3 shrink min-w-0 lg:justify-self-center">
            {navLinks.map((link) => {
              const isExactMatch =
                path === link.to ||
                path === `${link.to}/` ||
                (link.to !== "/" && link.to !== "/home" && path.startsWith(`${link.to}/`));
              const isHome = link.to === "/home" && (path === "/" || path === "/home");
              const isNewIn = link.label === "New In";
              const active = isNewIn
                ? path === "/listing" && !location.search
                : link.to === "/home"
                  ? isHome
                  : isExactMatch;
              // "New In" compact blush pill button
              if (isNewIn) {
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="px-2.5 py-0.5 xl:px-3 xl:py-1 rounded-full bg-[#F5E8EA] text-[#7A1C35] font-medium text-[12.5px] xl:text-[13px] 2xl:text-[14px] border border-[#EACFD4]/70 hover:bg-[#EEDFE2] transition-colors shadow-2xs whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                );
              }
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.label}
                    className="relative group py-1.5"
                    onMouseEnter={() => setCatMenuOpen(true)}
                    onMouseLeave={() => setCatMenuOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setCatMenuOpen((v) => !v)}
                      className={`transition-colors flex items-center gap-1 whitespace-nowrap px-2 py-1 xl:px-2.5 xl:py-1 text-[13px] xl:text-[13.5px] 2xl:text-[14.5px] font-medium cursor-pointer ${
                        active || catMenuOpen
                          ? "text-[#7A1C35] font-semibold"
                          : "text-[#1E293B] hover:text-[#7A1C35]"
                      }`}
                      aria-expanded={catMenuOpen}
                      aria-haspopup="true"
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-[#A88448] transition-transform duration-200 ${
                          catMenuOpen ? "rotate-180 text-[#7A1C35]" : ""
                        }`}
                      />
                    </button>

                    {/* Exact Pixel-Matched Luxury Categories Popover with Dynamic Counts & Images */}
                    {catMenuOpen && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-92 sm:w-[420px] bg-[#FAF8F5] rounded-3xl border border-[#E5DCCD] shadow-[0_12px_40px_rgba(45,24,32,0.14)] p-4 sm:p-5 grid grid-cols-2 gap-3 z-50 animate-in fade-in-50 zoom-in-95"
                        onMouseEnter={() => setCatMenuOpen(true)}
                        onMouseLeave={() => setCatMenuOpen(false)}
                      >
                        {/* Browse All Collections Banner */}
                        <Link
                          to="/categories"
                          onClick={() => setCatMenuOpen(false)}
                          className="col-span-2 flex items-center justify-between px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF6EE] border border-[#E5DCCD] transition group/all shadow-xs"
                        >
                          <span className="text-xs font-bold text-[#7A1C35] uppercase tracking-wider">
                            BROWSE ALL COLLECTIONS ({totalCategories})
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#7A1C35] group-hover/all:translate-x-1 transition-transform" />
                        </Link>

                        {/* Dynamic Category Items Grid with Exact Real-Time Database Counts */}
                        {dynamicCategories.map((cat) => (
                          <Link
                            key={cat.id || cat.name}
                            to={`/category/${cat.slug || categoryToSlug(cat.name)}`}
                            onClick={() => setCatMenuOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition-all duration-200 group/item border border-transparent hover:border-[#E5DCCD] hover:shadow-2xs"
                          >
                            <div className="h-11 w-11 rounded-full overflow-hidden bg-[#EDE6D8] shrink-0 border border-[#E5DCCD] shadow-xs">
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="h-full w-full object-cover group-hover/item:scale-108 transition duration-300"
                                loading="eager"
                                onError={(e) => {
                                  e.currentTarget.src = getCategoryFallback(cat.name);
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-[13px] font-bold text-[#0D1B2A] group-hover/item:text-[#7A1C35] transition truncate leading-snug">
                                {cat.name}
                              </p>
                              <p className="text-[11px] text-[#6B7280] truncate font-medium mt-0.5">
                                {cat.count ?? 0}{" "}
                                {cat.count === 1 ? "Product" : "Products"}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`transition-colors whitespace-nowrap px-1.5 py-1 xl:px-2 xl:py-1 text-[13px] xl:text-[13.5px] 2xl:text-[14.5px] font-medium ${
                    active ? "text-[#7A1C35] font-semibold" : "text-[#1E293B] hover:text-[#7A1C35]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Section 3: Pill Search Bar & Action Icons (Right Zone) */}
          <div className="flex items-center gap-1 xl:gap-1.5 2xl:gap-2 shrink-0 ml-auto lg:ml-0 lg:justify-self-end">
            {/* Desktop Pill Search Bar (Fluid Controlled Width: 128px–208px) */}
            {showSearch && (
              <div className="hidden lg:block w-32 xl:w-40 2xl:w-52 shrink min-w-[120px]">
                <GlobalSearch variant="navbar" placeholder="Search bridal blouses, lehengas..." />
              </div>
            )}

            {/* Mobile/Tablet Search Trigger */}
            {showSearch && (
              <Link
                to="/search"
                aria-label="Search catalog"
                className="lg:hidden rounded-full p-1.5 sm:p-2 hover:bg-[#EFE7D8] text-[#1E293B] transition"
              >
                <Search className="h-5 w-5" />
              </Link>
            )}

            {/* Wishlist Heart Icon (Single Wishlist control in navbar) */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className={`flex rounded-full p-1.5 sm:p-2 transition relative ${
                path === "/wishlist"
                  ? "bg-[#F5E8EA] text-[#7A1C35]"
                  : "hover:bg-[#EFE7D8] text-[#1E293B] hover:text-[#7A1C35]"
              }`}
            >
              <Heart
                className={`h-4.5 w-4.5 xl:h-5 xl:w-5 stroke-[1.75] ${path === "/wishlist" ? "fill-[#7A1C35]" : ""}`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#7A1C35] text-white text-[9px] font-bold grid place-items-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Notifications Bell with Dynamic Unread Badge (Authenticated Customers Only) */}
            {showBell && user && (
              <Link
                to="/notifications"
                aria-label="Notifications"
                className={`hidden sm:flex rounded-full p-1.5 sm:p-2 transition relative ${
                  path === "/notifications"
                    ? "bg-[#F5E8EA] text-[#7A1C35]"
                    : "hover:bg-[#EFE7D8] text-[#1E293B] hover:text-[#7A1C35]"
                }`}
              >
                <Bell className="h-4.5 w-4.5 xl:h-5 xl:w-5 stroke-[1.75]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#7A1C35] text-white text-[9px] font-bold grid place-items-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Shopping Cart Pill Button (All Screen Sizes) */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="flex items-center justify-center p-1.5 xl:p-1.5 rounded-xl bg-[#F5E8EA] hover:bg-[#EEDFE2] text-[#7A1C35] border border-[#EACFD4]/70 transition shadow-2xs relative group"
            >
              <ShoppingBag className="h-4.5 w-4.5 xl:h-5 xl:w-5 stroke-[1.75]" />
              {cartCalc.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 rounded-full bg-[#C8A96E] text-[#0D1B2A] text-[9px] font-bold grid place-items-center shadow-xs border border-white">
                  {cartCalc.itemCount}
                </span>
              )}
            </Link>

            {/* Profile User Icon (Desktop & Tablet) */}
            <Link
              to={user ? "/profile" : "/login"}
              aria-label="User Account"
              className="hidden md:flex rounded-full p-1.5 sm:p-2 hover:bg-[#EFE7D8] text-[#1E293B] hover:text-[#7A1C35] transition relative"
            >
              <User className="h-4.5 w-4.5 xl:h-5 xl:w-5 stroke-[1.75]" />
              {user && (
                <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-[#2E7D6B] ring-2 ring-white" />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-2 rounded-2xl border border-[#E5DCCD] bg-[#FAF6F0] p-4 space-y-3.5 shadow-luxury animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E5DCCD]/80">
            <Logo className="w-[105px] sm:w-[115px] h-auto" to="/home" />
            <span className="text-[9px] tracking-[0.2em] text-[#C8A96E] font-bold uppercase">
              HAUTE COUTURE
            </span>
          </div>

          <div>
            <GlobalSearch
              variant="navbar"
              placeholder="Search bridal blouses, lehengas..."
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>

          <nav className="flex flex-col space-y-1 pt-1">
            {navLinks.map((link) => {
              const isExactMatch =
                path === link.to ||
                path === `${link.to}/` ||
                (link.to !== "/" && link.to !== "/home" && path.startsWith(`${link.to}/`));
              const isHome = link.to === "/home" && (path === "/" || path === "/home");
              const isNewIn = link.label === "New In";
              const active = isNewIn
                ? path === "/listing" && !location.search
                : link.to === "/home"
                  ? isHome
                  : isExactMatch;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition flex items-center justify-between ${
                    active || isNewIn
                      ? "bg-[#F5E8EA] text-[#7A1C35] font-semibold border border-[#EACFD4]/70"
                      : "text-[#1E293B] hover:bg-[#EFE7D8]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              );
            })}

            {user && (
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition flex items-center justify-between ${
                  path === "/notifications"
                    ? "bg-[#F5E8EA] text-[#7A1C35] font-semibold border border-[#EACFD4]/70"
                    : "text-[#1E293B] hover:bg-[#EFE7D8]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#7A1C35]" />
                  <span>VIP Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#7A1C35] text-white text-[10px] font-bold grid place-items-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* Quick Category Grid in Mobile Drawer */}
          <div className="pt-2.5 border-t border-[#E5DCCD]/80">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A1C35] mb-2">
              Featured Collections
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {dynamicCategories.map((cat) => (
                <Link
                  key={cat.id || cat.name}
                  to={`/category/${cat.slug || categoryToSlug(cat.name)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-white/70 hover:bg-white border border-[#E5DCCD]/60 transition"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-7 w-7 rounded-md object-cover"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.src = getCategoryFallback(cat.name);
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-[#0D1B2A] truncate block">
                      {cat.name}
                    </span>
                    <span className="text-[9px] text-[#6B7280] block">
                      {cat.count ?? 0} {cat.count === 1 ? "Product" : "Products"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
/** Bottom Navigation Bar (Mobile / Tablet) */
export function BottomNav({ active }) {
  useStoreSync();
  const cartCalc = getCartCalculations();
  const wishlist = getWishlist();
  const items = [
    { key: "home", label: "Home", to: "/home", icon: Home },
    { key: "categories", label: "Categories", to: "/categories", icon: LayoutGrid },
    {
      key: "wishlist",
      label: "Wishlist",
      to: "/wishlist",
      icon: Heart,
      badge: wishlist.length > 0 ? wishlist.length : undefined,
    },
    {
      key: "bag",
      label: "Bag",
      to: "/cart",
      icon: ShoppingBag,
      badge: cartCalc.itemCount > 0 ? cartCalc.itemCount : undefined,
    },
    { key: "profile", label: "Profile", to: "/profile", icon: User },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#E5DCCD] bg-[#F7F2E9]/98 backdrop-blur-md grid grid-cols-5 py-2 px-1 shadow-luxury">
      {items.map(({ key, label, to, icon: Icon, badge }) => {
        const isActive = active === key;
        return (
          <Link
            key={key}
            to={to}
            className={`flex flex-col items-center gap-1 py-1 text-[10px] transition relative ${isActive ? "text-[#8B1E3F] font-bold" : "text-[#6B7280] hover:text-[#0D1B2A]"}`}
          >
            <div className="relative">
              <Icon
                className={`h-5 w-5 ${isActive ? "fill-[#8B1E3F]/15" : ""}`}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              {badge !== undefined && (
                <span className="absolute -top-1 -right-2 h-3.5 min-w-3.5 px-0.5 rounded-full bg-[#8B1E3F] text-white text-[8px] font-bold grid place-items-center shadow-xs">
                  {badge}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
/** Section Heading with optional Antique Gold flourish */
export function SectionHeading({ eyebrow, title, action, onAction, actionTo, flourish = false }) {
  return (
    <div
      className={`flex items-end justify-between mt-8 mb-5 ${flourish ? "text-center justify-center flex-col items-center" : ""}`}
    >
      <div className={flourish ? "text-center" : ""}>
        {eyebrow && (
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#C8A96E] font-bold mb-1.5">
            {eyebrow}
          </p>
        )}
        {flourish ? (
          <div className="flex items-center gap-3 justify-center">
            <span className="text-[#C8A96E] text-sm tracking-widest font-serif">~</span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#0D1B2A] font-bold tracking-tight uppercase">
              {title}
            </h2>
            <span className="text-[#C8A96E] text-sm tracking-widest font-serif">~</span>
          </div>
        ) : (
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl text-[#0D1B2A] font-bold tracking-tight">
            {title}
          </h2>
        )}
      </div>
      {action &&
        !flourish &&
        (actionTo ? (
          <Link
            to={actionTo}
            className="text-xs sm:text-sm font-semibold text-[#8B1E3F] hover:text-[#5E0F27] flex items-center gap-1 group transition"
          >
            <span>{action}</span>
            <span className="group-hover:translate-x-1 transition">→</span>
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="text-xs sm:text-sm font-semibold text-[#8B1E3F] hover:text-[#5E0F27] flex items-center gap-1 group transition"
          >
            <span>{action}</span>
            <span className="group-hover:translate-x-1 transition">→</span>
          </button>
        ))}
    </div>
  );
}
/** Luxury Price Tag with formatted Indian Rupees */
export function PriceTag({ price, mrp }) {
  const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-sm sm:text-base font-bold text-[#0D1B2A]">
        {formatINR(price)}
      </span>
      {mrp && mrp > price && (
        <>
          <span className="text-[11px] sm:text-xs text-[#6B7280] line-through">
            {formatINR(mrp)}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#8B1E3F] bg-[#8B1E3F]/10 px-1.5 py-0.2 rounded-md">
            {discount}% OFF
          </span>
        </>
      )}
    </div>
  );
}
/** 5-Point Bottom Guarantee & Authenticity Strip */
export function GuaranteeBar() {
  const guaranteeItems = [
    {
      icon: ShieldCheck,
      title: "100% Authentic",
      subtitle: "Sourced from trusted designers",
    },
    {
      icon: Award,
      title: "Premium Quality",
      subtitle: "Finest fabrics & craftsmanship",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      subtitle: "Multiple safe payment options",
    },
    {
      icon: RotateCcw,
      title: "Hassle-Free Returns",
      subtitle: "Easy returns & full refunds",
    },
    {
      icon: UserCheck,
      title: "Dedicated Support",
      subtitle: "Mon–Sat 10AM to 7PM",
    },
  ];
  return (
    <div className="w-full rounded-2xl border border-[#E5DCCD] bg-white p-5 sm:p-7 shadow-subtle my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
        {guaranteeItems.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex flex-col items-center space-y-2 group">
            <div className="h-10 w-10 rounded-full bg-[#F7F2E9] border border-[#E5DCCD] grid place-items-center text-[#C8A96E] group-hover:scale-110 group-hover:border-[#C8A96E] transition duration-300">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="font-display font-bold text-[#0D1B2A] text-xs sm:text-sm">{title}</h4>
              <p className="text-[11px] text-[#6B7280] mt-0.5">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
/** Join the HOPO Circle VIP Newsletter Banner */
export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribed(true);
    }
  };
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#3d0d1b] text-[#F7F2E9] p-7 sm:p-10 lg:p-12 my-10 shadow-luxury border border-[#C8A96E]/40">
      {/* Decorative Warm Gold Blur Circles */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-[#C8A96E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C8A96E]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: Headline & Copy */}
        <div className="space-y-2 text-center lg:text-left max-w-lg">
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            JOIN THE HOPO CIRCLE
          </h3>
          <p className="text-xs sm:text-sm text-[#F7F2E9]/85 font-light leading-relaxed">
            Get early access to new collections, exclusive offers & style updates.
          </p>
        </div>

        {/* Center: Email Form */}
        <div className="w-full max-w-md">
          {subscribed ? (
            <div className="inline-flex items-center gap-2 bg-[#C8A96E]/20 text-[#C8A96E] border border-[#C8A96E]/50 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold animate-in fade-in">
              <CheckCircle2 className="h-5 w-5" />
              <span>Welcome to the HOPO Circle! Your 10% welcome gift code is on its way.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                aria-label="Email for newsletter subscription"
                className="flex-1 px-5 py-3 rounded-full bg-white text-[#0D1B2A] placeholder-[#6B7280] text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#C8A96E] shadow-sm"
              />
              <button
                type="submit"
                className="px-7 py-3 rounded-full bg-[#C8A96E] text-[#0D1B2A] font-bold text-xs uppercase tracking-widest hover:brightness-110 transition shadow-md shrink-0 active:scale-95"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>

        {/* Right: 3 Value Props */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center lg:justify-end text-[11px] text-[#F7F2E9]/90">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-white/10 grid place-items-center text-[#C8A96E]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-semibold text-white">Exclusive Offers</p>
              <p className="text-[10px] text-[#F7F2E9]/70">Just for members</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-white/10 grid place-items-center text-[#C8A96E]">
              <Award className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-semibold text-white">Early Access</p>
              <p className="text-[10px] text-[#F7F2E9]/70">New launches</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-white/10 grid place-items-center text-[#C8A96E]">
              <RefreshCw className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-semibold text-white">Style Updates</p>
              <p className="text-[10px] text-[#F7F2E9]/70">Curated for you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/** Complete Luxury Multi-Column Footer */
export function WebFooter() {
  const { categories } = useDynamicCategories();
  return (
    <footer className="w-full border-t border-[#E5DCCD] bg-white mt-16 text-[#6B7280] text-xs">
      {/* Main Footer Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 xl:gap-12">
        {/* Brand Column */}
        <div className="space-y-5 col-span-1 lg:col-span-4">
          <Logo className="w-[145px] sm:w-[170px] lg:w-[185px] max-w-[195px] h-auto" to="/home" />
          <p className="text-xs leading-relaxed text-[#6B7280] max-w-sm">
            India's premier fashion luxury marketplace for bridal blouses, lehengas, salwar suits,
            night suits & more. Crafted for elegance. Chosen for you.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href={BUSINESS_CONFIG.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="h-8 w-8 rounded-full border border-[#E5DCCD] grid place-items-center hover:text-[#8B1E3F] hover:border-[#8B1E3F] transition"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${BUSINESS_CONFIG.contact.email}`}
              aria-label="Email"
              className="h-8 w-8 rounded-full border border-[#E5DCCD] grid place-items-center hover:text-[#8B1E3F] hover:border-[#8B1E3F] transition"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div className="col-span-1 lg:col-span-2">
          <h4 className="font-display text-xs font-bold text-[#0D1B2A] uppercase tracking-wider mb-4">
            SHOP
          </h4>
          <ul className="space-y-2.5 text-xs">
            {categories.map((cat) => (
              <li key={cat.id || cat.name}>
                <Link
                  to={`/category/${cat.slug || categoryToSlug(cat.name)}`}
                  className="hover:text-[#8B1E3F] transition"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/listing?sort=newest" className="hover:text-[#8B1E3F] transition">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care Column */}
        <div className="col-span-1 lg:col-span-3">
          <h4 className="font-display text-xs font-bold text-[#0D1B2A] uppercase tracking-wider mb-4">
            CUSTOMER CARE
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/faq" className="hover:text-[#8B1E3F] transition">
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link to="/delivery-check" className="hover:text-[#8B1E3F] transition">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-[#8B1E3F] transition">
                Returns & Exchanges Policy
              </Link>
            </li>
            <li>
              <Link to="/size-guide" className="hover:text-[#8B1E3F] transition">
                Size Guide
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-[#8B1E3F] transition">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Help & Support Column */}
        <div className="col-span-1 lg:col-span-3">
          <h4 className="font-display text-xs font-bold text-[#0D1B2A] uppercase tracking-wider mb-4">
            HELP & SUPPORT
          </h4>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Email:{" "}
            <a
              href={`mailto:${BUSINESS_CONFIG.contact.email}`}
              className="text-[#8B1E3F] font-medium hover:underline"
            >
              {BUSINESS_CONFIG.contact.email}
            </a>
            <br />
            {BUSINESS_CONFIG.contact.supportHours}
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#E5DCCD] py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 text-center sm:text-left text-[11px] text-[#6B7280]">
          © 2026 Blue Chip Computers LLP. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
