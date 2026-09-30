import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { MobileFrame, AppHeader, BottomNav } from "@/components/app/MobileShell";
import { ProductCard } from "@/components/app/ProductCard";
import { EmptyState } from "@/components/app/EmptyState";
import {
  filterCatalogProducts,
  categoryToSlug,
  slugToCategory,
  normalizeCategoryName,
  useDynamicCategories,
  getCategoryDefinition,
} from "@/lib/catalog-service";
import { productApi } from "@/services/api/index";
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
const PRICE_RANGES = [
  { label: "Under ₹3,000", min: 0, max: 3000 },
  { label: "₹3,000 – ₹6,000", min: 3000, max: 6000 },
  { label: "₹6,000 – ₹12,000", min: 6000, max: 12000 },
  { label: "₹12,000 – ₹25,000", min: 12000, max: 25000 },
  { label: "Above ₹25,000", min: 25000, max: Infinity },
];
const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Rating", value: "rating" },
  { label: "Discount", value: "discount" },
];
const OCCASION_FILTERS = [
  "Wedding",
  "Reception",
  "Sangeet",
  "Mehendi",
  "Haldi",
  "Festive",
  "Party Wear",
];
const FABRIC_FILTERS = [
  "Raw Silk",
  "Banarasi Brocade",
  "Royal Velvet",
  "Chanderi Silk",
  "Pure Silk",
  "Organza Sheer",
];
const SLEEVE_FILTERS = ["Sleeveless", "Short Sleeve", "Elbow Sleeve", "Full Sleeve", "Puff Sleeve"];
const NECKLINE_FILTERS = ["Sweetheart", "Boat Neck", "Deep V-Neck", "Square Neck", "High Neck"];
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E5DCCD]/80 pb-4 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-[#0D1B2A]"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#6B7280]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#6B7280]" />
        )}
      </button>
      {open && children}
    </div>
  );
}
export function Listing() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories: dynamicCategories } = useDynamicCategories();
  const CATEGORY_NAMES = useMemo(
    () => ["All", ...dynamicCategories.map((c) => c.name)],
    [dynamicCategories],
  );

  // 1. URL-derived Category
  const currentCategoryName = useMemo(() => {
    if (slug) {
      return slugToCategory(slug);
    }
    const catQuery = searchParams.get("category");
    return catQuery ? normalizeCategoryName(catQuery) : undefined;
  }, [slug, searchParams]);
  // Check if unknown category slug was accessed
  const isUnknownSlug = Boolean(slug && !currentCategoryName && dynamicCategories.length > 0);
  // 2. URL-derived Facets
  const activeSubcategory = searchParams.get("subcategory") || undefined;
  const activeFabric = searchParams.get("fabric") || undefined;
  const activeOccasion = searchParams.get("occasion") || undefined;
  const activeDesigner = searchParams.get("designer") || searchParams.get("brand") || undefined;
  const activeSort = searchParams.get("sort") || "popularity";
  const activeMinPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const activeMaxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const activeSleeve = searchParams.get("sleeve") || undefined;
  const activeNeckline = searchParams.get("neckline") || undefined;
  const isDiscountOnly = searchParams.get("discount") === "true";
  // Match price range index if active
  const activePriceRangeIndex = useMemo(() => {
    if (activeMinPrice === undefined && activeMaxPrice === undefined) return null;
    return PRICE_RANGES.findIndex(
      (r) => r.min === (activeMinPrice || 0) && r.max === (activeMaxPrice || Infinity),
    );
  }, [activeMinPrice, activeMaxPrice]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [liveProducts, setLiveProducts] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Synchronize dynamic products from MySQL REST backend
  useEffect(() => {
    let active = true;
    async function fetchLiveProducts() {
      try {
        setCatalogLoading(true);
        const sortMap = {
          popularity: "popular",
          price_asc: "price-asc",
          price_desc: "price-desc",
          rating: "rating",
          newest: "newest",
        };
        const res = await productApi.getProducts({
          category: currentCategoryName,
          fabric: activeFabric,
          occasion: activeOccasion,
          minPrice: activeMinPrice,
          maxPrice: activeMaxPrice,
          sort: sortMap[activeSort] || "popular",
          limit: 100,
        });
        if (active && res && res.success && Array.isArray(res.data?.products)) {
          setLiveProducts(res.data.products);
        }
      } catch {
        // Retain seamless fallback to verified bundled catalog
      } finally {
        if (active) setCatalogLoading(false);
      }
    }
    fetchLiveProducts();

    const handleUpdate = () => {
      fetchLiveProducts();
    };
    window.addEventListener("hopo-catalog-update", handleUpdate);
    window.addEventListener("hopo-store-update", handleUpdate);
    return () => {
      active = false;
      window.removeEventListener("hopo-catalog-update", handleUpdate);
      window.removeEventListener("hopo-store-update", handleUpdate);
    };
  }, [currentCategoryName, activeFabric, activeOccasion, activeMinPrice, activeMaxPrice, activeSort]);

  // 3. Strict Relevance Filter Execution
  const filterResult = useMemo(() => {
    if (isUnknownSlug) {
      return {
        products: [],
        totalCount: 0,
        activeCategoryName: undefined,
        categoryDefinition: undefined,
        isCategoryNotFound: true,
      };
    }
    return filterCatalogProducts(
      {
        category: currentCategoryName,
        categorySlug: slug,
        subcategory: activeSubcategory,
        fabric: activeFabric,
        occasion: activeOccasion,
        designer: activeDesigner,
        sort: activeSort,
        minPrice: activeMinPrice,
        maxPrice: activeMaxPrice,
        discountOnly: isDiscountOnly,
        sleeve: activeSleeve,
        neckline: activeNeckline,
      },
      liveProducts,
    );
  }, [
    isUnknownSlug,
    currentCategoryName,
    slug,
    activeSubcategory,
    activeFabric,
    activeOccasion,
    activeDesigner,
    activeSort,
    activeMinPrice,
    activeMaxPrice,
    isDiscountOnly,
    activeSleeve,
    activeNeckline,
    liveProducts,
  ]);
  const filteredProducts = filterResult.products;
  const categoryDef = filterResult.categoryDefinition;
  // 4. Dynamic Page Heading & Title
  const pageHeading = useMemo(() => {
    if (isUnknownSlug) return "CATEGORY NOT FOUND";
    if (currentCategoryName) return currentCategoryName.toUpperCase();
    if (activeDesigner) return `${activeDesigner.toUpperCase()} COUTURE`;
    if (activeFabric) return `${activeFabric.toUpperCase()} WEAVES`;
    if (activeOccasion) return activeOccasion.toUpperCase();
    if (isDiscountOnly) return "FESTIVE SALE";
    return "ALL COLLECTIONS";
  }, [
    isUnknownSlug,
    currentCategoryName,
    activeDesigner,
    activeFabric,
    activeOccasion,
    isDiscountOnly,
  ]);
  useEffect(() => {
    const title = currentCategoryName
      ? `${currentCategoryName} | HOPO SHOP`
      : `${pageHeading} | HOPO SHOP`;
    document.title = title;
  }, [currentCategoryName, pageHeading]);
  // Facet toggles that synchronize directly with URL search params
  const updateFacetParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else if (next.get(key) === value) {
      next.delete(key); // Toggle off if clicked again
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };
  const handlePriceRangeSelect = (idx) => {
    const next = new URLSearchParams(searchParams);
    if (activePriceRangeIndex === idx) {
      next.delete("minPrice");
      next.delete("maxPrice");
    } else {
      const r = PRICE_RANGES[idx];
      next.set("minPrice", String(r.min));
      if (r.max !== Infinity) {
        next.set("maxPrice", String(r.max));
      } else {
        next.delete("maxPrice");
      }
    }
    setSearchParams(next, { replace: true });
  };
  const handleSortSelect = (val) => {
    const next = new URLSearchParams(searchParams);
    next.set("sort", val);
    setSearchParams(next, { replace: true });
  };
  const handleCategorySelect = (catName) => {
    if (catName === "All") {
      navigate("/listing");
    } else {
      const targetSlug = categoryToSlug(catName);
      navigate(`/category/${targetSlug}`);
    }
  };
  // Clear sub-filters while preserving current category scope
  const clearSubFilters = () => {
    const next = new URLSearchParams();
    if (!slug && currentCategoryName) {
      next.set("category", currentCategoryName);
    }
    setSearchParams(next, { replace: true });
  };
  // Reset all filters including category
  const resetAll = () => {
    navigate("/listing");
  };
  const activeFilterCount =
    (currentCategoryName ? 1 : 0) +
    (activeSubcategory ? 1 : 0) +
    (activePriceRangeIndex !== null ? 1 : 0) +
    (activeFabric ? 1 : 0) +
    (activeOccasion ? 1 : 0) +
    (activeDesigner ? 1 : 0) +
    (activeSleeve ? 1 : 0) +
    (activeNeckline ? 1 : 0) +
    (isDiscountOnly ? 1 : 0);
  const FilterPanel = () => (
    <div className="space-y-1">
      {/* Category selector */}
      <FilterSection title="Categories">
        <div className="space-y-1">
          {CATEGORY_NAMES.map((cat) => {
            const isSelected = cat === "All" ? !currentCategoryName : currentCategoryName === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`flex items-center justify-between w-full text-left text-xs sm:text-sm py-1.5 rounded-lg px-2.5 transition ${isSelected ? "text-[#8B1E3F] font-semibold bg-[#8B1E3F]/10" : "text-[#6B7280] hover:text-[#0D1B2A]"}`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#8B1E3F]" />
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}
                  <span className="truncate">{cat}</span>
                </div>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection title="Price Range">
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range, i) => (
            <button
              key={range.label}
              onClick={() => handlePriceRangeSelect(i)}
              className={`flex items-center gap-2 w-full text-left text-xs sm:text-sm py-1.5 rounded-lg px-2.5 transition ${activePriceRangeIndex === i ? "text-[#8B1E3F] font-semibold bg-[#8B1E3F]/10" : "text-[#6B7280] hover:text-[#0D1B2A]"}`}
            >
              <span
                className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center transition ${activePriceRangeIndex === i ? "border-[#8B1E3F] bg-[#8B1E3F]" : "border-[#E5DCCD] bg-white"}`}
              >
                {activePriceRangeIndex === i && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Occasion Filter */}
      <FilterSection title="Occasion">
        <div className="flex flex-wrap gap-1.5 pt-1">
          {OCCASION_FILTERS.map((occ) => {
            const isSelected = activeOccasion === occ;
            return (
              <button
                key={occ}
                onClick={() => updateFacetParam("occasion", occ)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isSelected
                    ? "bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs"
                    : "bg-white border-[#E5DCCD] hover:border-[#8B1E3F]/50 text-[#6B7280]"
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Fabric Filter */}
      <FilterSection title="Fabric">
        <div className="flex flex-wrap gap-1.5 pt-1">
          {FABRIC_FILTERS.map((fab) => {
            const isSelected = activeFabric === fab;
            return (
              <button
                key={fab}
                onClick={() => updateFacetParam("fabric", fab)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isSelected
                    ? "bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs"
                    : "bg-white border-[#E5DCCD] hover:border-[#8B1E3F]/50 text-[#6B7280]"
                }`}
              >
                {fab}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Sleeve Style Filter */}
      <FilterSection title="Sleeve Style">
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SLEEVE_FILTERS.map((slv) => {
            const isSelected = activeSleeve === slv;
            return (
              <button
                key={slv}
                onClick={() => updateFacetParam("sleeve", slv)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isSelected
                    ? "bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs"
                    : "bg-white border-[#E5DCCD] hover:border-[#8B1E3F]/50 text-[#6B7280]"
                }`}
              >
                {slv}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Neckline Style Filter */}
      <FilterSection title="Neckline">
        <div className="flex flex-wrap gap-1.5 pt-1">
          {NECKLINE_FILTERS.map((nck) => {
            const isSelected = activeNeckline === nck;
            return (
              <button
                key={nck}
                onClick={() => updateFacetParam("neckline", nck)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isSelected
                    ? "bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs"
                    : "bg-white border-[#E5DCCD] hover:border-[#8B1E3F]/50 text-[#6B7280]"
                }`}
              >
                {nck}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
  return (
    <MobileFrame>
      <AppHeader title={pageHeading} back />

      {/* Interactive Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-[#6B7280] -mt-1 mb-2 overflow-x-auto scrollbar-none py-1"
      >
        <Link to="/home" className="hover:text-[#8B1E3F] transition shrink-0">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
        <Link to="/categories" className="hover:text-[#8B1E3F] transition shrink-0">
          Categories
        </Link>
        {currentCategoryName && (
          <>
            <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
            <span className="font-semibold text-[#8B1E3F] shrink-0">{currentCategoryName}</span>
          </>
        )}
        {activeSubcategory && (
          <>
            <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
            <span className="font-semibold text-[#0D1B2A] shrink-0">{activeSubcategory}</span>
          </>
        )}
        {activeFabric && (
          <>
            <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
            <span className="font-medium text-[#0D1B2A] shrink-0">Fabric: {activeFabric}</span>
          </>
        )}
        {activeOccasion && (
          <>
            <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
            <span className="font-medium text-[#0D1B2A] shrink-0">Occasion: {activeOccasion}</span>
          </>
        )}
        {activeDesigner && (
          <>
            <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
            <span className="font-medium text-[#0D1B2A] shrink-0">Designer: {activeDesigner}</span>
          </>
        )}
      </nav>

      {/* Category Hero Showcase Banner (Only when a valid category is active) */}
      {categoryDef && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#5E0F27] via-[#8B1E3F] to-[#2E121B] text-white p-6 sm:p-8 shadow-luxury border border-[#C8A96E]/40 mb-3">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C8A96E] uppercase">
              {categoryDef.eyebrow || `${filteredProducts.length} Exclusive Ensembles`}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl text-white font-normal leading-tight">
              {categoryDef.slug === "night-suits" ? "Relax in Style" : categoryDef.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#F7F2E9]/85 font-light leading-relaxed">
              {categoryDef.slug === "night-suits"
                ? "Soft fabrics, elegant designs and everyday comfort — because comfort looks good on you."
                : categoryDef.description}
            </p>
            {categoryDef.slug === "night-suits" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("product-grid");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C8A96E] text-[#0D1B2A] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition shadow-md cursor-pointer"
                >
                  <span>SHOP NIGHT SUITS</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 sm:w-1/2 opacity-25 bg-cover bg-top pointer-events-none hidden md:block"
            style={{ backgroundImage: `url(${categoryDef.image})` }}
          />
        </div>
      )}

      {/* Top Bar: Active Count + Sort & Filter Controls */}
      <div className="flex items-center justify-between gap-4 mt-2 flex-wrap">
        <p className="text-xs text-[#6B7280] font-medium">
          Showing <span className="font-bold text-[#0D1B2A]">{filteredProducts.length}</span> luxury
          pieces
          {currentCategoryName && (
            <span>
              {" "}
              in <strong className="text-[#8B1E3F] font-semibold">{currentCategoryName}</strong>
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative group">
            <button className="rounded-xl border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-semibold flex items-center gap-2 hover:border-[#8B1E3F]/50 transition text-[#0D1B2A] shadow-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#C8A96E]" />
              <span>Sort: {SORT_OPTIONS.find((s) => s.value === activeSort)?.label}</span>
            </button>
            <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-48 rounded-xl border border-[#E5DCCD] bg-white shadow-luxury z-50 py-1 overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortSelect(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#F7F2E9] transition flex items-center gap-2 ${activeSort === opt.value ? "text-[#8B1E3F] font-bold bg-[#8B1E3F]/5" : "text-[#0D1B2A]"}`}
                >
                  {activeSort === opt.value && <Check className="h-3 w-3 text-[#8B1E3F]" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Filter Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex rounded-xl border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-semibold items-center gap-2 hover:border-[#8B1E3F]/50 transition text-[#0D1B2A] shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#C8A96E]" />
            <span>{sidebarOpen ? "Hide" : "Show"} Filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#8B1E3F] text-white h-4 w-4 text-[10px] font-bold grid place-items-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Mobile Filter Drawer Trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden rounded-xl border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-semibold flex items-center gap-2 hover:border-[#8B1E3F]/50 transition text-[#0D1B2A] shadow-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#C8A96E]" />
            <span>Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Category Selector Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 pt-1">
        {CATEGORY_NAMES.map((label) => {
          const isSelected = label === "All" ? !currentCategoryName : currentCategoryName === label;
          return (
            <button
              key={label}
              onClick={() => handleCategorySelect(label)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs"
                  : "bg-white border-[#E5DCCD] hover:border-[#8B1E3F]/50 text-[#6B7280]"
              }`}
            >
              {isSelected && label !== "All" && <Check className="h-3 w-3" />}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Badges Row */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-[#6B7280] font-medium">Applied:</span>

          {currentCategoryName && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Category: {currentCategoryName}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => navigate("/listing")}
              />
            </span>
          )}

          {activeSubcategory && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Subcategory: {activeSubcategory}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFacetParam("subcategory", undefined)}
              />
            </span>
          )}

          {activePriceRangeIndex !== null && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              {PRICE_RANGES[activePriceRangeIndex].label}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => handlePriceRangeSelect(activePriceRangeIndex)}
              />
            </span>
          )}

          {activeFabric && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Fabric: {activeFabric}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFacetParam("fabric", undefined)}
              />
            </span>
          )}

          {activeOccasion && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Occasion: {activeOccasion}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFacetParam("occasion", undefined)}
              />
            </span>
          )}

          {activeDesigner && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Designer: {activeDesigner}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFacetParam("designer", undefined)}
              />
            </span>
          )}

          {activeSleeve && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Sleeve: {activeSleeve}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFacetParam("sleeve", undefined)}
              />
            </span>
          )}

          {activeNeckline && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Neckline: {activeNeckline}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFacetParam("neckline", undefined)}
              />
            </span>
          )}

          {isDiscountOnly && (
            <span className="inline-flex items-center gap-1 bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/30 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Special Offers Only
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => updateFacetParam("discount", undefined)}
              />
            </span>
          )}

          <button
            onClick={clearSubFilters}
            className="text-xs text-[#8B1E3F] underline font-semibold ml-1 hover:text-[#5E0F27]"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="flex gap-8 items-start mt-4">
        {/* Desktop Sidebar */}
        {sidebarOpen && (
          <aside className="hidden lg:block w-64 shrink-0 rounded-2xl border border-[#E5DCCD] bg-white p-5 shadow-subtle sticky top-24">
            <div className="flex items-center justify-between mb-4 border-b border-[#E5DCCD] pb-3">
              <h2 className="font-display font-bold text-base text-[#0D1B2A]">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearSubFilters}
                  className="text-xs text-[#8B1E3F] font-bold hover:underline"
                >
                  Reset ({activeFilterCount})
                </button>
              )}
            </div>
            <FilterPanel />
          </aside>
        )}

        {/* Products Grid / Strict Empty State */}
        <div className="flex-1 min-w-0">
          {isUnknownSlug ? (
            <div className="py-12 bg-white rounded-3xl border border-[#E5DCCD] p-8 text-center shadow-subtle">
              <EmptyState
                icon={Sparkles}
                title="Category Not Found"
                description={`The category "${slug}" does not exist in our catalog.`}
                actionLabel="Browse All Categories"
                onAction={() => navigate("/categories")}
              />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 bg-white rounded-3xl border border-[#E5DCCD] p-8 text-center shadow-subtle space-y-4">
              <EmptyState
                icon={Sparkles}
                title={
                  currentCategoryName
                    ? `No ${currentCategoryName} match your filters`
                    : "No matching ensembles found"
                }
                description="Try clearing some of your facet selections to view all available styles in this collection."
                actionLabel="Clear Filters"
                onAction={clearSubFilters}
              />
              <div className="pt-2">
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs text-[#8B1E3F] font-semibold hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Browse All Categories</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                id="product-grid"
                className={`grid gap-4 md:gap-5 ${sidebarOpen ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}
              >
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>

              {/* Dynamic Scoped Pagination */}
              {filteredProducts.length > 8 && (
                <div className="flex items-center justify-center gap-2 mt-10 pb-6">
                  <button className="h-9 w-9 rounded-xl border text-xs font-bold bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs">
                    1
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-84 max-w-[85vw] bg-[#F7F2E9] shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="sticky top-0 bg-[#F7F2E9] border-b border-[#E5DCCD] px-5 py-4 flex items-center justify-between z-10">
                <h2 className="font-display font-bold text-lg text-[#0D1B2A]">Filters</h2>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="rounded-full p-2 hover:bg-[#EDE6D8] text-[#0D1B2A]"
                  aria-label="Close filter drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-5 py-4">
                <FilterPanel />
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#F7F2E9] border-t border-[#E5DCCD] px-5 py-4 flex gap-2">
              <button
                onClick={clearSubFilters}
                className="flex-1 rounded-full border border-[#E5DCCD] bg-white text-[#0D1B2A] py-3 text-xs uppercase font-bold tracking-wider hover:bg-[#FAF6EE] transition"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-2 rounded-full bg-[#8B1E3F] text-white py-3 text-xs uppercase font-bold tracking-widest hover:bg-[#5E0F27] shadow-md transition"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="home" />
    </MobileFrame>
  );
}
export default Listing;
