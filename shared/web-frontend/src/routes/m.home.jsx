import { Link } from "react-router-dom";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  MobileFrame,
  AppHeader,
  BottomNav,
  SectionHeading,
  GuaranteeBar,
  NewsletterBanner,
} from "@/components/app/MobileShell";
import { ProductCard } from "@/components/app/ProductCard";
import {
  OCCASIONS,
  FABRICS,
  CUSTOMER_TESTIMONIALS,
  INSTAGRAM_POSTS,
  PRODUCTS,
} from "@/lib/hopo-data";
import { categoryToSlug, useDynamicCategories } from "@/lib/catalog-service";
import { BUSINESS_CONFIG, formatINR } from "@/lib/business-config";
import {
  Compass,
  Star,
  ArrowRight,
  Instagram,
  CheckCircle2,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { bannerApi, productApi } from "@/services/api/index";
/** Homepage Circular Moving Wedding Blouse Carousel */
function HomepageWeddingBlouseSlider({ liveBlouses = null }) {
  // 1. Strictly authentic Wedding & Bridal Blouse products from catalog
  const weddingBlouses = useMemo(() => {
    const source = Array.isArray(liveBlouses) && liveBlouses.length > 0 ? liveBlouses : PRODUCTS;
    const list = source.filter(
      (p) =>
        (p.category === "Bridal Blouses" || (p.category_name === "Bridal Blouses") || (p.title && p.title.toLowerCase().includes("blouse"))) &&
        typeof p.image === "string" &&
        p.image.trim().length > 0,
    );
    // Prioritize primary signature wedding blouse if present
    const p5Index = list.findIndex((p) => p.id === "p5");
    if (p5Index > 0) {
      const [p5] = list.splice(p5Index, 1);
      list.unshift(p5);
    }
    return list.length > 0 ? list : PRODUCTS.slice(0, 5);
  }, [liveBlouses]);
  const total = weddingBlouses.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  // Preload all Wedding Blouse images immediately on mount
  useEffect(() => {
    weddingBlouses.forEach((blouse) => {
      if (blouse?.image) {
        const img = new Image();
        img.src = blouse.image;
      }
    });
  }, [weddingBlouses]);
  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);
  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);
  // Autoplay every 4.5 seconds with pause on hover
  useEffect(() => {
    if (isHovered || total <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [handleNext, isHovered, total]);
  // Touch Swipe handlers for mobile/tablet
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };
  if (total === 0) return null;
  const leftIndex = (activeIndex - 1 + total) % total;
  const rightIndex = (activeIndex + 1) % total;
  const activeBlouse = weddingBlouses[activeIndex] || weddingBlouses[0];
  const leftBlouse = weddingBlouses[leftIndex];
  const rightBlouse = weddingBlouses[rightIndex];
  return (
    <div
      className="relative w-full flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Wedding Blouses Carousel"
    >
      {/* 3-Circle Layered Moving Carousel Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[440px] h-[210px] sm:h-[250px] lg:h-[270px] flex items-center justify-center">
        {/* Left Smaller Circular Preview */}
        {leftBlouse && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-[105px] sm:w-[130px] lg:w-[145px] aspect-square rounded-full border-3 border-white shadow-md overflow-hidden opacity-65 hover:opacity-90 hover:scale-105 transition-all duration-500 z-10 cursor-pointer bg-[#EDE5D8]"
            aria-label={`Previous slide: ${leftBlouse.title}`}
          >
            <img
              src={leftBlouse.image}
              alt={leftBlouse.title}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/20" />
          </button>
        )}

        {/* Center Large Active Circular Display */}
        <div className="relative z-20 w-[165px] sm:w-[205px] lg:w-[225px] aspect-square rounded-full border-4 border-white shadow-2xl overflow-hidden bg-[#EDE5D8] group transition-transform duration-500 hover:scale-[1.02]">
          <Link
            to={`/product/${activeBlouse.id}`}
            className="w-full h-full relative block cursor-pointer"
            aria-label={`View ${activeBlouse.title}`}
          >
            <img
              key={activeBlouse.id}
              src={activeBlouse.image}
              alt={activeBlouse.title}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
            />
            {/* Subtle luxury vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </Link>

          {/* Previous / Next Chevron Buttons on Center Circle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 hover:bg-white text-[#8B1E3F] shadow-md grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30"
            aria-label="Previous Wedding Blouse"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 hover:bg-white text-[#8B1E3F] shadow-md grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30"
            aria-label="Next Wedding Blouse"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right Smaller Circular Preview */}
        {rightBlouse && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-[105px] sm:w-[130px] lg:w-[145px] aspect-square rounded-full border-3 border-white shadow-md overflow-hidden opacity-65 hover:opacity-90 hover:scale-105 transition-all duration-500 z-10 cursor-pointer bg-[#EDE5D8]"
            aria-label={`Next slide: ${rightBlouse.title}`}
          >
            <img
              src={rightBlouse.image}
              alt={rightBlouse.title}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/20" />
          </button>
        )}
      </div>

      {/* Floating Synchronized Product Badge Below Carousel */}
      <div className="w-full max-w-[280px] sm:max-w-[320px] mt-3 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#E5DCCD] shadow-luxury flex items-center justify-between z-20 transition-all duration-300">
        <div className="min-w-0 pr-2">
          <p className="text-[9px] font-bold text-[#8B1E3F] uppercase tracking-wider">
            FEATURED PIECE
          </p>
          <Link
            to={`/product/${activeBlouse.id}`}
            className="font-display font-bold text-xs sm:text-sm text-[#0D1B2A] hover:text-[#8B1E3F] transition truncate block leading-snug"
          >
            {activeBlouse.title}
          </Link>
          <p className="text-xs font-semibold text-[#0D1B2A] mt-0.5 flex items-baseline gap-1.5">
            <span>{formatINR(activeBlouse.price)}</span>
            {activeBlouse.mrp && activeBlouse.mrp > activeBlouse.price && (
              <span className="text-[10px] text-[#6B7280] line-through font-normal">
                {formatINR(activeBlouse.mrp)}
              </span>
            )}
          </p>
        </div>
        <Link
          to={`/product/${activeBlouse.id}`}
          className="px-3 py-1.5 rounded-xl bg-[#8B1E3F] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shrink-0 shadow-xs"
        >
          VIEW
        </Link>
      </div>

      {/* Slide Position Dots */}
      <div className="flex items-center gap-1.5 mt-2.5">
        {weddingBlouses.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex ? "w-5 bg-[#8B1E3F]" : "w-1.5 bg-[#C8A96E]/40 hover:bg-[#C8A96E]"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
/** Distinct, category-specific luxury line icons for each category */
function CategoryIcon({ name, className = "h-5 w-5" }) {
  const norm = name.toLowerCase();
  // 1. Bridal Blouses (Sweetheart neck cropped bridal blouse with delicate cap sleeves)
  if (norm.includes("bridal blouse")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-label="Bridal Blouses icon"
      >
        <path d="M4 8.5L7.5 4H10.5C11 5.5 13 5.5 13.5 4H16.5L20 8.5L17.5 11L16 9.5V18.5H8V9.5L6.5 11L4 8.5Z" />
        <path d="M10 9C10.5 10 13.5 10 14 9" />
        <path d="M12 9V14" />
        <path d="M8 18.5L12 17L16 18.5" />
      </svg>
    );
  }
  // 2. Wedding Blouses (Royal V-neck atelier blouse with elbow-length sleeves & button detail)
  if (norm.includes("wedding blouse")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-label="Wedding Blouses icon"
      >
        <path d="M4 9L8 4.5H10L12 8.5L14 4.5H16L20 9L18 12L16 10.5V19H8V10.5L6 12L4 9Z" />
        <path d="M10 19L12 17.5L14 19" />
        <circle cx="12" cy="11.5" r="0.75" fill="currentColor" />
        <circle cx="12" cy="14.5" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  // 3. Lehengas (Voluminous flared royal ghagra skirt)
  if (norm.includes("lehenga")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-label="Lehengas icon"
      >
        <path d="M8 5H16V7H8V5Z" />
        <path d="M9 7L4 19.5C6.5 20.5 17.5 20.5 20 19.5L15 7" />
        <path d="M12 7V20" />
        <path d="M7 19.8C8.5 19 10 18.5 12 18.5C14 18.5 15.5 19 17 19.8" />
        <path d="M10 13C11 12.5 13 12.5 14 13" />
      </svg>
    );
  }
  // 4. Salwar Suits (Traditional straight tunic kurta with draped dupatta)
  if (norm.includes("salwar") || (norm.includes("suit") && !norm.includes("night"))) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-label="Salwar Suits icon"
      >
        <path d="M6 4L9 3H15L18 4L19 8L16 9V20.5L14 20V15H10V20L8 20.5V9L5 8L6 4Z" />
        <path d="M10 3C10 5 14 5 14 3" />
        <path d="M12 5V10" />
        <path d="M4 11C4 11 5.5 13 8 13" />
        <path d="M20 11C20 11 18.5 13 16 13" />
      </svg>
    );
  }
  // 5. Night Suits (Luxury silk pajama & lounge ensemble)
  if (norm.includes("night") || norm.includes("pajama") || norm.includes("lounge")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-label="Night Suits icon"
      >
        <path d="M4 4h16v4L15 9v11h-2v-6h-2v6H9V9L4 8V4z" />
        <path d="M12 4v5" />
        <circle cx="12" cy="12" r="0.75" fill="currentColor" />
        <circle cx="12" cy="15" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  // 6. Indo-Western (Contemporary fusion jacket with asymmetrical drape)
  if (norm.includes("indo-western") || norm.includes("western")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-label="Indo-Western icon"
      >
        <path d="M5 4L9 3.5L12 6L15 3.5L19 4L20 8.5L17 9.5V20H7V9.5L4 8.5L5 4Z" />
        <path d="M12 6L15 13L12 20" />
        <path d="M9 11L12 13" />
        <circle cx="13.5" cy="16.5" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  // 7. Festive Wear (Ceremonial radiant diya & celebratory motif)
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Festive Wear icon"
    >
      <path d="M12 3C12 3 9 7 9 10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10C15 7 12 3 12 3Z" />
      <path d="M4 14C4.5 18 8 21 12 21C16 21 19.5 18 20 14H4Z" />
      <path d="M3 14H21" />
      <path d="M12 17V19" />
    </svg>
  );
}
export default function Home() {
  const { categories: dynamicCategories } = useDynamicCategories();
  const [heroBanner, setHeroBanner] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState(null);
  const [liveWeddingBlouses, setLiveWeddingBlouses] = useState(null);

  const fetchHomeData = useCallback(() => {
    bannerApi
      .getBanners("home_hero_1")
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setHeroBanner(res.data[0]);
        }
      })
      .catch(() => {});

    productApi
      .getProducts({ limit: 6, sort: "rating" })
      .then((res) => {
        if (res.success && res.data?.products && res.data.products.length > 0) {
          setTrendingProducts(res.data.products);
        }
      })
      .catch(() => {});

    productApi
      .getProducts({ category: "Bridal Blouses", limit: 20 })
      .then((res) => {
        if (res.success && res.data?.products && res.data.products.length > 0) {
          setLiveWeddingBlouses(res.data.products);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchHomeData();
    const handleUpdate = () => {
      fetchHomeData();
    };
    window.addEventListener("hopo-catalog-update", handleUpdate);
    window.addEventListener("hopo-store-update", handleUpdate);
    return () => {
      window.removeEventListener("hopo-catalog-update", handleUpdate);
      window.removeEventListener("hopo-store-update", handleUpdate);
    };
  }, [fetchHomeData]);
  return (
    <MobileFrame>
      <AppHeader />

      {/* ─── 1. EDITORIAL LUXURY HERO SECTION ─────────────────────────────────── */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF6EE] via-[#F5EEDF] to-[#EFE4D0] border border-[#E5DCCD] shadow-luxury p-5 sm:p-7 lg:p-8 xl:p-9 -mt-1 sm:-mt-2">
        {/* Subtle Decorative Background Mandala / Jali Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C8A96E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#8B1E3F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center">
          {/* Left Hero Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4.5 text-center lg:text-left fade-in-up">
            {/* Eyebrow & Main Headline */}
            <div className="space-y-1 sm:space-y-1.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8B1E3F] block">
                {heroBanner ? "WEDDING & BRIDAL BLOUSES" : "WEDDING BLOUSES"}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[#0D1B2A] leading-[1.06]">
                {heroBanner ? (
                  heroBanner.title
                ) : (
                  <>
                    Intricate <br />
                    <span className="italic font-normal text-[#C8A96E] font-serif">Elegance</span>
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm lg:text-[14px] text-[#6B7280] font-light max-w-lg mx-auto lg:mx-0 pt-1 leading-relaxed">
                {heroBanner
                  ? heroBanner.subtitle
                  : "Handcrafted wedding blouses for your most special moments."}
              </p>
            </div>

            {/* Primary Hero CTA */}
            <div className="pt-1 flex justify-center lg:justify-start">
              <Link
                to={heroBanner?.link_url || "/category/bridal-blouses"}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#5E0F27] shadow-md hover:shadow-lg transition-all smooth-tap text-center flex items-center justify-center gap-2"
              >
                <span>{heroBanner?.cta_text || "EXPLORE WEDDING BLOUSES"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Value Metrics Strip Inside Hero */}
            <div className="pt-3 border-t border-[#E5DCCD]/80 grid grid-cols-3 gap-2 sm:gap-3 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/80 border border-[#E5DCCD] grid place-items-center text-[#8B1E3F] shrink-0 shadow-xs">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-display font-bold text-xs sm:text-sm text-[#0D1B2A]">10K+</p>
                  <p className="text-[9px] sm:text-[10px] text-[#6B7280]">Happy Customers</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/80 border border-[#E5DCCD] grid place-items-center text-[#C8A96E] shrink-0 shadow-xs">
                  <Star className="h-3.5 w-3.5 fill-[#C8A96E]" />
                </div>
                <div>
                  <p className="font-display font-bold text-xs sm:text-sm text-[#0D1B2A]">
                    4.9 / 5.0
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#6B7280]">Customer Rating</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/80 border border-[#E5DCCD] grid place-items-center text-[#2E7D6B] shrink-0 shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-display font-bold text-xs sm:text-sm text-[#0D1B2A]">100%</p>
                  <p className="text-[9px] sm:text-[10px] text-[#6B7280]">Authentic Silk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Circular Moving Wedding Blouse Carousel */}
          <div className="lg:col-span-5 flex justify-center">
            <HomepageWeddingBlouseSlider liveBlouses={liveWeddingBlouses} />
          </div>
        </div>
      </section>

      {/* ─── 2. TRENDING NOW (6-PRODUCT GRID) ─────────────────────────────────── */}
      <section className="space-y-4 my-6 sm:my-8">
        <SectionHeading
          title="TRENDING NOW"
          action="VIEW ALL PRODUCTS"
          actionTo="/listing?sort=popularity"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {(trendingProducts || PRODUCTS.slice(0, 6)).map((product) => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      </section>

      {/* ─── 3. SHOP BY OCCASION ─────────────────────────────────────────────── */}
      <section className="space-y-5 my-6 sm:my-8">
        <SectionHeading title="SHOP BY OCCASION" action="VIEW ALL" actionTo="/categories" />

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-5 text-center">
          {OCCASIONS.map((o) => (
            <Link
              key={o.name}
              to={`/listing?occasion=${encodeURIComponent(o.name)}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative h-18 w-18 sm:h-22 sm:w-22 rounded-full p-[2px] bg-gradient-to-tr from-[#C8A96E] via-[#F4EAD8] to-[#C8A96E] shadow-subtle group-hover:scale-105 group-hover:shadow-luxury transition duration-300">
                <div className="h-full w-full rounded-full overflow-hidden bg-[#EDE6D8]">
                  <img
                    src={o.image}
                    alt={o.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>

                {/* Optional "NEW" Badge */}
                {o.badge && (
                  <span className="absolute -top-1 -right-1 bg-[#8B1E3F] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs uppercase">
                    {o.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-[#0D1B2A] group-hover:text-[#8B1E3F] transition-colors leading-tight">
                {o.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 4. 3-COLUMN PROMOTIONAL FEATURE CARDS ────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch my-8">
        {/* Card 1: Festive Sale */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF5F5] to-[#FCE8ED] border border-[#F5C2CD] p-6 sm:p-7 flex flex-col justify-between shadow-subtle hover:shadow-luxury transition group">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8B1E3F]">
              FESTIVE SALE
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B2A] leading-tight">
              Festive Sale Live
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Across Bridal Blouses, Royal Lehengas, Salwar Suits & Designer Accessories.
            </p>
          </div>

          <div className="pt-6">
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs"
            >
              <span>SHOP NOW</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: New Arrivals */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF6EE] to-[#F4ECE0] border border-[#E5DCCD] p-6 sm:p-7 flex items-center justify-between gap-4 shadow-subtle hover:shadow-luxury transition group">
          <div className="space-y-2 flex-1">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C8A96E]">
              NEW ARRIVALS
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0D1B2A] leading-snug">
              Fresh Styles, <br />
              <span className="italic font-normal text-[#C8A96E]">Just For You</span>
            </h3>
            <div className="pt-2">
              <Link
                to="/listing?sort=newest"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B1E3F] hover:text-[#5E0F27] transition"
              >
                <span>EXPLORE NOW</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="h-28 w-28 rounded-2xl overflow-hidden bg-[#EDE6D8] border border-[#E5DCCD] shrink-0 shadow-xs">
            <img
              src="/images/festive_wear_plum_zari_silk.png"
              alt="New Arrivals"
              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        </div>

        {/* Card 3: AI Style Assistant */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF8F5] to-[#EDE7DD] border border-[#E5DCCD] p-6 sm:p-7 flex items-center justify-between gap-4 shadow-subtle hover:shadow-luxury transition group">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-[#2E7D6B]">
              <Compass className="h-3.5 w-3.5" />
              <span>AI STYLE ASSISTANT</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0D1B2A] leading-snug">
              Find your perfect look
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              Get outfit ideas & match jewelry instantly!
            </p>
            <div className="pt-1">
              <Link
                to="/style-assistant"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0D1B2A] hover:text-[#8B1E3F] transition"
              >
                <span>TRY NOW</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="h-28 w-28 rounded-2xl overflow-hidden bg-[#EDE6D8] border border-[#E5DCCD] shrink-0 shadow-xs">
            <img
              src="/images/lehenga_crimson_royal_bridal.png"
              alt="AI Style Assistant"
              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        </div>
      </section>

      {/* ─── 5. COUTURE BLOUSE ATELIER SHOWCASE ─────────────────────────────── */}
      <section className="space-y-5 my-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5DCCD] pb-3">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B2A]">
              Couture Blouse Atelier
            </h2>
          </div>
          <Link
            to="/category/bridal-blouses"
            className="text-xs font-bold text-[#8B1E3F] uppercase tracking-wider hover:text-[#5E0F27] flex items-center gap-1"
          >
            <span>SHOP ALL BLOUSES</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3-Bento Blouse Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Bridal Blouses */}
          <Link
            to="/category/bridal-blouses"
            className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-luxury border border-[#E5DCCD]"
          >
            <img
              src="/images/bridal_blouse_crimson_peacock.png"
              alt="Bridal Blouse Collection"
              className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 space-y-1 text-white">
              <h3 className="font-display text-xl font-bold text-white">Bridal Zardozi Blouses</h3>
              <p className="text-xs text-white/80 line-clamp-2">
                Hand-embroidered gold bullion, dabka, and pearl necklines in crimson raw silk.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#C8A96E] pt-2 group-hover:underline">
                Explore Zardozi Styles →
              </span>
            </div>
          </Link>

          {/* Card 2: Royal Velvet & Brocades */}
          <Link
            to="/listing?category=Bridal%20Blouses&subcategory=Velvet%20Bridal%20Blouses"
            className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-luxury border border-[#E5DCCD]"
          >
            <img
              src="/images/wedding_blouse_crimson_deep_v.png"
              alt="Royal Velvet & Brocades Bridal Blouse"
              className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 space-y-1 text-white">
              <h3 className="font-display text-xl font-bold text-white">Royal Velvet & Brocades</h3>
              <p className="text-xs text-white/80 line-clamp-2">
                Micro-velvet aari work, Banarasi brocades and statement sweetheart cuts.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#C8A96E] pt-2 group-hover:underline">
                Explore Velvet Styles →
              </span>
            </div>
          </Link>

          {/* Card 3: Craftsmanship & Custom Fitting */}
          <div className="rounded-3xl bg-gradient-to-br from-[#FAF6EE] to-[#EDE5D5] p-6 sm:p-7 flex flex-col justify-between border border-[#C8A96E]/40 shadow-subtle">
            <div className="space-y-3">
              <div className="h-36 rounded-2xl overflow-hidden border border-[#E5DCCD] shadow-xs">
                <img
                  src="/images/blouse_craft_embroidery_detail.png"
                  alt="Zardozi Hand Embroidery Atelier"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0D1B2A]">
                Heirloom Needlework & Perfect Fit
              </h3>
              <ul className="text-xs text-[#6B7280] space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D6B] shrink-0" /> Built-in
                  high-density padded cups
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D6B] shrink-0" /> 2-inch alteration
                  seam margin
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D6B] shrink-0" /> Custom neckline &
                  sleeve options
                </li>
              </ul>
            </div>
            <div className="pt-4">
              <Link
                to="/category/bridal-blouses"
                className="w-full block text-center py-3 rounded-full bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] shadow-xs transition"
              >
                Shop Atelier Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. 2-COLUMN SPLIT: SHOP BY CATEGORY & SHOP BY FABRIC ────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start my-8">
        {/* Left: SHOP BY CATEGORY */}
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold text-[#0D1B2A] uppercase tracking-wider">
            SHOP BY CATEGORY
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dynamicCategories.map((tile) => (
              <Link
                key={tile.name}
                to={`/category/${tile.slug || categoryToSlug(tile.name)}`}
                className="group rounded-2xl border border-[#E5DCCD] bg-white p-4 flex flex-col items-center justify-center text-center hover:border-[#8B1E3F]/50 hover:shadow-subtle transition shadow-xs"
              >
                <div className="h-11 w-11 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] grid place-items-center mb-2 group-hover:scale-110 transition duration-300">
                  <CategoryIcon name={tile.name} className="h-5 w-5" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#0D1B2A] group-hover:text-[#8B1E3F] transition">
                  {tile.name}
                </h4>
                <p className="text-[10px] text-[#6B7280] mt-0.5">
                  {typeof tile.count === "number"
                    ? `${tile.count} ${tile.count === 1 ? "Product" : "Products"}`
                    : tile.count}
                </p>
              </Link>
            ))}
          </div>
          <div className="pt-1">
            <Link
              to="/categories"
              className="text-xs font-bold text-[#8B1E3F] uppercase tracking-wider hover:underline inline-flex items-center gap-1"
            >
              <span>EXPLORE ALL CATEGORIES</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Right: SHOP BY FABRIC */}
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold text-[#0D1B2A] uppercase tracking-wider">
            SHOP BY FABRIC
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FABRICS.map((fabric) => (
              <Link
                key={fabric.name}
                to={`/listing?fabric=${encodeURIComponent(fabric.name)}`}
                className="group relative h-28 sm:h-32 rounded-2xl overflow-hidden shadow-xs border border-[#E5DCCD]"
              >
                <img
                  src={fabric.image}
                  alt={fabric.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white font-display text-sm sm:text-base font-bold">
                  {fabric.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="pt-1">
            <Link
              to="/categories"
              className="text-xs font-bold text-[#8B1E3F] uppercase tracking-wider hover:underline inline-flex items-center gap-1"
            >
              <span>VIEW ALL FABRICS</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 7. LOVED BY OUR CUSTOMERS ───────────────────────────────────────── */}
      <section className="space-y-5 my-8">
        <SectionHeading title="LOVED BY OUR CUSTOMERS" flourish />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CUSTOMER_TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl border border-[#E5DCCD] bg-white p-6 flex flex-col justify-between space-y-3 shadow-subtle"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[#C8A96E]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#C8A96E] text-[#C8A96E]" />
                  ))}
                </div>
                <p className="text-xs text-[#0D1B2A] leading-relaxed italic">"{review.quote}"</p>
              </div>

              <div className="border-t border-[#E5DCCD]/80 pt-3 flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#0D1B2A]">— {review.author}</span>
                {review.verified && (
                  <span className="text-[10px] font-semibold text-[#2E7D6B] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 9. FOLLOW THE HOPO STYLE (@hoposhoponline) ───────────────────────── */}
      <section className="space-y-4 my-8">
        <div>
          <h3 className="font-display text-xl font-bold uppercase tracking-wider text-[#0D1B2A]">
            FOLLOW THE HOPO STYLE
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            <a
              href={BUSINESS_CONFIG.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#8B1E3F] transition"
            >
              @hoposhoponline
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href={BUSINESS_CONFIG.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="View on Instagram"
              className="aspect-square rounded-2xl overflow-hidden bg-[#EDE6D8] border border-[#E5DCCD] shadow-xs group relative block"
            >
              <img
                src={post.image}
                alt="HOPO Instagram"
                className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white">
                <Instagram className="h-5 w-5" />
              </div>
            </a>
          ))}

          {/* 8th CTA Card */}
          <a
            href={BUSINESS_CONFIG.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="aspect-square rounded-2xl bg-[#3d0d1b] text-[#F7F2E9] p-3 flex flex-col items-center justify-center text-center shadow-xs border border-[#C8A96E]/30 hover:brightness-110 transition group"
          >
            <Instagram className="h-6 w-6 text-[#C8A96E] mb-2 group-hover:scale-110 transition" />
            <span className="text-[10px] uppercase font-bold tracking-wider leading-tight">
              VIEW MORE ON INSTAGRAM
            </span>
          </a>
        </div>
      </section>

      {/* ─── 10. 5-POINT QUALITY & AUTHENTICITY GUARANTEE BAR ────────────────── */}
      <GuaranteeBar />

      {/* ─── 11. JOIN THE HOPO CIRCLE (VIP NEWSLETTER) ───────────────────────── */}
      <NewsletterBanner />

      <BottomNav active="home" />
    </MobileFrame>
  );
}
